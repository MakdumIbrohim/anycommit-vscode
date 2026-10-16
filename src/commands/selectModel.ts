import * as vscode from 'vscode';
import { getAnyCommitConfig, updateAnyCommitConfig } from '../config';
import { listModels } from '../core/client';
import { resolveApiKey } from '../secrets';

export async function handleSelectModel(context: vscode.ExtensionContext): Promise<void> {
  const config = getAnyCommitConfig();
  const { provider, resolvedBaseUrl, model: currentModel, apiKey: settingsApiKey } = config;

  if (!resolvedBaseUrl) {
    vscode.window.showErrorMessage(
      'AnyCommit: Base URL is not configured. Please set a base URL or choose another provider.'
    );
    return;
  }

  const apiKey = await resolveApiKey(context.secrets, provider, settingsApiKey);

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
          baseUrl: resolvedBaseUrl,
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
        value: currentModel,
        ignoreFocusOut: true
      });
      if (entered !== undefined && entered.trim()) {
        await updateAnyCommitConfig('model', entered.trim());
        vscode.window.showInformationMessage(`AnyCommit: Model set to "${entered.trim()}".`);
      }
    }
    return;
  }

  if (models.length === 0) {
    vscode.window.showWarningMessage('AnyCommit: No models returned by the provider.');
    return;
  }

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

  await updateAnyCommitConfig('model', chosenModel);
  vscode.window.showInformationMessage(`AnyCommit: Model set to "${chosenModel}".`);
}
