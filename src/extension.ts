import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { createStatusBarItem } from './statusBar';
import { checkAndAutoConfigureFreeTier } from './gatewayService';

export function activate(context: vscode.ExtensionContext): void {
  registerCommands(context);
  createStatusBarItem(context);
  checkAndAutoConfigureFreeTier(context);
}

export function deactivate(): void {}
