export function renderHeaderComponent(): string {
  return /* html */ `
    <div class="header-container">
      <div class="title-row">
        <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.5 1v4m0 6v4m0-7a3 3 0 100-6 3 3 0 000 6zm6.5-5.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z"/>
        </svg>
        <h1>AnyCommit Dashboard</h1>
      </div>
      <div class="subtitle">
        Configure local gateways, remote OpenAI-compatible endpoints, and commit prompt rules.
      </div>
    </div>
  `;
}
