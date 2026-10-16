import * as vscode from 'vscode';
import { getAnyCommitConfig } from '../config';
import { clearApiKey } from '../secrets';

export async function handleClearApiKey(context: vscode.ExtensionContext): Promise<void> {
  const config = getAnyCommitConfig();
  const provider = config.provider;

  await clearApiKey(context.secrets, provider);
  vscode.window.showInformationMessage(`AnyCommit: API key for "${provider}" cleared.`);
}
