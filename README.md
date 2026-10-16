# AnyCommit: AI Commit Message

AnyCommit is a lightweight, privacy-focused VS Code extension that generates clean, consistent git commit messages from your staged diffs using any OpenAI-compatible API — including self-hosted gateways like **9router** and **OmniRoute**, as well as OpenAI, OpenRouter, Groq, DeepSeek, or any custom endpoint.

---

## Features

- **One-Click Generation**: Click the sparkle icon in the Source Control panel or use `AI Commit: Generate Commit Message`.
- **Real-Time Streaming**: Stream commit messages directly into the commit input box as they are generated, with full cancellation support.
- **Local Gateway Support**: Built-in presets for **9router** and **OmniRoute** (`http://localhost:20128/v1`). Authentication keys are optional for local gateways.
- **Multi-Provider Presets**: Quick switching between 9router, OmniRoute, OpenAI, OpenRouter, Groq, DeepSeek, and Custom endpoints.
- **Commit Styles**: Choose between **Conventional Commits** (`feat:`, `fix:`, etc.), **Gitmoji** (`:sparkles:`, `:bug:`), or **Plain** imperative sentences.
- **Tone & Style Learning**: Automatically samples recent commits from your repository so the generated message matches your team's style.
- **Smart Diff Filtering**: Automatically filters out sensitive files (`.env*`, `*.pem`, `*.key`), lockfiles (`package-lock.json`, `pnpm-lock.yaml`, etc.), and binary files before sending.
- **Secure Key Storage**: API keys are saved exclusively in VS Code's encrypted `SecretStorage` (`context.secrets`) — never written to `settings.json`, git history, or logs.
- **Zero Runtime Dependencies**: Built with native Node.js `fetch` and ES2022. No heavy runtime dependencies.

---

## Quick Start with 9router or OmniRoute

### 1. 9router (Recommended for local multi-model routing)

1. Start 9router in your terminal:
   ```bash
   npx 9router
   ```
2. In VS Code, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):
   - Run `AI Commit: Select Provider` and pick **9router**.
   - Run `AI Commit: Select Model` and pick your preferred model or combo (e.g. `premium-coding` or `cc/claude-opus-4-6`).
3. Stage changes in git (`+`), then click the sparkle icon above the Source Control commit box.

### 2. OmniRoute

1. Start OmniRoute:
   ```bash
   npm install -g omniroute
   omniroute
   ```
2. In VS Code:
   - Run `AI Commit: Select Provider` and select **OmniRoute**.
   - (Optional) Run `AI Commit: Set API Key` if your OmniRoute instance requires an auth token.
   - Run `AI Commit: Select Model` to select a model or combo (e.g. `auto/best-coding`).

---

## Setup with Cloud Providers

AnyCommit provides presets for standard cloud providers:

1. Run `AI Commit: Select Provider` and choose one of:
   - **OpenAI** (`https://api.openai.com/v1`)
   - **OpenRouter** (`https://openrouter.ai/api/v1`)
   - **Groq** (`https://api.groq.com/openai/v1`)
   - **DeepSeek** (`https://api.deepseek.com/v1`)
   - **Custom** (Enter your own base URL, e.g. `https://my-llm.corp.internal/v1`)
2. Run `AI Commit: Set API Key` and paste your provider's API key.
3. Run `AI Commit: Select Model` to pick a model.

---

## Configuration Settings

You can customize AnyCommit via VS Code Settings (`settings.json`):

| Setting | Default | Description |
| --- | --- | --- |
| `aiCommit.provider` | `"9router"` | Active provider preset (`9router`, `omniroute`, `openai`, `openrouter`, `groq`, `deepseek`, `custom`). |
| `aiCommit.baseUrl` | `""` | Override base URL (e.g. `http://localhost:20128/v1`). Required for `custom` provider. |
| `aiCommit.model` | `""` | Model or combo ID (e.g. `cc/claude-opus-4-6`, `premium-coding`, `auto/best-coding`). |
| `aiCommit.language` | `"English"` | Language for generated commit message (e.g. `English`, `Indonesian`). |
| `aiCommit.style` | `"conventional"` | Commit style format: `conventional`, `gitmoji`, or `plain`. |
| `aiCommit.includeBody` | `false` | Include detailed bullet points body below the commit subject. |
| `aiCommit.useRecentCommits` | `true` | Include recent repository commits as tone and style examples. |
| `aiCommit.extractTicketFromBranch` | `false` | Automatically extract ticket ID from current git branch name. |
| `aiCommit.ticketPattern` | `"[A-Z]+-[0-9]+"` | Regex pattern used to extract ticket ID from branch name. |
| `aiCommit.extraInstructions` | `""` | Custom prompt instructions (e.g. "include issue ticket from branch name"). |
| `aiCommit.maxDiffChars` | `20000` | Maximum character length of git diff sent to LLM. |
| `aiCommit.temperature` | `0.2` | Sampling temperature (0.0 to 2.0). |
| `aiCommit.maxTokens` | `400` | Maximum completion tokens. |
| `aiCommit.timeoutSeconds` | `60` | Request timeout in seconds. |

---

## Commands

- `AI Commit: Generate Commit Message` (`aiCommit.generate`): Generates message from staged diff.
- `AI Commit: Select Provider` (`aiCommit.selectProvider`): Switch between presets or custom endpoints.
- `AI Commit: Select Model` (`aiCommit.selectModel`): Fetch and choose from available models, with manual fallback.
- `AI Commit: Set API Key` (`aiCommit.setApiKey`): Safely store API key in VS Code SecretStorage.
- `AI Commit: Clear API Key` (`aiCommit.clearApiKey`): Delete stored API key for the current provider.

---

## Security & Privacy

- **Direct Communication**: AnyCommit communicates directly from your machine to the configured endpoint. There are no intermediary servers, analytics, or telemetry.
- **Sensitive File Exclusion**: Patterns like `.env*`, `*.pem`, `*.key`, `id_rsa*`, credentials, lockfiles, and binary files are automatically excluded from diffs.
- **Plaintext Warning**: If an unencrypted `http://` URL is configured for a remote host (outside `localhost` / `127.0.0.1`), AnyCommit warns you that credentials and diffs may travel in cleartext.

---

## Remote, SSH, and WSL Environments

In VS Code Remote (Remote-SSH, WSL, Dev Containers), extensions run on the **remote host**:
- If 9router or OmniRoute is running on your **local machine**, `http://localhost:20128/v1` inside the remote container will point to the container/remote machine, not your host laptop.
- **Solution**: Use VS Code's **Port Forwarding** tab to forward port `20128`, or configure `aiCommit.baseUrl` to use `http://host.docker.internal:20128/v1` or your local machine IP.

---

## Troubleshooting

- **"Cannot reach http://localhost:20128/v1. Is your gateway (9router/OmniRoute) running?"**
  Verify that 9router (`npx 9router`) or OmniRoute is running and responding on port 20128.
- **"API key missing or invalid."**
  Run `AI Commit: Set API Key` to set or refresh your API key for the active provider.
- **"Model or endpoint not found (check base URL and model)."**
  Check that the base URL ends with `/v1` and that the model name exists in your gateway or provider.
- **"No staged changes found."**
  Stage your modified files in Source Control (`git add`), or accept the prompt to generate from working tree changes.

---

## License

MIT License. Copyright (c) 2026 MakdumIbrohim.
