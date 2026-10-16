import * as vscode from 'vscode';
import { getAnyCommitConfig } from '../config';
import { setApiKey } from '../secrets';

export async function handleSetApiKey(context: vscode.ExtensionContext): Promise<void> {
  const config = getAnyCommitConfig();
  const provider = config.provider;

  const input = await vscode.window.showInputBox({
    title: `AnyCommit: Set API Key (${provider})`,
    prompt: `Enter API key for ${provider}. Leave empty for gateways without authentication.`,
    password: true,
    ignoreFocusOut: true
  });

  if (input === undefined) {
    return;
  }

  await setApiKey(context.secrets, provider, input);
  if (input.trim()) {
    vscode.window.showInformationMessage(`AnyCommit: API key for "${provider}" saved.`);
  } else {
    vscode.window.showInformationMessage(`AnyCommit: API key for "${provider}" cleared.`);
  }
}
