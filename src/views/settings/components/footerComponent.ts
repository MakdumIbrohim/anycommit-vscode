export function renderFooterComponent(): string {
  return /* html */ `
    <div class="footer-bar">
      <div class="footer-content">
        <div id="saveStatus" class="save-status">Settings are saved locally to your VS Code environment.</div>
        <button id="saveBtn" type="button">
          <span class="codicon codicon-check"></span>
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  `;
}
