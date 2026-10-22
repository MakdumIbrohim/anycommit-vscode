import { renderHeaderComponent } from './components/headerComponent';
import { renderProviderCard } from './components/providerCard';
import { renderModelCard } from './components/modelCard';
import { renderConventionsCard } from './components/conventionsCard';
import { renderFooterComponent } from './components/footerComponent';
import { getSettingsStyles } from './settingsStyles';
import { getSettingsScript } from './settingsScript';

export function renderSettingsHtml(config: any, currentApiKey: string, codiconsUri: string = ''): string {
  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${codiconsUri ? `<link rel="stylesheet" href="${codiconsUri}">` : ''}
      <style>
        ${getSettingsStyles()}
      </style>
    </head>
    <body>
      ${renderHeaderComponent()}
      ${renderProviderCard(config, currentApiKey)}
      ${renderModelCard(config)}
      ${renderConventionsCard(config)}
      ${renderFooterComponent()}
      <script>
        ${getSettingsScript()}
      </script>
    </body>
    </html>
  `;
}
