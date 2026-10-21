export function renderModelCard(config: any): string {
  return /* html */ `
    <div class="card">
      <div class="card-header">
        <svg viewBox="0 0 16 16"><path d="M8 1L2 5v6l6 4 6-4V5L8 1zm0 2.2L12.5 6 8 8.8 3.5 6 8 3.2zM3 7.2l4.5 2.8v4.5L3 11.7V7.2zm10 4.5l-4.5 2.8v-4.5L13 7.2v4.5z"/></svg>
        <h2>Model Selection</h2>
      </div>

      <div class="field">
        <label for="modelSelect">Target Model Name / Combo ID</label>
        <div class="input-button-group">
          <input type="text" id="modelSelect" value="${config.model || ''}" placeholder="e.g. premium-coding, cc/claude-opus-4-6, gpt-4o" />
          <button id="fetchModelsBtn" class="secondary" type="button">
            <svg viewBox="0 0 16 16"><path d="M13.5 2A6.5 6.5 0 1014 9.5h-1.5A5 5 0 118 3c1.3 0 2.4.5 3.3 1.3L9.5 6H14V1.5l-1.6 1.6C11.1 2.1 9.6 1.5 8 1.5z"/></svg>
            <span>Fetch Models</span>
          </button>
        </div>
        <div id="fetchStatus" class="help" style="margin-top: 8px;"></div>

        <!-- Empty State for Models -->
        <div id="modelsEmptyState" class="empty-state">
          <svg viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm0 2.5a.75.75 0 00-.75.75v3.5c0 .41.34.75.75.75h2a.75.75 0 000-1.5h-1.25V5.75A.75.75 0 008 5z"/></svg>
          <div class="empty-state-title">No Endpoint Models Discovered Yet</div>
          <div class="empty-state-text">
            Click <strong>Fetch Models</strong> to query the active base URL and load available combo or model IDs into a selectable dropdown.
          </div>
        </div>

        <!-- Discovered Dropdown Container -->
        <div id="modelsDropdownContainer" style="display: none;">
          <label for="modelDropdown">Select from Discovered Endpoint Models:</label>
          <select id="modelDropdown"></select>
        </div>
      </div>
    </div>
  `;
}
