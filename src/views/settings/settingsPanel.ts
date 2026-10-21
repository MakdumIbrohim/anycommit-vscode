import * as vscode from 'vscode';
import { getAnyCommitConfig, updateAnyCommitConfig } from '../../config';
import { getApiKey, setApiKey } from '../../secrets';
import { listModels } from '../../core/client';
import { renderSettingsHtml } from './settingsHtml';

export class AnyCommitSettingsPanel {
  public static currentPanel: AnyCommitSettingsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext): void {
    if (AnyCommitSettingsPanel.currentPanel) {
      AnyCommitSettingsPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'anycommit.settings',
      'AnyCommit Settings',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    AnyCommitSettingsPanel.currentPanel = new AnyCommitSettingsPanel(panel, context);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    private readonly context: vscode.ExtensionContext
  ) {
    this._panel = panel;
    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'fetchModels':
            try {
              const models = await listModels({
                baseUrl: message.baseUrl,
                apiKey: message.apiKey,
                timeoutSeconds: 15
              });
              this._panel.webview.postMessage({ command: 'modelsLoaded', models });
            } catch (err: any) {
              this._panel.webview.postMessage({
                command: 'error',
                message: err.message || 'Failed to query models from endpoint.'
              });
            }
            break;

          case 'saveSettings':
            try {
              const cfg = message.config;
              await updateAnyCommitConfig('provider', cfg.provider);
              await updateAnyCommitConfig('model', cfg.model);
              await updateAnyCommitConfig('baseUrl', cfg.baseUrl);
              await updateAnyCommitConfig('style', cfg.style);
              await updateAnyCommitConfig('language', cfg.language);
              await updateAnyCommitConfig('includeBody', Boolean(cfg.includeBody));
              await updateAnyCommitConfig('autoDetectScope', Boolean(cfg.autoDetectScope));
              await updateAnyCommitConfig(
                'extractTicketFromBranch',
                Boolean(cfg.extractTicketFromBranch)
              );

              if (Array.isArray(cfg.customProviders)) {
                await updateAnyCommitConfig('customProviders', cfg.customProviders);
              }

              if (typeof message.apiKey === 'string') {
                await setApiKey(this.context.secrets, cfg.provider, message.apiKey);
              }

              this._panel.webview.postMessage({ command: 'saveSuccess' });
              vscode.window.showInformationMessage('AnyCommit: Settings saved successfully.');
            } catch (err: any) {
              this._panel.webview.postMessage({ command: 'saveError', message: err.message });
              vscode.window.showErrorMessage(
                `AnyCommit: Failed to save settings (${err.message}).`
              );
            }
            break;
        }
      },
      null,
      this._disposables
    );
  }

  private async _update(): Promise<void> {
    const config = getAnyCommitConfig();
    const apiKey = await getApiKey(this.context.secrets, config.provider);
    this._panel.webview.html = renderSettingsHtml(config, apiKey || '');
  }

  public dispose(): void {
    AnyCommitSettingsPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) x.dispose();
    }
  }
}
