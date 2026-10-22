export function renderFooterComponent(): string {
  return /* html */ `
    <div class="footer-bar">
      <div class="footer-content">
        <div id="saveStatus" class="save-status">Settings are saved locally to your VS Code environment.</div>
        <button id="saveBtn" type="button">
          <svg viewBox="0 0 16 16"><path d="M13.8 3.2a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L2.2 9.4a1 1 0 0 1 1.4-1.4l2 2 6.8-6.8a1 1 0 0 1 1.4 0z"/></svg>
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  `;
}
