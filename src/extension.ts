import * as vscode from 'vscode';
import { PROVIDER_PRESETS, ProviderId } from './core/providers';
import { getApiKey, setApiKey, clearApiKey } from './secrets';

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

  // Stub commands for next phases
  const generateCmd = vscode.commands.registerCommand('aiCommit.generate', async () => {
    vscode.window.showInformationMessage('AnyCommit: Not implemented yet');
  });

  const selectModelCmd = vscode.commands.registerCommand('aiCommit.selectModel', async () => {
    vscode.window.showInformationMessage('AnyCommit: Not implemented yet');
  });

  context.subscriptions.push(
    setApiKeyCmd,
    clearApiKeyCmd,
    selectProviderCmd,
    generateCmd,
    selectModelCmd
  );
}

export function deactivate() {}
