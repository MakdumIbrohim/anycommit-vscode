import { CustomProviderConfig, PROVIDER_PRESETS } from '../../../core/providers';

export function renderProviderCard(config: any, currentApiKey: string): string {
  const customList: CustomProviderConfig[] = config.customProviders || [];

  return /* html */ `
    <div class="card">
      <div class="card-header">
        <span class="codicon codicon-server"></span>
        <h2>Provider Configuration</h2>
      </div>

      <div class="field">
        <label for="providerSelect">
          <span class="codicon codicon-radio-tower"></span>
          <span>Active Gateway / Preset</span>
        </label>
        <select id="providerSelect">
          <optgroup label="AnyCommit Gateway (Free Tier)">
            <option value="anycommit" ${config.provider === 'anycommit' ? 'selected' : ''}>AnyCommit Gateway (Free Router)</option>
          </optgroup>
          <optgroup label="Local Gateways (Zero-Config)">
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
        <label for="baseUrl">
          <span class="codicon codicon-link"></span>
          <span>Base URL</span>
        </label>
        <input type="text" id="baseUrl" value="${config.resolvedBaseUrl || ''}" placeholder="http://localhost:20128/v1" />
        <div class="help">Must terminate with a <code>/v1</code> route path.</div>
      </div>

      <div class="field" id="apiKeyField">
        <label for="apiKey">
          <span class="codicon codicon-key"></span>
          <span id="apiKeyLabelText">API Authentication Key</span>
        </label>
        <input type="password" id="apiKey" value="${currentApiKey}" placeholder="Optional / Not required for AnyCommit Gateway" />
        <div id="apiKeyHelp" class="help">Not required for AnyCommit Gateway. Connects directly to Cloudflare Worker without authentication.</div>
      </div>
    </div>
  `;
}
