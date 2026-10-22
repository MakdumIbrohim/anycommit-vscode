export function renderModelCard(config: any): string {
  return /* html */ `
    <div class="card">
      <div class="card-header">
        <span class="codicon codicon-chip"></span>
        <h2>Model Selection</h2>
      </div>

      <div class="field">
        <label for="modelSelect">
          <span class="codicon codicon-sparkle"></span>
          <span>Target Model Name / Combo ID</span>
          <span id="modelProviderBadge" class="provider-badge">
            <span id="modelProviderIcon" class="provider-badge-icon"></span>
            <span id="modelProviderName" class="provider-badge-name"></span>
          </span>
        </label>
        <div class="input-button-group">
          <div class="input-with-icon">
            <span id="modelInputIcon" class="input-icon-container"></span>
            <input type="text" id="modelSelect" value="${config.model || ''}" placeholder="e.g. gpt-4o, claude-3-5-sonnet, deepseek-chat" />
          </div>
          <button id="fetchModelsBtn" class="secondary" type="button">
            <span class="codicon codicon-refresh"></span>
            <span>Fetch Models</span>
          </button>
        </div>
        <div id="fetchStatus" class="help" style="margin-top: 8px;"></div>

        <!-- Empty State for Models -->
        <div id="modelsEmptyState" class="empty-state">
          <span class="codicon codicon-info"></span>
          <div class="empty-state-title">No Endpoint Models Discovered Yet</div>
          <div class="empty-state-text">
            Click <strong>Fetch Models</strong> to query the active base URL and load available combo or model IDs into a selectable dropdown.
          </div>
        </div>

        <!-- Discovered Dropdown Container -->
        <div id="modelsDropdownContainer" style="display: none;">
          <label for="modelDropdown">
            <span class="codicon codicon-list-selection"></span>
            <span>Select from Discovered Endpoint Models:</span>
          </label>
          <select id="modelDropdown"></select>
        </div>
      </div>
    </div>
  `;
}
