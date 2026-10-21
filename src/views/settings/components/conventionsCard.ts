export function renderConventionsCard(config: any): string {
  return /* html */ `
    <div class="card">
      <div class="card-header">
        <svg viewBox="0 0 16 16"><path d="M4 1.5h8l3 3v10H1v-13h3zm0 1H2v11h12V5h-2.5V2.5H4zm6 0v2H12l-2-2z"/></svg>
        <h2>Commit Conventions & Formatting</h2>
      </div>

      <div class="field">
        <label for="styleSelect">Commit Format Style</label>
        <select id="styleSelect">
          <option value="conventional" ${config.style === 'conventional' ? 'selected' : ''}>Conventional Commits (e.g. feat(auth): add login validation)</option>
          <option value="gitmoji" ${config.style === 'gitmoji' ? 'selected' : ''}>Gitmoji Convention (e.g. :sparkles: add authentication)</option>
          <option value="plain" ${config.style === 'plain' ? 'selected' : ''}>Plain Imperative Sentence (e.g. Add login validation)</option>
        </select>
      </div>

      <div class="field">
        <label for="languageInput">Commit Language</label>
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
