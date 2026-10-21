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

      <div class="metric-bar">
        <div class="metric-chip">
          <svg viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 7.5h-3v3h-1v-3h-3v-1h3v-3h1v3h3v1z"/></svg>
          <span>Protocol: <strong>OpenAI Chat Completions</strong></span>
        </div>
        <div class="metric-chip">
          <svg viewBox="0 0 16 16"><path d="M11 5V4a3 3 0 00-6 0v1H4v8h8V5h-1zm-4-1a1 1 0 112 0v1H7V4zm4 8H5V6h6v6z"/></svg>
          <span>Key Storage: <strong>VS Code SecretStorage</strong></span>
        </div>
        <div class="metric-chip">
          <svg viewBox="0 0 16 16"><path d="M1 3.5l1.5-1.5L8 7.5 13.5 2 15 3.5 8 10.5 1 3.5z"/></svg>
          <span>Streaming: <strong>SSE Enabled (Auto Fallback)</strong></span>
        </div>
      </div>
    </div>
  `;
}
