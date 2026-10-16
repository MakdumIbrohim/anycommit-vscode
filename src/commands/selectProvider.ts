import * as vscode from 'vscode';
import { getAnyCommitConfig, updateAnyCommitConfig } from '../config';
import { CustomProviderConfig, PROVIDER_PRESETS } from '../core/providers';

interface ProviderQuickPickItem extends vscode.QuickPickItem {
  id?: string;
  isAction?: boolean;
}

export async function handleSelectProvider(): Promise<void> {
  const config = getAnyCommitConfig();
  const currentProvider = config.provider.toLowerCase();

  const items: ProviderQuickPickItem[] = [];

  // 1. Built-in presets
  for (const p of Object.values(PROVIDER_PRESETS)) {
    if (p.id === 'custom') {
      continue;
    }
    const isSelected = p.id.toLowerCase() === currentProvider;
    items.push({
      label: isSelected ? `$(check) ${p.name}` : p.name,
      description: p.defaultBaseUrl,
      detail: p.isLocal ? 'Local gateway · API key optional' : 'Cloud provider · API key required',
      id: p.id
    });
  }

  // 2. User-defined custom providers
  if (config.customProviders.length > 0) {
    for (const cp of config.customProviders) {
      const isSelected = cp.id.toLowerCase() === currentProvider;
      items.push({
        label: isSelected ? `$(check) ${cp.name}` : cp.name,
        description: cp.baseUrl,
        detail: 'Custom model provider',
        id: cp.id
      });
    }
  }

  // 3. Actions / Generic custom
  const isCustomEndpointSelected = 'custom' === currentProvider;
  items.push({
    label: isCustomEndpointSelected
      ? '$(check) Custom Endpoint (Direct URL)'
      : 'Custom Endpoint (Direct URL)',
    description: config.baseUrl || '(set base URL)',
    detail: 'Use a one-off base URL configured in settings',
    id: 'custom'
  });

  items.push({
    label: '$(add) Add Custom Model Provider...',
    description: 'Configure a new local gateway or remote OpenAI-compatible endpoint',
    detail: 'Add to aiCommit.customProviders (e.g. Ollama, LM Studio, vLLM, LocalAI)',
    isAction: true
  });

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: `Select AI provider for AnyCommit (current: ${config.provider})`
  });

  if (!picked) {
    return;
  }

  if (picked.isAction) {
    await handleAddCustomProvider();
    return;
  }

  if (!picked.id) {
    return;
  }

  await updateAnyCommitConfig('provider', picked.id);
  vscode.window.showInformationMessage(`AnyCommit: Provider set to "${picked.id}".`);

  if (picked.id === 'custom') {
    const freshConfig = getAnyCommitConfig();
    if (!freshConfig.baseUrl) {
      const entered = await vscode.window.showInputBox({
        title: 'AnyCommit: Set Base URL for Custom Endpoint',
        prompt: 'Enter the OpenAI-compatible base URL (e.g. http://localhost:11434/v1)',
        ignoreFocusOut: true
      });
      if (entered?.trim()) {
        await updateAnyCommitConfig('baseUrl', entered.trim());
      }
    }
  }
}

async function handleAddCustomProvider(): Promise<void> {
  const name = await vscode.window.showInputBox({
    title: 'AnyCommit: Add Custom Provider (Step 1/3: Display Name)',
    prompt:
      'Enter a display name for this provider (e.g. Ollama Local, LM Studio, vLLM, Corporate Gateway)',
    ignoreFocusOut: true
  });
  if (!name?.trim()) {
    return;
  }

  const defaultId = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');
  const id = await vscode.window.showInputBox({
    title: 'AnyCommit: Add Custom Provider (Step 2/3: Provider ID)',
    prompt: 'Enter a unique ID for this provider (used in configuration and secrets storage)',
    value: defaultId,
    ignoreFocusOut: true
  });
  if (!id?.trim()) {
    return;
  }

  const baseUrl = await vscode.window.showInputBox({
    title: 'AnyCommit: Add Custom Provider (Step 3/3: Base URL)',
    prompt:
      'Enter the OpenAI-compatible base URL (must include /v1, e.g. http://localhost:11434/v1)',
    value: 'http://localhost:11434/v1',
    ignoreFocusOut: true
  });
  if (!baseUrl?.trim()) {
    return;
  }

  const config = getAnyCommitConfig();
  const existing = [...config.customProviders];
  const newProvider: CustomProviderConfig = {
    id: id.trim(),
    name: name.trim(),
    baseUrl: baseUrl.trim()
  };

  const filtered = existing.filter((p) => p.id.toLowerCase() !== newProvider.id.toLowerCase());
  filtered.push(newProvider);

  await updateAnyCommitConfig('customProviders', filtered);
  await updateAnyCommitConfig('provider', newProvider.id);

  vscode.window.showInformationMessage(
    `AnyCommit: Custom provider "${newProvider.name}" added and activated.`
  );
}
