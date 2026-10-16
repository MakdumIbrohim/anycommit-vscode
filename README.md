<p align="center">
  <img src="media/icon.png" width="128" height="128" alt="AnyCommit Logo" />
</p>

<h1 align="center">AnyCommit: AI Commit Message</h1>

<p align="center">
  <strong>Lightning-fast, privacy-first AI commit messages from your git diffs.</strong><br/>
  Compatible with local AI gateways (9router, OmniRoute) and any OpenAI-compatible API.
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=makdumibrohim.anycommit"><img src="https://img.shields.io/badge/VS%20Code-^1.85.0-blue.svg" alt="VS Code Version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT" /></a>
  <img src="https://img.shields.io/badge/Dependencies-0%20Runtime-orange.svg" alt="Zero Runtime Dependencies" />
</p>

---

## Why AnyCommit?

Most commit message generators lock you into a single vendor, require costly subscriptions, or leak your code through closed third-party cloud servers. 

**AnyCommit** gives you complete freedom:
- **Use Any Model**: Connect to local gateways like **9router** or **OmniRoute** to route across 15+ providers (Claude, GPT, Gemini, DeepSeek, Qwen) with zero configuration.
- **Privacy & Security First**: Diffs are sent strictly to your chosen endpoint (direct localhost or your own key). Secrets (`.env*`, private keys, lockfiles) are filtered before transmission.
- **Ultra Lightweight**: Zero runtime dependencies. Fast, clean TypeScript built on native Node.js fetch and Web Streams.

---

## Key Features

- ⚡ **One-Click Generation**: Generate clean commit messages directly from your Source Control panel or keyboard shortcut.
- 🔄 **Regenerate Button**: Instantly request fresh sentence variations with one click on the refresh icon.
- 🌊 **Real-Time Streaming**: Watch messages stream smoothly into the SCM input box token-by-token with cancellation support.
- 🎯 **Smart Scope Detection**: Automatically analyzes modified files and folders to infer accurate Conventional Commit scopes (e.g. `feat(auth): ...`).
- 🏷️ **Auto Ticket Extraction**: Automatically extracts issue/ticket IDs (e.g. `PROJ-123`, `JIRA-456`) from your current git branch name.
- 🧠 **Reasoning Model Ready**: Full support for thinking models (DeepSeek R1, Muse Spark, Qwen) — thinking tags (`<think>...</think>`) are automatically stripped.
- 🛡️ **Graceful Fallback**: Automatically falls back to standard HTTP requests if an API endpoint doesn't support Server-Sent Events (SSE).
- 📊 **Status Bar Quick Switcher**: Instant status indicator in your bottom bar — click to switch models or providers without opening Settings.
- 🔒 **Safe API Key Storage**: Credentials are encrypted in VS Code `SecretStorage` or customizable in Settings.
- ✍️ **Flexible Commit Styles**: Supports **Conventional Commits**, **Gitmoji**, and **Plain** imperative styles with customizable language and body bullet points.

---

## Quick Start

### 1. Local Gateways (9router / OmniRoute) — *No API Key Required!*

#### Using 9router (Recommended for multi-model routing)
1. Start 9router in your terminal:
   ```bash
   npx 9router
   ```
2. In VS Code, click the **AnyCommit** status bar item (or press `Ctrl+Shift+P` > `AI Commit: Select Model`).
3. Pick your model or combo (e.g., `premium-coding` or `cc/claude-opus-4-6`).
4. Stage your changes (`git add`), then click the **AnyCommit icon** in the Source Control panel!

#### Using OmniRoute
1. Start OmniRoute:
   ```bash
   npm install -g omniroute
   omniroute
   ```
2. In VS Code:
   - Run `AI Commit: Select Provider` > choose **OmniRoute**.
   - Run `AI Commit: Select Model` > choose a combo or model (e.g., `auto/best-coding`).

---

### 2. Cloud Providers (OpenAI, Groq, DeepSeek, OpenRouter)

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
2. Run `AI Commit: Select Provider` and select your provider:
   - **OpenAI** (`https://api.openai.com/v1`)
   - **OpenRouter** (`https://openrouter.ai/api/v1`)
   - **Groq** (`https://api.groq.com/openai/v1`)
   - **DeepSeek** (`https://api.deepseek.com/v1`)
   - **Custom** (Enter any self-hosted or corporate endpoint)
3. Set your API Key:
   - Run `AI Commit: Set API Key` (stored securely in SecretStorage), **OR**
   - Enter it directly under **Settings (`Ctrl+,`) > AnyCommit: Api Key**.
4. Run `AI Commit: Select Model` to choose an available model.

---

## Extension Settings

Customize AnyCommit to match your team conventions in VS Code Settings (`Ctrl+,` > search **AnyCommit**):

| Setting | Default | Description |
| :--- | :--- | :--- |
| `aiCommit.provider` | `"9router"` | Active provider preset (`9router`, `omniroute`, `openai`, `openrouter`, `groq`, `deepseek`, `custom`). |
| `aiCommit.baseUrl` | `""` | Override base URL (e.g. `http://localhost:20128/v1`). Required for `custom` provider. |
| `aiCommit.apiKey` | `""` | Optional: API key in settings. If left blank, uses encrypted `SecretStorage`. |
| `aiCommit.model` | `""` | Model or combo ID (e.g. `premium-coding`, `gpt-4o`, `auto/best-coding`). |
| `aiCommit.style` | `"conventional"` | Format style: `conventional` (`feat(scope): msg`), `gitmoji`, or `plain`. |
| `aiCommit.autoDetectScope` | `true` | Automatically detect commit scope from modified folder/file paths. |
| `aiCommit.extractTicketFromBranch` | `false` | Automatically extract ticket ID from current git branch name. |
| `aiCommit.ticketPattern` | `"[A-Z]+-[0-9]+"` | Regex pattern used to extract ticket ID from branch name. |
| `aiCommit.language` | `"English"` | Language for generated commit messages (e.g. `English`, `Indonesian`). |
| `aiCommit.includeBody` | `false` | Include detailed bullet points body below the commit subject line. |
| `aiCommit.useRecentCommits` | `true` | Feed 5 recent repository commits to the prompt to learn your project's tone. |
| `aiCommit.extraInstructions` | `""` | Custom prompt instructions (e.g. "always reference GitHub issue numbers"). |
| `aiCommit.maxDiffChars` | `20000` | Maximum character length of git diff sent to LLM. |
| `aiCommit.temperature` | `0.2` | Sampling temperature (0.0 to 2.0). |
| `aiCommit.maxTokens` | `1000` | Maximum token limit (1000+ ensures reasoning models don't truncate). |
| `aiCommit.timeoutSeconds` | `60` | Request timeout in seconds (includes automatic retry on network errors). |

---

## Available Commands

| Command | Identifier | Description |
| :--- | :--- | :--- |
| **Generate Commit Message** | `aiCommit.generate` | Generates a commit message from staged changes. |
| **Regenerate Commit Message** | `aiCommit.regenerate` | Clears previous draft and generates a fresh alternative. |
| **Show Quick Menu** | `aiCommit.showQuickMenu` | Opens the status bar menu to switch model, provider, or settings. |
| **Select Model** | `aiCommit.selectModel` | Fetches available models from endpoint with manual input fallback. |
| **Select Provider** | `aiCommit.selectProvider` | Switches active provider preset. |
| **Set API Key** | `aiCommit.setApiKey` | Safely stores provider API key in encrypted SecretStorage. |
| **Clear API Key** | `aiCommit.clearApiKey` | Clears saved API key for the current provider. |

---

## Privacy & Security

- **Direct Connections Only**: AnyCommit communicates directly from your machine to your specified endpoint. There is **no telemetry, no tracking, and no intermediary server**.
- **Automatic Secret Stripping**: All `.env*` files, private keys (`*.pem`, `*.key`, `id_rsa*`), certificates, database dumps, lockfiles, and binaries are automatically omitted from git diff payloads.
- **Unencrypted Transport Warning**: If you configure a remote base URL starting with `http://` (non-localhost), AnyCommit actively warns you before sending data in plaintext.

---

## Remote, SSH, and WSL Notes

In remote development environments (Remote-SSH, WSL, Dev Containers), extensions run on the **remote machine**:
- If your 9router or OmniRoute gateway is running on your **local laptop**, `http://localhost:20128` inside the remote workspace will point to the remote host.
- **Solution**:
  1. Forward port `20128` in VS Code's **Ports** tab, or
  2. Set `aiCommit.baseUrl` to `http://host.docker.internal:20128/v1` or your local machine IP.

---

## Troubleshooting

- **"Cannot reach http://localhost:20128/v1. Is your gateway (9router/OmniRoute) running?"**  
  Ensure your gateway is started and active in a terminal (`npx 9router` or `omniroute`).
- **"API key missing or invalid."**  
  Click **Set API Key** on the error notification or enter your key in Settings.
- **"No staged changes found."**  
  Stage your modified files (`git add`) or confirm the prompt to generate from your working tree.
- **"Model or endpoint not found."**  
  Verify that your base URL ends with `/v1` and that your model name matches your gateway's available models.

---

## License

This project is licensed under the [MIT License](LICENSE) &copy; 2026 MakdumIbrohim.
