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

    const providerSelect = document.getElementById('providerSelect');
    const baseUrlInput = document.getElementById('baseUrl');
    const modelInput = document.getElementById('modelSelect');
    const fetchBtn = document.getElementById('fetchModelsBtn');
    const fetchStatus = document.getElementById('fetchStatus');
    const emptyState = document.getElementById('modelsEmptyState');
    const dropdownContainer = document.getElementById('modelsDropdownContainer');
    const modelDropdown = document.getElementById('modelDropdown');
    const saveBtn = document.getElementById('saveBtn');
    const saveStatus = document.getElementById('saveStatus');

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
        fetchStatus.textContent = 'Please enter a valid Base URL first.';
        fetchStatus.style.color = 'var(--error-fg)';
        return;
      }
      fetchBtn.disabled = true;
      fetchBtn.innerHTML = '<span>Querying...</span>';
      fetchStatus.textContent = 'Querying ' + baseUrl + '/models...';
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
      fetchBtn.disabled = false;
      fetchBtn.innerHTML = '<svg viewBox="0 0 16 16"><path d="M13.5 2A6.5 6.5 0 1014 9.5h-1.5A5 5 0 118 3c1.3 0 2.4.5 3.3 1.3L9.5 6H14V1.5l-1.6 1.6C11.1 2.1 9.6 1.5 8 1.5z"/></svg><span>Fetch Models</span>';

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
          opt.textContent = m;
          modelDropdown.appendChild(opt);
        });
        emptyState.style.display = 'none';
        dropdownContainer.style.display = 'block';
      } else if (msg.command === 'error') {
        fetchStatus.textContent = msg.message;
        fetchStatus.style.color = 'var(--error-fg)';
      } else if (msg.command === 'saveSuccess') {
        saveStatus.textContent = 'Settings saved successfully!';
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
  `;
}
