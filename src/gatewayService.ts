import * as vscode from 'vscode';
import { getAnyCommitConfig, updateAnyCommitConfig } from './config';
import { scanFreeTierGateways } from './core/gateway';

export async function checkAndAutoConfigureFreeTier(context: vscode.ExtensionContext): Promise<void> {
  const config = getAnyCommitConfig();
  if (config.model && config.model.trim().length > 0) {
    return;
  }

  const alreadyScanned = context.globalState.get<boolean>('anycommit.gatewayScanned');
  if (alreadyScanned) {
    return;
  }

  // Run asynchronously without blocking extension activation
  setTimeout(async () => {
    try {
      const discovered = await scanFreeTierGateways();
      if (discovered.length === 0) {
        return;
      }

      const best = discovered[0];
      const model = best.models[0];
      if (!model) {
        return;
      }

      await updateAnyCommitConfig('provider', best.provider);
      await updateAnyCommitConfig('model', model);
      if (best.isLocal) {
        await updateAnyCommitConfig('baseUrl', best.baseUrl);
      }

      await context.globalState.update('anycommit.gatewayScanned', true);

      vscode.window
        .showInformationMessage(
          `AnyCommit Gateway: Detected free tier ${best.provider} (${model}).`,
          'Open Settings'
        )
        .then((action) => {
          if (action === 'Open Settings') {
            vscode.commands.executeCommand('aiCommit.openSettings');
          }
        });
    } catch {
      // Non-blocking: fail silent on network errors
    }
  }, 1000);
}
