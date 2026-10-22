export function getSettingsScript(): string {
  return /* javascript */ `
    const vscode = acquireVsCodeApi();
    const PRESETS = {
      '9router': 'http://localhost:20128/v1',
      'omniroute': 'http://localhost:20128/v1',
      'openai': 'https://api.openai.com/v1',
      'openrouter': 'https://openrouter.ai/api/v1',
      'groq': 'https://api.groq.com/openai/v1',
      'deepseek': 'https://api.deepseek.com/v1'
    };

    const PROVIDERS = {
      openai: {
        name: 'OpenAI / ChatGPT',
        color: '#10a37f',
        svg: '<svg viewBox="0 0 24 24" fill="#10a37f"><path d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.2 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.08zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .4-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.5 4.5zm-9.66-4.14a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.85-3.37v2.33a.08.08 0 0 1-.04.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.66zm-1.12-10.42a4.48 4.48 0 0 1 2.34-1.97l-.01.16v5.52a.78.78 0 0 0 .39.67l5.85 3.38-2.02 1.16a.09.09 0 0 1-.07 0L3.84 9.85A4.5 4.5 0 0 1 2.48 7.87zm16.6 3.86L13.23 8.36l2.02-1.17a.09.09 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.67 8.1v-5.68a.8.8 0 0 0-.41-.67zm2.01-3.02l-.14-.09-4.78-2.78a.78.78 0 0 0-.78 0L9.54 9.21V6.88a.09.09 0 0 1 .04-.06l4.88-2.83a4.5 4.5 0 0 1 6.68 4.67zM9.9 14.16l-2.34-1.34 2.34-1.35 2.33 1.35-2.33 1.34z"/></svg>'
      },
      anthropic: {
        name: 'Anthropic Claude',
        color: '#d97757',
        svg: '<svg viewBox="0 0 24 24" fill="#d97757"><path d="M13.83 2h-3.66v7.34L4.99 4.16 2.4 6.75l5.18 5.18H.24v3.66h7.34l-5.18 5.18 2.59 2.59 5.18-5.18v7.34h3.66v-7.34l5.18 5.18 2.59-2.59-5.18-5.18h7.34v-3.66h-7.34l5.18-5.18-2.59-2.59-5.18 5.18V2z"/></svg>'
      },
      gemini: {
        name: 'Google Gemini',
        color: '#4e8cff',
        svg: '<svg viewBox="0 0 24 24" fill="#4e8cff"><path d="M12 0C12 6.63 6.63 12 0 12c6.63 0 12 5.37 12 12 0-6.63 5.37-12 12-12-6.63 0-12-5.37-12-12z"/></svg>'
      },
      deepseek: {
        name: 'DeepSeek',
        color: '#4d6bfe',
        svg: '<svg viewBox="0 0 24 24" fill="#4d6bfe"><path d="M2.5 13.5c1.8-4.2 6.3-7 11.2-6.5 3.8.4 7.1 2.9 8.3 6.5.3 1-.5 2-1.5 2-3.1 0-5.8-1.8-7.2-4.4-.8 2.2-2.7 3.9-5 4.4-2.5.5-4.8-.5-5.8-1.5z"/><circle cx="16" cy="10" r="1.2"/></svg>'
      },
      meta: {
        name: 'Meta LLaMA',
        color: '#0081fb',
        svg: '<svg viewBox="0 0 24 24" fill="#0081fb"><path d="M16.96 4.03c-2.02 0-3.81 1.08-4.96 2.72-1.15-1.64-2.94-2.72-4.96-2.72C3.12 4.03 0 7.29 0 11.51c0 5.48 5.76 9.46 11.23 9.46.34 0 .57-.02.77-.04.2.02.43.04.77.04 5.47 0 11.23-3.98 11.23-9.46 0-4.22-3.12-7.48-7.04-7.48zm-4.96 14.71c-4.43 0-8.98-3.23-8.98-7.23 0-2.86 2.07-5.06 4.79-5.06 2.15 0 3.89 1.48 4.19 3.55v8.74zm9.73-7.23c0 4-4.55 7.23-8.98 7.23v-8.74c.3-2.07 2.04-3.55 4.19-3.55 2.72 0 4.79 2.2 4.79 5.06z"/></svg>'
      },
      mistral: {
        name: 'Mistral AI',
        color: '#ff7000',
        svg: '<svg viewBox="0 0 24 24" fill="#ff7000"><path d="M3 3h4v4H3V3zm14 0h4v4h-4V3zm-7 7h4v4h-4v-4zm-7 7h4v4H3v-4zm14 0h4v4h-4v-4z"/></svg>'
      },
      qwen: {
        name: 'Alibaba Qwen',
        color: '#615ced',
        svg: '<svg viewBox="0 0 24 24" fill="#615ced"><path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2zm0 3.3L5.34 8.65v6.7L12 18.7l6.66-3.35v-6.7L12 5.3zm0 4a2.7 2.7 0 1 1 0 5.4 2.7 2.7 0 0 1 0-5.4z"/></svg>'
      },
      groq: {
        name: 'Groq',
        color: '#f55036',
        svg: '<svg viewBox="0 0 24 24" fill="#f55036"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07c-2.83-.48-5-2.94-5-5.93s2.17-5.45 5-5.93V4h2v1.07c2.83.48 5 2.94 5 5.93s-2.17 5.45-5 5.93z"/></svg>'
      },
      ollama: {
        name: 'Ollama',
        color: 'var(--fg)',
        svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3a2 2 0 0 0-2 2v2H6a2 2 0 0 0-2 2v4a3 3 0 0 0 3 3h1v5h3v-5h2v5h3v-7a3 3 0 0 0-3-3h-1V5a2 2 0 0 0-2-2H9zm0 3h1v2H9V6z"/></svg>'
      },
      local: {
        name: 'Local Gateway',
        color: '#38bdf8',
        svg: '<span class="codicon codicon-circuit-board" style="color: #38bdf8; font-size: 16px;"></span>'
      },
      generic: {
        name: 'AI Model',
        color: 'var(--desc-fg)',
        svg: '<span class="codicon codicon-sparkle" style="color: var(--desc-fg); font-size: 14px;"></span>'
      }
    };

    function detectProvider(modelName, preset) {
      const m = (modelName || '').toLowerCase().trim();
      const p = (preset || '').toLowerCase().trim();

      if (m) {
        if (/gpt|chatgpt|openai|^o[13](-preview|-mini)?|davinci|babbage/.test(m)) return 'openai';
        if (/claude|sonnet|haiku|opus|^cc\//.test(m)) return 'anthropic';
        if (/gemini|gemma|palm/.test(m)) return 'gemini';
        if (/deepseek|r1\b/.test(m)) return 'deepseek';
        if (/llama|meta/.test(m)) return 'meta';
        if (/mistral|codestral|mixtral|pixtral|ministral/.test(m)) return 'mistral';
        if (/qwen|qwq/.test(m)) return 'qwen';
        if (/groq/.test(m)) return 'groq';
        if (/ollama/.test(m)) return 'ollama';
        if (/9router|omniroute|local|combo/.test(m)) return 'local';
      }

      if (p === 'openai') return 'openai';
      if (p === 'deepseek') return 'deepseek';
      if (p === 'groq') return 'groq';
      if (p === '9router' || p === 'omniroute') return 'local';

      return 'generic';
    }

    const providerSelect = document.getElementById('providerSelect');
    const baseUrlInput = document.getElementById('baseUrl');
    const modelInput = document.getElementById('modelSelect');
    const modelInputIcon = document.getElementById('modelInputIcon');
    const modelBadge = document.getElementById('modelProviderBadge');
    const badgeIcon = document.getElementById('modelProviderIcon');
    const badgeName = document.getElementById('modelProviderName');
    const fetchBtn = document.getElementById('fetchModelsBtn');
    const fetchStatus = document.getElementById('fetchStatus');
    const emptyState = document.getElementById('modelsEmptyState');
    const dropdownContainer = document.getElementById('modelsDropdownContainer');
    const modelDropdown = document.getElementById('modelDropdown');
    const saveBtn = document.getElementById('saveBtn');
    const saveStatus = document.getElementById('saveStatus');

    function updateModelProvider() {
      const modelVal = modelInput.value.trim();
      const presetVal = providerSelect.value;
      const key = detectProvider(modelVal, presetVal);
      const info = PROVIDERS[key] || PROVIDERS.generic;

      if (modelInputIcon) {
        modelInputIcon.innerHTML = info.svg;
        modelInputIcon.title = info.name;
      }
      if (modelBadge && badgeIcon && badgeName) {
        if (modelVal || key !== 'generic') {
          modelBadge.style.display = 'inline-flex';
          badgeIcon.innerHTML = info.svg;
          badgeName.textContent = info.name;
          badgeName.style.color = info.color;
        } else {
          modelBadge.style.display = 'none';
        }
      }
    }

    providerSelect.addEventListener('change', () => {
      const val = providerSelect.value;
      if (PRESETS[val]) {
        baseUrlInput.value = PRESETS[val];
      }
      updateModelProvider();
    });

    modelInput.addEventListener('input', updateModelProvider);

    fetchBtn.addEventListener('click', () => {
      const baseUrl = baseUrlInput.value.trim();
      const apiKey = document.getElementById('apiKey').value.trim();
      if (!baseUrl) {
        fetchStatus.textContent = 'Please enter a valid Base URL first.';
        fetchStatus.style.color = 'var(--error-fg)';
        return;
      }
      fetchBtn.disabled = true;
      fetchBtn.innerHTML = '<span class="codicon codicon-loading codicon-modifier-spin"></span><span>Querying...</span>';
      fetchStatus.textContent = 'Querying ' + baseUrl + '/models...';
      fetchStatus.style.color = 'var(--desc-fg)';
      vscode.postMessage({ command: 'fetchModels', baseUrl, apiKey });
    });

    modelDropdown.addEventListener('change', () => {
      if (modelDropdown.value) {
        modelInput.value = modelDropdown.value;
        updateModelProvider();
      }
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      fetchBtn.disabled = false;
      fetchBtn.innerHTML = '<span class="codicon codicon-refresh"></span><span>Fetch Models</span>';

      if (msg.command === 'modelsLoaded') {
        if (!msg.models || msg.models.length === 0) {
          fetchStatus.textContent = 'Endpoint returned 0 models.';
          fetchStatus.style.color = 'var(--error-fg)';
          return;
        }
        fetchStatus.textContent = 'Successfully discovered ' + msg.models.length + ' model(s).';
        fetchStatus.style.color = 'var(--success-fg)';
        modelDropdown.innerHTML = '<option value="">-- Choose discovered model ID --</option>';
        msg.models.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          const detected = detectProvider(m, providerSelect.value);
          const pName = (PROVIDERS[detected] && detected !== 'generic') ? '[' + PROVIDERS[detected].name + '] ' : '';
          opt.textContent = pName + m;
          modelDropdown.appendChild(opt);
        });
        emptyState.style.display = 'none';
        dropdownContainer.style.display = 'block';
      } else if (msg.command === 'error') {
        fetchStatus.textContent = msg.message;
        fetchStatus.style.color = 'var(--error-fg)';
      } else if (msg.command === 'saveSuccess') {
        saveStatus.innerHTML = '<span class="codicon codicon-pass" style="color:var(--success-fg); margin-right:4px;"></span>Settings saved successfully!';
        saveStatus.style.color = 'var(--success-fg)';
        setTimeout(() => {
          saveStatus.textContent = 'Settings are saved locally to your VS Code environment.';
          saveStatus.style.color = 'var(--desc-fg)';
        }, 4000);
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

    updateModelProvider();
  `;
}
