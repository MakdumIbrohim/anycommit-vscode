import * as vscode from 'vscode';
import { PROVIDER_PRESETS, ProviderId, resolveBaseUrl } from './core/providers';
import { normalizeBaseUrl, isNonLocalhostHttp } from './core/url';
import { filterAndTruncateDiff } from './core/diff';
import { buildMessages, CommitStyle } from './core/prompt';
import { cleanModelOutput } from './core/clean';
import { chatCompleteStream, listModels } from './core/client';
import { getApiKey, setApiKey, clearApiKey } from './secrets';
import {
  getGitApi,
  getActiveRepository,
  getDiffFromRepository,
  setCommitMessage
} from './git';

export function activate(context: vscode.ExtensionContext) {
  // Command: Set API Key
  const setApiKeyCmd = vscode.commands.registerCommand('aiCommit.setApiKey', async () => {
    const config = vscode.workspace.getConfiguration('aiCommit');
    const provider = config.get<string>('provider') || '9router';

    const input = await vscode.window.showInputBox({
      title: `AnyCommit: Set API Key (${provider})`,
      prompt: `Enter API key for ${provider}. Leave empty for gateways without authentication.`,
      password: true,
      ignoreFocusOut: true
    });

    if (input === undefined) {
      return;
    }

    await setApiKey(context.secrets, provider, input);
    if (input.trim()) {
      vscode.window.showInformationMessage(`AnyCommit: API key for "${provider}" saved.`);
    } else {
      vscode.window.showInformationMessage(`AnyCommit: API key for "${provider}" cleared.`);
    }
  });

  // Command: Clear API Key
  const clearApiKeyCmd = vscode.commands.registerCommand('aiCommit.clearApiKey', async () => {
    const config = vscode.workspace.getConfiguration('aiCommit');
    const provider = config.get<string>('provider') || '9router';

    await clearApiKey(context.secrets, provider);
    vscode.window.showInformationMessage(`AnyCommit: API key for "${provider}" cleared.`);
  });

  // Command: Select Provider
  const selectProviderCmd = vscode.commands.registerCommand('aiCommit.selectProvider', async () => {
    const config = vscode.workspace.getConfiguration('aiCommit');
    const currentProvider = config.get<string>('provider') || '9router';

    const items = Object.values(PROVIDER_PRESETS).map((p) => ({
      label: p.id === currentProvider ? `$(check) ${p.name}` : p.name,
      description: p.defaultBaseUrl || '(requires custom base URL)',
      detail: p.isLocal
        ? 'Local gateway · API key optional'
        : p.requiresApiKey
        ? 'Cloud provider · API key required'
        : 'Custom endpoint',
      id: p.id
    }));

    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select AI provider preset for AnyCommit'
    });

    if (!picked) {
      return;
    }

    await config.update('provider', picked.id, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`AnyCommit: Provider set to "${picked.id}".`);

    if (picked.id === 'custom') {
      const baseUrl = config.get<string>('baseUrl');
      if (!baseUrl) {
        const entered = await vscode.window.showInputBox({
          title: 'AnyCommit: Set Base URL for Custom Provider',
          prompt: 'Enter the OpenAI-compatible base URL (e.g. http://localhost:8000/v1)',
          ignoreFocusOut: true
        });
        if (entered?.trim()) {
          await config.update('baseUrl', entered.trim(), vscode.ConfigurationTarget.Global);
        }
      }
    }
  });

  // Command: Select Model
  const selectModelCmd = vscode.commands.registerCommand('aiCommit.selectModel', async () => {
    const config = vscode.workspace.getConfiguration('aiCommit');
    const provider = config.get<string>('provider') || '9router';
    const baseUrl = resolveBaseUrl(provider, config.get<string>('baseUrl'));

    if (!baseUrl) {
      vscode.window.showErrorMessage(
        'AnyCommit: Base URL is not configured. Please set a base URL or choose another provider.'
      );
      return;
    }

    const apiKey = await getApiKey(context.secrets, provider);

    let models: string[] = [];
    try {
      models = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `AnyCommit: Fetching models from ${provider}...`,
          cancellable: true
        },
        async (_progress, token) => {
          const controller = new AbortController();
          token.onCancellationRequested(() => controller.abort());
          return await listModels({
            baseUrl,
            apiKey,
            timeoutSeconds: 15,
            signal: controller.signal
          });
        }
      );
    } catch (err: any) {
      const manualChoice = await vscode.window.showWarningMessage(
        `AnyCommit: Failed to fetch models (${err.message}). Enter model manually?`,
        'Enter Manually',
        'Cancel'
      );
      if (manualChoice === 'Enter Manually') {
        const entered = await vscode.window.showInputBox({
          title: `AnyCommit: Enter Model Name for ${provider}`,
          prompt: 'Model or combo name (e.g. cc/claude-opus-4-6, premium-coding, auto/best-coding)',
          value: config.get<string>('model') || '',
          ignoreFocusOut: true
        });
        if (entered !== undefined && entered.trim()) {
          await config.update('model', entered.trim(), vscode.ConfigurationTarget.Global);
          vscode.window.showInformationMessage(`AnyCommit: Model set to "${entered.trim()}".`);
        }
      }
      return;
    }

    if (models.length === 0) {
      vscode.window.showWarningMessage('AnyCommit: No models returned by the provider.');
      return;
    }

    const currentModel = config.get<string>('model') || '';
    const items = models.map((m) => ({
      label: m === currentModel ? `$(check) ${m}` : m,
      modelId: m
    }));
    items.push({
      label: '$(edit) Enter custom model name...',
      modelId: '__custom__'
    });

    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: `Select model for ${provider} (current: ${currentModel || 'none'})`
    });

    if (!picked) {
      return;
    }

    let chosenModel = picked.modelId;
    if (chosenModel === '__custom__') {
      const entered = await vscode.window.showInputBox({
        title: `AnyCommit: Enter Model Name for ${provider}`,
        prompt: 'Model or combo name',
        value: currentModel,
        ignoreFocusOut: true
      });
      if (!entered?.trim()) {
        return;
      }
      chosenModel = entered.trim();
    }

    await config.update('model', chosenModel, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`AnyCommit: Model set to "${chosenModel}".`);
  });

  // Command: Generate Commit Message
  const generateCmd = vscode.commands.registerCommand('aiCommit.generate', async () => {
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

    const config = vscode.workspace.getConfiguration('aiCommit');
    const provider = config.get<string>('provider') || '9router';
    const baseUrl = resolveBaseUrl(provider, config.get<string>('baseUrl'));

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

    const model = config.get<string>('model')?.trim();
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

    const preset = PROVIDER_PRESETS[provider as ProviderId];
    const apiKey = await getApiKey(context.secrets, provider);
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

    const maxDiffChars = config.get<number>('maxDiffChars') ?? 20000;
    const language = config.get<string>('language') || 'English';
    const style = (config.get<string>('style') as CommitStyle) || 'conventional';
    const includeBody = config.get<boolean>('includeBody') ?? false;
    const extraInstructions = config.get<string>('extraInstructions') || '';
    const temperature = config.get<number>('temperature') ?? 0.2;
    const maxTokens = config.get<number>('maxTokens') ?? 400;
    const timeoutSeconds = config.get<number>('timeoutSeconds') ?? 60;

    const filteredDiff = filterAndTruncateDiff(diffResult.diff, maxDiffChars);
    const messages = buildMessages({
      diff: filteredDiff,
      style,
      language,
      includeBody,
      extraInstructions
    });

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.SourceControl,
        title: 'Generating commit message...',
        cancellable: true
      },
      async (_progress, token) => {
        const controller = new AbortController();
        token.onCancellationRequested(() => controller.abort());

        let accumulated = '';
        try {
          const rawResult = await chatCompleteStream({
            baseUrl,
            apiKey,
            model,
            messages,
            temperature,
            maxTokens,
            timeoutSeconds,
            signal: controller.signal,
            onToken: (tokenDelta) => {
              accumulated += tokenDelta;
              setCommitMessage(repo, accumulated);
            }
          });

          const cleaned = cleanModelOutput(rawResult);
          setCommitMessage(repo, cleaned);
        } catch (err: any) {
          if (controller.signal.aborted) {
            vscode.window.showInformationMessage('AnyCommit: Generation cancelled.');
            return;
          }
          vscode.window.showErrorMessage(`AnyCommit: ${err.message}`);
        }
      }
    );
  });

  context.subscriptions.push(
    setApiKeyCmd,
    clearApiKeyCmd,
    selectProviderCmd,
    selectModelCmd,
    generateCmd
  );
}

export function deactivate() {}
