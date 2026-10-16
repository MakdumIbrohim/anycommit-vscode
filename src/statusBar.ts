import * as vscode from 'vscode';
import { getAnyCommitConfig } from './config';

export function createStatusBarItem(context: vscode.ExtensionContext): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    10
  );

  item.command = 'aiCommit.showQuickMenu';
  updateStatusBarItem(item);
  item.show();

  context.subscriptions.push(item);

  // Update status bar whenever configuration changes
  const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('aiCommit')) {
      updateStatusBarItem(item);
    }
  });
  context.subscriptions.push(configListener);

  return item;
}

export function updateStatusBarItem(item: vscode.StatusBarItem): void {
  const config = getAnyCommitConfig();
  const provider = config.provider;
  const model = config.model;

  const modelLabel = model ? ` (${model})` : ' (no model)';
  item.text = `$(git-commit) AnyCommit: ${provider}${modelLabel}`;
  item.tooltip = new vscode.MarkdownString(
    `**AnyCommit: AI Commit Message**\n\n` +
    `- **Provider:** \`${provider}\`\n` +
    `- **Model:** \`${model || 'None (click to select)'}\`\n` +
    `- **Base URL:** \`${config.resolvedBaseUrl || 'Not set'}\`\n\n` +
    `*Click to switch model, provider, or set API key.*`
  );
}
