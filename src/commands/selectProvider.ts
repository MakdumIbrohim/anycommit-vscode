import * as vscode from 'vscode';
import { getAnyCommitConfig, updateAnyCommitConfig } from '../config';
import { CustomProviderConfig, PROVIDER_PRESETS } from '../core/providers';
import { getApiKey } from '../secrets';

interface ProviderItem extends vscode.QuickPickItem {
  id?: string;
  baseUrl?: string;
  isLocal?: boolean;
  requiresApiKey?: boolean;
  isCustomAction?: boolean;
}

export async function handleSelectProvider(context?: vscode.ExtensionContext): Promise<void> {
  const config = getAnyCommitConfig();
  const currentProviderId = (config.provider || '9router').toLowerCase();

  const items: ProviderItem[] = [];

  // Group 1: Predefined Cloud Providers
  items.push({ label: 'Predefined Cloud Providers', kind: vscode.QuickPickItemKind.Separator });
  const cloudKeys: Array<keyof typeof PROVIDER_PRESETS> = [
    'openai',
    'openrouter',
    'groq',
    'deepseek'
  ];
  for (const key of cloudKeys) {
    const p = PROVIDER_PRESETS[key];
    if (!p) continue;
    const isSelected = p.id.toLowerCase() === currentProviderId;
    items.push({
      label: isSelected ? `$(check) ${p.name}` : `$(cloud) ${p.name}`,
      description: p.defaultBaseUrl,
      detail: 'Cloud provider · API key required',
      id: p.id,
      baseUrl: p.defaultBaseUrl,
      requiresApiKey: p.requiresApiKey
    });
  }

  // Group 2: Local Gateways
  items.push({ label: 'Local Gateways', kind: vscode.QuickPickItemKind.Separator });
  const localKeys: Array<keyof typeof PROVIDER_PRESETS> = ['9router', 'omniroute'];
  for (const key of localKeys) {
    const g = PROVIDER_PRESETS[key];
    if (!g) continue;
    const isSelected = g.id.toLowerCase() === currentProviderId;
    items.push({
      label: isSelected ? `$(check) ${g.name}` : `$(server) ${g.name}`,
      description: g.defaultBaseUrl,
      detail: 'Local gateway · API key optional',
      id: g.id,
      baseUrl: g.defaultBaseUrl,
      isLocal: g.isLocal
    });
  }

  // Group 3: User-Configured Custom Providers
  const customProviders = config.customProviders || [];
  if (customProviders.length > 0) {
    items.push({ label: 'Configured Custom Providers', kind: vscode.QuickPickItemKind.Separator });
    for (const cp of customProviders) {
      const isSelected = cp.id.toLowerCase() === currentProviderId;
      items.push({
        label: isSelected ? `$(check) ${cp.name}` : `$(sparkle) ${cp.name}`,
        description: cp.baseUrl,
        detail: 'Custom configured provider',
        id: cp.id,
        baseUrl: cp.baseUrl
      });
    }
  }

  // Group 4: Custom Configuration Actions
  items.push({ label: 'Custom Configuration', kind: vscode.QuickPickItemKind.Separator });
  items.push({
    label: '$(add) Add Custom Provider...',
    description: 'Add a new OpenAI-compatible endpoint (Ollama, LM Studio, vLLM, etc.)',
    isCustomAction: true
  });

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: `Select provider (Current: ${config.provider})`,
    matchOnDescription: true,
    matchOnDetail: true
  });

  if (!selected) {
    return;
  }

  if (selected.isCustomAction) {
    await promptAndAddCustomProvider(context, customProviders);
    return;
  }

  if (selected.id) {
    await updateAnyCommitConfig('provider', selected.id);
    const cleanLabel = selected.label.replace(/\$\([^)]+\)\s*/, '');
    vscode.window.showInformationMessage(`AnyCommit: Provider set to "${cleanLabel}".`);

    if (context && selected.requiresApiKey) {
      const existingKey = await getApiKey(context.secrets, selected.id);
      if (!existingKey) {
        const action = await vscode.window.showInformationMessage(
          `Provider "${selected.id}" requires an API key. Set it now?`,
          'Set API Key',
          'Later'
        );
        if (action === 'Set API Key') {
          await vscode.commands.executeCommand('aiCommit.setApiKey');
        }
      }
    }
  }
}

async function promptAndAddCustomProvider(
  context: vscode.ExtensionContext | undefined,
  existingProviders: CustomProviderConfig[]
): Promise<void> {
  const name = await vscode.window.showInputBox({
    title: 'Custom Provider (1/3): Display Name',
    prompt: 'Enter display name (e.g. Ollama Local, LM Studio, vLLM, Corporate Gateway)',
    validateInput: (val) => (!val?.trim() ? 'Name cannot be empty' : null),
    ignoreFocusOut: true
  });
  if (!name?.trim()) return;

  const defaultId = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');
  const id = await vscode.window.showInputBox({
    title: 'Custom Provider (2/3): Provider ID',
    prompt: 'Enter unique ID for configuration & secrets',
    value: defaultId,
    validateInput: (val) => (!val?.trim() ? 'ID cannot be empty' : null),
    ignoreFocusOut: true
  });
  if (!id?.trim()) return;

  const baseUrl = await vscode.window.showInputBox({
    title: 'Custom Provider (3/3): Base URL',
    prompt:
      'Enter OpenAI-compatible base URL (must start with http:// or https:// and include /v1)',
    value: 'http://localhost:11434/v1',
    validateInput: (val) => {
      const trimmed = val?.trim() || '';
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return 'URL must start with http:// or https://';
      }
      return null;
    },
    ignoreFocusOut: true
  });
  if (!baseUrl?.trim()) return;

  const newProvider: CustomProviderConfig = {
    id: id.trim(),
    name: name.trim(),
    baseUrl: baseUrl.trim()
  };

  const updatedList = existingProviders.filter(
    (p) => p.id.toLowerCase() !== newProvider.id.toLowerCase()
  );
  updatedList.push(newProvider);

  await updateAnyCommitConfig('customProviders', updatedList);
  await updateAnyCommitConfig('provider', newProvider.id);

  vscode.window.showInformationMessage(
    `AnyCommit: Custom provider "${newProvider.name}" added and activated.`
  );
}
