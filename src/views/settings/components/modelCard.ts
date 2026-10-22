export function renderModelCard(config: any): string {
  return /* html */ `
    <div class="card">
      <div class="card-header">
        <svg viewBox="0 0 16 16"><path d="M14 5V3.5A1.5 1.5 0 0012.5 2H11V1H9v1H7V1H5v1H3.5A1.5 1.5 0 002 3.5V5H1v2h1v2H1v2h1v1.5A1.5 1.5 0 003.5 14H5v1h2v-1h2v1h2v-1h1.5a1.5 1.5 0 001.5-1.5V11h1V9h-1V7h1V5h-1zm-1 6.5a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v7zM5 5h6v6H5V5z"/></svg>
        <h2>Model Selection</h2>
      </div>

      <div class="field">
        <label for="modelSelect">
          <svg viewBox="0 0 16 16"><path d="M7.5 1l1.2 3.8 3.8 1.2-3.8 1.2L7.5 11 6.3 7.2 2.5 6l3.8-1.2L7.5 1zm5 8l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z"/></svg>
          <span>Target Model Name / Combo ID</span>
        </label>
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
