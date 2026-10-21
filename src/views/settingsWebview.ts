import * as vscode from 'vscode';
import { getAnyCommitConfig, updateAnyCommitConfig } from '../config';
import { getApiKey, setApiKey } from '../secrets';
import { listModels } from '../core/client';
import { CustomProviderConfig, PROVIDER_PRESETS } from '../core/providers';

export class AnyCommitSettingsPanel {
  public static currentPanel: AnyCommitSettingsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext) {
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
                message: err.message || 'Failed to fetch models'
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

              vscode.window.showInformationMessage('AnyCommit: Settings saved successfully.');
            } catch (err: any) {
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

  private async _update() {
    const config = getAnyCommitConfig();
    const apiKey = await getApiKey(this.context.secrets, config.provider);
    this._panel.webview.html = this._getHtmlForWebview(config, apiKey || '');
  }

  public dispose() {
    AnyCommitSettingsPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) x.dispose();
    }
  }

  private _getHtmlForWebview(config: any, currentApiKey: string): string {
    const builtins = Object.values(PROVIDER_PRESETS).filter((p) => p.id !== 'custom');
    const customList: CustomProviderConfig[] = config.customProviders || [];

    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          :root {
            --font-family: var(--vscode-font-family);
            --bg: var(--vscode-editor-background);
            --fg: var(--vscode-editor-foreground);
            --input-bg: var(--vscode-input-background);
            --input-fg: var(--vscode-input-foreground);
            --input-border: var(--vscode-input-border);
            --btn-bg: var(--vscode-button-background);
            --btn-fg: var(--vscode-button-foreground);
            --btn-hover: var(--vscode-button-hoverBackground);
            --card-border: var(--vscode-widget-border);
            --desc-fg: var(--vscode-descriptionForeground);
          }
          body {
            font-family: var(--font-family);
            background: var(--bg);
            color: var(--fg);
            padding: 24px;
            max-width: 760px;
            margin: auto;
            line-height: 1.5;
          }
          h1 { margin-top: 0; font-size: 22px; }
          h2 {
            border-bottom: 1px solid var(--card-border);
            padding-bottom: 6px;
            margin-top: 28px;
            font-size: 15px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: var(--desc-fg);
          }
          .field { margin-bottom: 18px; }
          label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 13px; }
          .help { font-size: 12px; color: var(--desc-fg); margin-top: 4px; }
          select, input[type="text"], input[type="password"] {
            width: 100%;
            padding: 8px 10px;
            background: var(--input-bg);
            color: var(--input-fg);
            border: 1px solid var(--input-border);
            border-radius: 2px;
            box-sizing: border-box;
            font-size: 13px;
          }
          select:focus, input:focus { outline: 1px solid var(--vscode-focusBorder); }
          .row { display: flex; gap: 8px; align-items: center; }
          .checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
          button {
            padding: 8px 14px;
            background: var(--btn-bg);
            color: var(--btn-fg);
            border: none;
            cursor: pointer;
            border-radius: 2px;
            font-weight: 500;
          }
          button:hover { background: var(--btn-hover); }
          button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
          }
          button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
          .status { font-size: 12px; margin-top: 4px; }
        </style>
      </head>
      <body>
        <h1>AnyCommit Dashboard</h1>
        <div class="help" style="margin-bottom: 20px;">
          Configure AI provider endpoints, fetch models directly, and customize commit formatting.
        </div>

        <h2>Provider Configuration</h2>
        <div class="field">
          <label for="providerSelect">Active Provider</label>
          <select id="providerSelect">
            <optgroup label="Local Gateways">
              <option value="9router" ${config.provider === '9router' ? 'selected' : ''}>9router (Local Gateway)</option>
              <option value="omniroute" ${config.provider === 'omniroute' ? 'selected' : ''}>OmniRoute (Local Gateway)</option>
            </optgroup>
            <optgroup label="Cloud Providers">
              <option value="openai" ${config.provider === 'openai' ? 'selected' : ''}>OpenAI</option>
              <option value="openrouter" ${config.provider === 'openrouter' ? 'selected' : ''}>OpenRouter</option>
              <option value="groq" ${config.provider === 'groq' ? 'selected' : ''}>Groq</option>
              <option value="deepseek" ${config.provider === 'deepseek' ? 'selected' : ''}>DeepSeek</option>
            </optgroup>
            ${
              customList.length > 0
                ? `<optgroup label="Configured Custom Providers">
                  ${customList
                    .map(
                      (cp) =>
                        `<option value="${cp.id}" ${config.provider.toLowerCase() === cp.id.toLowerCase() ? 'selected' : ''}>${cp.name}</option>`
                    )
                    .join('')}
                </optgroup>`
                : ''
            }
            <optgroup label="Custom">
              <option value="custom" ${config.provider === 'custom' ? 'selected' : ''}>Custom Endpoint (Direct URL)</option>
            </optgroup>
          </select>
        </div>

        <div class="field">
          <label for="baseUrl">Base URL</label>
          <input type="text" id="baseUrl" value="${config.resolvedBaseUrl || ''}" placeholder="http://localhost:20128/v1" />
          <div class="help">Must point to an OpenAI-compatible endpoint ending in /v1.</div>
        </div>

        <div class="field">
          <label for="apiKey">API Key</label>
          <input type="password" id="apiKey" value="${currentApiKey}" placeholder="Optional for local gateways (stored in SecretStorage)" />
        </div>

        <h2>Model Selection</h2>
        <div class="field">
          <label for="modelSelect">Active Model</label>
          <div class="row">
            <input type="text" id="modelSelect" value="${config.model || ''}" placeholder="e.g. premium-coding, gpt-4o" />
            <button id="fetchModelsBtn" class="secondary" type="button">Fetch Models</button>
          </div>
          <div id="fetchStatus" class="status"></div>
          <div id="modelsDropdownContainer" style="margin-top: 8px; display: none;">
            <label for="modelDropdown" class="help">Discovered Models:</label>
            <select id="modelDropdown"></select>
          </div>
        </div>

        <h2>Commit Style & Conventions</h2>
        <div class="field">
          <label for="styleSelect">Commit Style</label>
          <select id="styleSelect">
            <option value="conventional" ${config.style === 'conventional' ? 'selected' : ''}>Conventional Commits (e.g. feat(scope): desc)</option>
            <option value="gitmoji" ${config.style === 'gitmoji' ? 'selected' : ''}>Gitmoji (e.g. :sparkles: desc)</option>
            <option value="plain" ${config.style === 'plain' ? 'selected' : ''}>Plain Imperative (e.g. Add user authentication)</option>
          </select>
        </div>

        <div class="field">
          <label for="languageInput">Language</label>
          <input type="text" id="languageInput" value="${config.language || 'English'}" placeholder="English, Indonesian, etc." />
        </div>

        <div class="field">
          <div class="checkbox-row">
            <input type="checkbox" id="autoDetectScope" ${config.autoDetectScope ? 'checked' : ''} />
            <label for="autoDetectScope" style="margin: 0; font-weight: normal;">Auto-detect Conventional Commit scope from folder paths</label>
          </div>
          <div class="checkbox-row">
            <input type="checkbox" id="extractTicketFromBranch" ${config.extractTicketFromBranch ? 'checked' : ''} />
            <label for="extractTicketFromBranch" style="margin: 0; font-weight: normal;">Extract issue/ticket ID from git branch name</label>
          </div>
          <div class="checkbox-row">
            <input type="checkbox" id="includeBody" ${config.includeBody ? 'checked' : ''} />
            <label for="includeBody" style="margin: 0; font-weight: normal;">Include bullet points body under subject line</label>
          </div>
        </div>

        <div style="margin-top: 32px; display: flex; gap: 10px;">
          <button id="saveBtn" type="button" style="padding: 10px 24px; font-size: 14px;">Save Settings</button>
        </div>

        <script>
          const vscode = acquireVsCodeApi();
          const PRESETS = {
            '9router': 'http://localhost:20128/v1',
            'omniroute': 'http://localhost:20128/v1',
            'openai': 'https://api.openai.com/v1',
            'openrouter': 'https://openrouter.ai/api/v1',
            'groq': 'https://api.groq.com/openai/v1',
            'deepseek': 'https://api.deepseek.com/v1'
          };

          const providerSelect = document.getElementById('providerSelect');
          const baseUrlInput = document.getElementById('baseUrl');
          const modelInput = document.getElementById('modelSelect');
          const fetchBtn = document.getElementById('fetchModelsBtn');
          const fetchStatus = document.getElementById('fetchStatus');
          const dropdownContainer = document.getElementById('modelsDropdownContainer');
          const modelDropdown = document.getElementById('modelDropdown');
          const saveBtn = document.getElementById('saveBtn');

          providerSelect.addEventListener('change', () => {
            const val = providerSelect.value;
            if (PRESETS[val]) {
              baseUrlInput.value = PRESETS[val];
            }
          });

          fetchBtn.addEventListener('click', () => {
            const baseUrl = baseUrlInput.value.trim();
            const apiKey = document.getElementById('apiKey').value.trim();
            if (!baseUrl) {
              fetchStatus.textContent = 'Please enter a Base URL first.';
              fetchStatus.style.color = 'var(--vscode-errorForeground)';
              return;
            }
            fetchStatus.textContent = 'Querying endpoint for available models...';
            fetchStatus.style.color = 'var(--desc-fg)';
            vscode.postMessage({ command: 'fetchModels', baseUrl, apiKey });
          });

          modelDropdown.addEventListener('change', () => {
            if (modelDropdown.value) {
              modelInput.value = modelDropdown.value;
            }
          });

          window.addEventListener('message', (event) => {
            const msg = event.data;
            if (msg.command === 'modelsLoaded') {
              fetchStatus.textContent = 'Found ' + msg.models.length + ' model(s).';
              fetchStatus.style.color = 'var(--vscode-testing-iconPassed)';
              modelDropdown.innerHTML = '<option value="">-- Choose discovered model --</option>';
              msg.models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = m;
                modelDropdown.appendChild(opt);
              });
              dropdownContainer.style.display = 'block';
            } else if (msg.command === 'error') {
              fetchStatus.textContent = msg.message;
              fetchStatus.style.color = 'var(--vscode-errorForeground)';
            }
          });

          saveBtn.addEventListener('click', () => {
            vscode.postMessage({
              command: 'saveSettings',
              config: {
                provider: providerSelect.value,
                baseUrl: baseUrlInput.value.trim(),
                model: modelInput.value.trim(),
                style: document.getElementById('styleSelect').value,
                language: document.getElementById('languageInput').value.trim(),
                autoDetectScope: document.getElementById('autoDetectScope').checked,
                extractTicketFromBranch: document.getElementById('extractTicketFromBranch').checked,
                includeBody: document.getElementById('includeBody').checked
              },
              apiKey: document.getElementById('apiKey').value.trim()
            });
          });
        </script>
      </body>
      </html>
    `;
  }
}
