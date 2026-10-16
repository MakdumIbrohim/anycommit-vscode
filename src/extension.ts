import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { createStatusBarItem } from './statusBar';

export function activate(context: vscode.ExtensionContext): void {
  registerCommands(context);
  createStatusBarItem(context);
}

export function deactivate(): void {}
