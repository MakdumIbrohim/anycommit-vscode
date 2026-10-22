export function renderHeaderComponent(): string {
  return /* html */ `
    <div class="header-container">
      <div class="title-row">
        <span class="codicon codicon-sparkle header-icon"></span>
        <h1>AnyCommit Dashboard</h1>
      </div>
      <div class="subtitle">
        Configure local gateways, remote OpenAI-compatible endpoints, and commit prompt rules.
      </div>
    </div>
  `;
}
