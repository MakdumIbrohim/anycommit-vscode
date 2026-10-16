import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const commands = [
    'aiCommit.generate',
    'aiCommit.setApiKey',
    'aiCommit.clearApiKey',
    'aiCommit.selectModel',
    'aiCommit.selectProvider'
  ];

  for (const cmd of commands) {
    const disposable = vscode.commands.registerCommand(cmd, async () => {
      vscode.window.showInformationMessage('AnyCommit: Not implemented yet');
    });
    context.subscriptions.push(disposable);
  }
}

export function deactivate() {}
