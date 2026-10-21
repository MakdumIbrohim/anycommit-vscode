export function getSettingsStyles(): string {
  return /* css */ `
    :root {
      --font-family: var(--vscode-font-family);
      --bg: var(--vscode-editor-background);
      --fg: var(--vscode-editor-foreground);
      --input-bg: var(--vscode-input-background);
      --input-fg: var(--vscode-input-foreground);
      --input-border: var(--vscode-input-border);
      --btn-bg: var(--vscode-button-background);
      --btn-fg: var(--vscode-button-foreground);
      --btn-hover: var(--vscode-button-hoverBackground);
      --btn-sec-bg: var(--vscode-button-secondaryBackground);
      --btn-sec-fg: var(--vscode-button-secondaryForeground);
      --btn-sec-hover: var(--vscode-button-secondaryHoverBackground);
      --card-border: var(--vscode-widget-border, rgba(128, 128, 128, 0.25));
      --desc-fg: var(--vscode-descriptionForeground);
      --success-fg: var(--vscode-testing-iconPassed, #4ec9b0);
      --error-fg: var(--vscode-errorForeground, #f14c4c);
    }
    * { box-sizing: border-box; }
    body {
      font-family: var(--font-family);
      background: var(--bg);
      color: var(--fg);
      padding: 32px 24px 80px 24px;
      max-width: 800px;
      margin: auto;
      line-height: 1.5;
    }

    /* Header */
    .header-container { margin-bottom: 24px; }
    .title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .title-row h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .subtitle { font-size: 13px; color: var(--desc-fg); margin-top: 4px; }

    /* Card Container */
    .card {
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 24px;
      background: rgba(255, 255, 255, 0.015);
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--card-border);
    }
    .card-header svg { width: 16px; height: 16px; fill: currentColor; opacity: 0.85; }
    .card-header h2 {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--desc-fg);
    }

    /* Form Elements */
    .field { margin-bottom: 18px; }
    .field:last-child { margin-bottom: 0; }
    label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 12.5px;
      margin-bottom: 6px;
    }
    label svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
      opacity: 0.85;
      flex-shrink: 0;
    }
    .help { font-size: 11.5px; color: var(--desc-fg); margin-top: 5px; }
    select, input[type="text"], input[type="password"] {
      width: 100%;
      height: 34px;
      padding: 0 10px;
      background: var(--input-bg);
      color: var(--input-fg);
      border: 1px solid var(--input-border);
      border-radius: 3px;
      font-size: 13px;
      font-family: inherit;
    }
    select:focus, input:focus { outline: 1px solid var(--vscode-focusBorder); }

    /* Custom Row Layouts */
    .input-button-group { display: flex; gap: 8px; }
    .input-button-group input { flex: 1; }

    /* Buttons */
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 34px;
      padding: 0 16px;
      background: var(--btn-bg);
      color: var(--btn-fg);
      border: none;
      border-radius: 3px;
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    button:hover { background: var(--btn-hover); }
    button.secondary {
      background: var(--btn-sec-bg);
      color: var(--btn-sec-fg);
      border: 1px solid var(--card-border);
    }
    button.secondary:hover { background: var(--btn-sec-hover); }
    button svg { width: 14px; height: 14px; fill: currentColor; }

    /* Empty State Display */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      border: 1px dashed var(--card-border);
      border-radius: 4px;
      text-align: center;
      margin-top: 10px;
      color: var(--desc-fg);
    }
    .empty-state svg { width: 32px; height: 32px; opacity: 0.45; margin-bottom: 8px; fill: currentColor; }
    .empty-state-title { font-size: 13px; font-weight: 600; color: var(--fg); margin-bottom: 2px; }
    .empty-state-text { font-size: 12px; max-width: 380px; }

    /* Discovered List Container */
    #modelsDropdownContainer {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--card-border);
    }

    /* Checkbox Controls */
    .checkbox-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; cursor: pointer; }
    .checkbox-item input[type="checkbox"] { margin-top: 3px; cursor: pointer; }
    .checkbox-label { font-size: 12.5px; font-weight: 500; margin-bottom: 1px; }
    .checkbox-desc { font-size: 11.5px; color: var(--desc-fg); }

    /* Sticky Footer */
    .footer-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 12px 24px;
      background: var(--bg);
      border-top: 1px solid var(--card-border);
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
      z-index: 100;
    }
    .footer-content {
      width: 100%;
      max-width: 800px;
      margin: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .save-status { font-size: 12px; color: var(--desc-fg); }
  `;
}
