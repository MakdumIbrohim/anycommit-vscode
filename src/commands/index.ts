import * as vscode from 'vscode';
import { handleSetApiKey } from './setApiKey';
import { handleClearApiKey } from './clearApiKey';
import { handleSelectProvider } from './selectProvider';
import { handleSelectModel } from './selectModel';
import { handleGenerate } from './generate';
import { handleShowQuickMenu } from './quickMenu';
import { AnyCommitSettingsPanel } from '../views/settingsWebview';

export function registerCommands(context: vscode.ExtensionContext): void {
  const commands: Array<[string, (...args: any[]) => any]> = [
    ['aiCommit.setApiKey', () => handleSetApiKey(context)],
    ['aiCommit.clearApiKey', () => handleClearApiKey(context)],
    ['aiCommit.selectProvider', () => handleSelectProvider(context)],
    ['aiCommit.selectModel', () => handleSelectModel(context)],
    ['aiCommit.generate', () => handleGenerate(context)],
    ['aiCommit.regenerate', () => handleGenerate(context, { isRegenerate: true })],
    ['aiCommit.showQuickMenu', () => handleShowQuickMenu()],
    ['aiCommit.openSettings', () => AnyCommitSettingsPanel.createOrShow(context)]
  ];

  for (const [cmd, handler] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(cmd, handler));
  }
}
