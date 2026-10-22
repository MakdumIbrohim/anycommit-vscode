import { CustomProviderConfig, PROVIDER_PRESETS } from '../../../core/providers';

export function renderProviderCard(config: any, currentApiKey: string): string {
  const customList: CustomProviderConfig[] = config.customProviders || [];

  return /* html */ `
    <div class="card">
      <div class="card-header">
        <svg viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 012.5 1h11A1.5 1.5 0 0115 2.5v2A1.5 1.5 0 0113.5 6h-11A1.5 1.5 0 011 4.5v-2zm1.5-.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-11zm-1.5 8A1.5 1.5 0 012.5 9h11a1.5 1.5 0 011.5 1.5v2a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 12.5v-2zm1.5-.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-11zM4 3.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 7a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
        <h2>Provider Configuration</h2>
      </div>

      <div class="field">
        <label for="providerSelect">
          <svg viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 012.5 1h11A1.5 1.5 0 0115 2.5v2A1.5 1.5 0 0113.5 6h-11A1.5 1.5 0 011 4.5v-2zm1.5-.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-11zm-1.5 8A1.5 1.5 0 012.5 9h11a1.5 1.5 0 011.5 1.5v2a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 12.5v-2zm1.5-.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-11zM4 3.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 7a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
          <span>Active Gateway / Preset</span>
        </label>
        <select id="providerSelect">
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
          <svg viewBox="0 0 16 16"><path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-.65 9.45a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25z"/></svg>
          <span>Base URL</span>
        </label>
        <input type="text" id="baseUrl" value="${config.resolvedBaseUrl || ''}" placeholder="http://localhost:20128/v1" />
        <div class="help">Must terminate with a <code>/v1</code> route path.</div>
      </div>

      <div class="field">
        <label for="apiKey">
          <svg viewBox="0 0 16 16"><path d="M11 1a4 4 0 00-3.874 5H1v3h2v2h2v2h3v-2h1.126A4 4 0 1011 1zm0 2a2 2 0 110 4 2 2 0 010-4z"/></svg>
          <span>API Authentication Key</span>
        </label>
        <input type="password" id="apiKey" value="${currentApiKey}" placeholder="Leave empty for local gateways without authentication" />
        <div class="help">Encrypted locally. Never written to settings.json or git tracking.</div>
      </div>
    </div>
  `;
}
