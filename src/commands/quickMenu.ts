import * as vscode from 'vscode';
import { getAnyCommitConfig } from '../config';

interface QuickMenuItem extends vscode.QuickPickItem {
  action: () => Promise<void> | void;
}

export async function handleShowQuickMenu(): Promise<void> {
  const config = getAnyCommitConfig();
  const currentProvider = config.provider;
  const currentModel = config.model || 'None';

  const items: QuickMenuItem[] = [
    {
      label: '$(symbol-parameter) Switch Model',
      description: `Current: ${currentModel}`,
      detail: `Fetch and select a model or combo from ${currentProvider}`,
      action: async () => {
        await vscode.commands.executeCommand('aiCommit.selectModel');
      }
    },
    {
      label: '$(server) Switch Provider',
      description: `Current: ${currentProvider}`,
      detail: 'Choose between local gateways, cloud providers, or custom endpoints',
      action: async () => {
        await vscode.commands.executeCommand('aiCommit.selectProvider');
      }
    },
    {
      label: '$(key) Set API Key',
      description: `For ${currentProvider}`,
      detail: 'Store API key safely in VS Code SecretStorage',
      action: async () => {
        await vscode.commands.executeCommand('aiCommit.setApiKey');
      }
    },
    {
      label: '$(clear-all) Clear API Key',
      description: `For ${currentProvider}`,
      detail: 'Remove stored API key from SecretStorage',
      action: async () => {
        await vscode.commands.executeCommand('aiCommit.clearApiKey');
      }
    },
    {
      label: '$(gear) Settings Dashboard',
      description: 'Open AnyCommit Visual Settings',
      detail: 'Configure providers, fetch live models, and customize commit style',
      action: async () => {
        await vscode.commands.executeCommand('aiCommit.openSettings');
      }
    },
    {
      label: '$(settings) Native VS Code Settings',
      description: 'Open settings.json entries',
      detail: 'Configure raw settings in VS Code Preferences',
      action: async () => {
        await vscode.commands.executeCommand(
          'workbench.action.openSettings',
          '@ext:makdumibrohim.anycommit'
        );
      }
    }
  ];

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: `AnyCommit (${currentProvider} · ${currentModel}) - Choose an action`
  });

  if (picked) {
    await picked.action();
  }
}
