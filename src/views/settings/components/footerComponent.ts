export function renderFooterComponent(): string {
  return /* html */ `
    <div class="footer-bar">
      <div class="footer-content">
        <div id="saveStatus" class="save-status">Settings are saved locally to your VS Code environment.</div>
        <button id="saveBtn" type="button">
          <svg viewBox="0 0 16 16"><path d="M13.7 3.3L12.7 2.3A1 1 0 0012 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V4a1 1 0 00-.3-.7zM5 3h6v3H5V3zm6 10H5V9h6v4zm1-1V8a1 1 0 00-1-1H5a1 1 0 00-1 1v4H3V3h1v4h8V3.4l1 1V12h-1z"/></svg>
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  `;
}
