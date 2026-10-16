import * as vscode from 'vscode';
import { getAnyCommitConfig, updateAnyCommitConfig } from '../config';
import { PROVIDER_PRESETS } from '../core/providers';

export async function handleSelectProvider(): Promise<void> {
  const config = getAnyCommitConfig();
  const currentProvider = config.provider;

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

  await updateAnyCommitConfig('provider', picked.id);
  vscode.window.showInformationMessage(`AnyCommit: Provider set to "${picked.id}".`);

  if (picked.id === 'custom') {
    const freshConfig = getAnyCommitConfig();
    if (!freshConfig.baseUrl) {
      const entered = await vscode.window.showInputBox({
        title: 'AnyCommit: Set Base URL for Custom Provider',
        prompt: 'Enter the OpenAI-compatible base URL (e.g. http://localhost:8000/v1)',
        ignoreFocusOut: true
      });
      if (entered?.trim()) {
        await updateAnyCommitConfig('baseUrl', entered.trim());
      }
    }
  }
}
