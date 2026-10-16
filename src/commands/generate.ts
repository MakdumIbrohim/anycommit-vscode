import * as vscode from 'vscode';
import { getAnyCommitConfig } from '../config';
import { BuiltinProviderId, PROVIDER_PRESETS } from '../core/providers';
import { normalizeBaseUrl, isNonLocalhostHttp } from '../core/url';
import { filterAndTruncateDiff } from '../core/diff';
import { buildMessages } from '../core/prompt';
import { extractTicket } from '../core/branch';
import { extractFilePathsFromDiff, detectScopeFromFiles } from '../core/scope';
import { cleanModelOutput } from '../core/clean';
import { chatComplete, chatCompleteStream } from '../core/client';
import { resolveApiKey } from '../secrets';
import {
  getGitApi,
  getActiveRepository,
  getDiffFromRepository,
  setCommitMessage,
  getRecentCommitMessages,
  getCurrentBranchName
} from '../git';

export interface GenerateOptions {
  isRegenerate?: boolean;
}

export async function handleGenerate(
  context: vscode.ExtensionContext,
  options?: GenerateOptions
): Promise<void> {
  const gitApi = getGitApi();
  if (!gitApi) {
    vscode.window.showErrorMessage('AnyCommit: Git extension is not available.');
    return;
  }

  const repo = getActiveRepository(gitApi);
  if (!repo) {
    vscode.window.showErrorMessage('AnyCommit: No Git repository found in workspace.');
    return;
  }

  const diffResult = await getDiffFromRepository(repo);
  if (!diffResult) {
    return;
  }

  const config = getAnyCommitConfig();
  const {
    provider,
    resolvedBaseUrl: baseUrl,
    model,
    language,
    style,
    includeBody,
    useRecentCommits,
    extractTicketFromBranch,
    ticketPattern,
    extraInstructions,
    maxDiffChars,
    temperature,
    maxTokens,
    timeoutSeconds,
    apiKey: settingsApiKey
  } = config;

  if (!baseUrl) {
    vscode.window.showErrorMessage(
      'AnyCommit: Base URL is not configured. Please set a base URL or select another provider.'
    );
    return;
  }

  // Security warning for unencrypted remote HTTP
  if (isNonLocalhostHttp(baseUrl)) {
    vscode.window.showWarningMessage(
      'AnyCommit Warning: Base URL uses unencrypted HTTP to a remote host. API keys and diffs are sent in plaintext.'
    );
  }

  const urlNorm = normalizeBaseUrl(baseUrl);
  if (urlNorm.warning) {
    vscode.window.showWarningMessage(`AnyCommit: ${urlNorm.warning}`);
  }

  if (!model) {
    const action = await vscode.window.showErrorMessage(
      'AnyCommit: No model configured. Please select or enter a model first.',
      'Select Model'
    );
    if (action === 'Select Model') {
      await vscode.commands.executeCommand('aiCommit.selectModel');
    }
    return;
  }

  const preset = PROVIDER_PRESETS[provider as BuiltinProviderId];
  const apiKey = await resolveApiKey(context.secrets, provider, settingsApiKey);
  if (preset?.requiresApiKey && !apiKey) {
    const action = await vscode.window.showErrorMessage(
      `AnyCommit: Provider "${provider}" requires an API key.`,
      'Set API Key'
    );
    if (action === 'Set API Key') {
      await vscode.commands.executeCommand('aiCommit.setApiKey');
    }
    return;
  }

  let recentCommits: string[] | undefined;
  if (useRecentCommits) {
    recentCommits = await getRecentCommitMessages(repo, 5);
  }

  let ticket: string | undefined;
  if (extractTicketFromBranch) {
    const branchName = getCurrentBranchName(repo);
    ticket = extractTicket(branchName, ticketPattern);
  }

  let scope: string | undefined;
  if (config.autoDetectScope && !ticket && style === 'conventional') {
    const filePaths = extractFilePathsFromDiff(diffResult.diff);
    scope = detectScopeFromFiles(filePaths);
  }

  const filteredDiff = filterAndTruncateDiff(diffResult.diff, maxDiffChars);
  const messages = buildMessages({
    diff: filteredDiff,
    style,
    language,
    includeBody,
    extraInstructions,
    recentCommits,
    ticket,
    scope
  });

  if (options?.isRegenerate) {
    setCommitMessage(repo, '');
  }

  const effectiveTemperature = options?.isRegenerate
    ? Math.min(1.0, Number((temperature + 0.2).toFixed(2)))
    : temperature;
  const progressTitle = options?.isRegenerate
    ? 'Regenerating commit message...'
    : 'Generating commit message...';

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.SourceControl,
      title: progressTitle,
      cancellable: true
    },
    async (_progress, token) => {
      const controller = new AbortController();
      token.onCancellationRequested(() => controller.abort());

      let accumulated = '';
      let rawResult = '';
      let isReasoning = false;

      try {
        rawResult = await chatCompleteStream({
          baseUrl,
          apiKey,
          model,
          messages,
          temperature: effectiveTemperature,
          maxTokens,
          timeoutSeconds,
          signal: controller.signal,
          onToken: (tokenDelta) => {
            accumulated += tokenDelta;
            const liveCleaned = cleanModelOutput(accumulated);
            if (liveCleaned) {
              setCommitMessage(repo, liveCleaned);
            } else if (
              !isReasoning &&
              (accumulated.includes('<think>') || accumulated.includes('[think]'))
            ) {
              isReasoning = true;
              _progress.report({ message: 'Thinking...' });
            }
          }
        });
      } catch (streamErr: any) {
        if (controller.signal.aborted) {
          vscode.window.showInformationMessage('AnyCommit: Generation cancelled.');
          return;
        }

        // Auto fallback to non-streaming if stream mode fails on model/gateway
        const isStreamUnsupported =
          streamErr?.statusCode === 400 ||
          streamErr?.statusCode === 422 ||
          streamErr?.message?.toLowerCase().includes('stream') ||
          streamErr?.message?.toLowerCase().includes('sse');

        if (isStreamUnsupported) {
          try {
            rawResult = await chatComplete({
              baseUrl,
              apiKey,
              model,
              messages,
              temperature: effectiveTemperature,
              maxTokens,
              timeoutSeconds,
              signal: controller.signal
            });
          } catch (nonStreamErr) {
            throw nonStreamErr;
          }
        } else {
          throw streamErr;
        }
      }

      try {
        const cleaned = cleanModelOutput(rawResult);
        if (cleaned) {
          setCommitMessage(repo, cleaned);
        } else {
          vscode.window.showWarningMessage(
            'AnyCommit: Model returned an empty commit message. It may have exhausted token limit while reasoning. Try increasing aiCommit.maxTokens in settings.'
          );
        }
      } catch (err: any) {
        if (controller.signal.aborted) {
          vscode.window.showInformationMessage('AnyCommit: Generation cancelled.');
          return;
        }
        if (err?.message?.includes('API key missing or invalid') || err?.statusCode === 401) {
          const action = await vscode.window.showErrorMessage(
            `AnyCommit: ${err.message}`,
            'Set API Key'
          );
          if (action === 'Set API Key') {
            await vscode.commands.executeCommand('aiCommit.setApiKey');
          }
          return;
        }
        vscode.window.showErrorMessage(`AnyCommit: ${err.message}`);
      }
    }
  );
}
