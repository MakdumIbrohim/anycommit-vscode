export function renderConventionsCard(config: any): string {
  return /* html */ `
    <div class="card">
      <div class="card-header">
        <svg viewBox="0 0 16 16"><path d="M4 1.5h8l3 3v10H1v-13h3zm0 1H2v11h12V5h-2.5V2.5H4zm6 0v2H12l-2-2z"/></svg>
        <h2>Commit Conventions & Formatting</h2>
      </div>

      <div class="field">
        <label for="styleSelect">
          <svg viewBox="0 0 16 16"><path d="M5.5 1v4m0 6v4m0-7a3 3 0 100-6 3 3 0 000 6z"/></svg>
          <span>Commit Format Style</span>
        </label>
        <select id="styleSelect">
          <option value="conventional" ${config.style === 'conventional' ? 'selected' : ''}>Conventional Commits (e.g. feat(auth): add login validation)</option>
          <option value="gitmoji" ${config.style === 'gitmoji' ? 'selected' : ''}>Gitmoji Convention (e.g. :sparkles: add authentication)</option>
          <option value="plain" ${config.style === 'plain' ? 'selected' : ''}>Plain Imperative Sentence (e.g. Add login validation)</option>
        </select>
      </div>

      <div class="field">
        <label for="languageInput">
          <svg viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zM2.05 8a5.96 5.96 0 01.35-2h2.24c-.09.65-.14 1.32-.14 2 0 .68.05 1.35.14 2H2.4a5.96 5.96 0 01-.35-2zm3.89 0c0-.67.06-1.34.16-2h3.8c.1.66.16 1.33.16 2 0 .67-.06 1.34-.16 2h-3.8c-.1-.66-.16-1.33-.16-2z"/></svg>
          <span>Commit Language</span>
        </label>
        <input type="text" id="languageInput" value="${config.language || 'English'}" placeholder="English, Indonesian, etc." />
      </div>

      <div class="field">
        <label class="checkbox-item">
          <input type="checkbox" id="autoDetectScope" ${config.autoDetectScope ? 'checked' : ''} />
          <div>
            <div class="checkbox-label">Smart Scope Detection</div>
            <div class="checkbox-desc">Analyzes modified paths to infer scope (e.g., changes in <code>src/auth/</code> yield <code>(auth)</code>).</div>
          </div>
        </label>

        <label class="checkbox-item">
          <input type="checkbox" id="extractTicketFromBranch" ${config.extractTicketFromBranch ? 'checked' : ''} />
          <div>
            <div class="checkbox-label">Branch Ticket Extraction</div>
            <div class="checkbox-desc">Extracts issue ticket IDs (e.g. <code>PROJ-123</code>) from git branch names and prefixes the commit.</div>
          </div>
        </label>

        <label class="checkbox-item">
          <input type="checkbox" id="includeBody" ${config.includeBody ? 'checked' : ''} />
          <div>
            <div class="checkbox-label">Include Body Bullet Points</div>
            <div class="checkbox-desc">Generates detailed explanatory bullet points below the main subject line.</div>
          </div>
        </label>
      </div>
    </div>
  `;
}
