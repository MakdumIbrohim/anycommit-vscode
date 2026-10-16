<p align="center">
  <img src="media/icon.png" width="128" height="128" alt="AnyCommit Logo" />
</p>

<h1 align="center">AnyCommit</h1>

<p align="center">
  Generate git commit messages from staged diffs using any OpenAI-compatible API, including local gateways (9router, OmniRoute), cloud providers, or custom endpoints.
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=makdumibrohim.anycommit"><img src="https://img.shields.io/badge/VS%20Code-^1.85.0-blue.svg" alt="VS Code Version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT" /></a>
  <img src="https://img.shields.io/badge/Dependencies-0%20Runtime-orange.svg" alt="Zero Runtime Dependencies" />
</p>

<!-- DEMO PREVIEW -->
<!-- <p align="center"><img src="media/demo.gif" alt="AnyCommit Demo" width="100%" /></p> -->

---

## Overview

AnyCommit connects your git workflow to OpenAI-compatible endpoints directly from VS Code. It reads staged changes via the native Git extension, generates commit messages using your configured model, and streams the output directly into the Source Control input box.

- **Local Gateway First**: Pre-configured presets for **9router** and **OmniRoute** (`http://localhost:20128/v1`). Authentication is optional for local instances.
- **Provider Presets**: Works with OpenAI, OpenRouter, Groq, DeepSeek, and custom base URLs.
- **Smart Formatting**: Supports Conventional Commits, Gitmoji, and Plain imperative styles. Infers scope from directory paths and extracts ticket IDs from branch names.
- **Diff Sanitation**: Filters out lockfiles, binaries, and sensitive files (`.env*`, private keys, certificates) before making requests.
- **Zero Runtime Dependencies**: Written in TypeScript using native Node.js fetch and Web Streams.

---

## Quick Start

### Local Gateway (9router / OmniRoute)

1. Start your gateway in a terminal:
   ```bash
   # 9router
   npx 9router

   # or OmniRoute
   omniroute
   ```
2. In VS Code, click the **AnyCommit** item in the status bar (bottom-left) or run `AI Commit: Select Model` (`Ctrl+Shift+P`).
3. Select your model or combo (e.g. `premium-coding` or `cc/claude-opus-4-6`).
4. Stage changes in Source Control (`git add`), then click the AnyCommit icon in the Source Control title bar.

### Cloud Providers

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run `AI Commit: Select Provider`.
2. Choose your provider: **OpenAI**, **OpenRouter**, **Groq**, **DeepSeek**, or **Custom**.
3. Set your API key:
   - Run `AI Commit: Set API Key` to store it in VS Code `SecretStorage`, or
   - Enter it in Settings (`Ctrl+,` > search `aiCommit.apiKey`).
4. Run `AI Commit: Select Model` to pick an available model.

---

## Features

- **Streaming Output**: Tokens stream directly into the commit input box with full cancellation support.
- **Regenerate Button**: Click the refresh button in the SCM title bar to clear the previous message and generate an alternative with higher sampling temperature.
- **Smart Scope Detection**: In Conventional Commits mode, automatically infers scope from modified subdirectories (e.g., changes to `src/auth/*` produce `feat(auth): ...`).
- **Ticket Extraction**: Optionally extracts ticket/issue identifiers from git branch names (e.g., `feature/PROJ-123-login` sets ticket `PROJ-123`).
- **Recent Commit Tone Learning**: Samples recent commit messages from the repository to match your team's tone and formatting.
- **Reasoning Model Support**: Automatically strips `<think>...</think>` tags from reasoning models (DeepSeek R1, Muse Spark, Qwen) and falls back to non-streaming requests if SSE is unsupported.

---

## Configuration

All options are configurable in VS Code Settings (`Ctrl+,` > search **AnyCommit**):

| Setting                            | Default           | Description                                                                                            |
| :--------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------- |
| `aiCommit.provider`                | `"9router"`       | Active provider preset (`9router`, `omniroute`, `openai`, `openrouter`, `groq`, `deepseek`, `custom`). |
| `aiCommit.baseUrl`                 | `""`              | Override base URL (e.g. `http://localhost:20128/v1`). Required for `custom` provider.                  |
| `aiCommit.apiKey`                  | `""`              | API key. If left blank, AnyCommit reads from encrypted `SecretStorage`.                                |
| `aiCommit.model`                   | `""`              | Model or combo ID (e.g. `premium-coding`, `gpt-4o`).                                                   |
| `aiCommit.style`                   | `"conventional"`  | Commit format: `conventional`, `gitmoji`, or `plain`.                                                  |
| `aiCommit.autoDetectScope`         | `true`            | In Conventional Commits mode, infer scope from modified directory paths.                               |
| `aiCommit.extractTicketFromBranch` | `false`           | Extract ticket identifier from the current git branch name.                                            |
| `aiCommit.ticketPattern`           | `"[A-Z]+-[0-9]+"` | Regular expression used to extract ticket IDs from branch names.                                       |
| `aiCommit.language`                | `"English"`       | Language for generated commit messages (e.g. `English`, `Indonesian`).                                 |
| `aiCommit.includeBody`             | `false`           | Include detailed bullet points below the commit subject line.                                          |
| `aiCommit.useRecentCommits`        | `true`            | Include recent commits in prompt as style and tone examples.                                           |
| `aiCommit.extraInstructions`       | `""`              | Custom prompt instructions (e.g. "always reference PR number").                                        |
| `aiCommit.maxDiffChars`            | `20000`           | Maximum character length of git diff sent to LLM.                                                      |
| `aiCommit.temperature`             | `0.2`             | Sampling temperature (0.0 to 2.0).                                                                     |
| `aiCommit.maxTokens`               | `1000`            | Maximum completion tokens.                                                                             |
| `aiCommit.timeoutSeconds`          | `60`              | Request timeout in seconds.                                                                            |

---

## Commands

| Command                   | Title                                    | Description                                                     |
| :------------------------ | :--------------------------------------- | :-------------------------------------------------------------- |
| `aiCommit.generate`       | **AI Commit: Generate Commit Message**   | Generate a commit message from staged changes.                  |
| `aiCommit.regenerate`     | **AI Commit: Regenerate Commit Message** | Clear draft and generate an alternative message.                |
| `aiCommit.showQuickMenu`  | **AI Commit: Show Quick Menu**           | Open the interactive menu to switch model, provider, or keys.   |
| `aiCommit.selectModel`    | **AI Commit: Select Model**              | Query `/models` endpoint to pick a model, with manual fallback. |
| `aiCommit.selectProvider` | **AI Commit: Select Provider**           | Switch active provider preset.                                  |
| `aiCommit.setApiKey`      | **AI Commit: Set API Key**               | Store API key in encrypted SecretStorage.                       |
| `aiCommit.clearApiKey`    | **AI Commit: Clear API Key**             | Delete stored key for active provider.                          |

---

## Privacy and Security

- **Direct Connections**: Requests are sent directly from your machine to your configured endpoint. There are no intermediary servers, telemetry, or analytics.
- **Sensitive File Exclusion**: Git diffs automatically exclude `.env*` files, private keys (`*.pem`, `*.key`, `id_rsa*`), certificates, lockfiles, and binary files.
- **Plaintext Warning**: If a remote endpoint uses unencrypted `http://` (non-localhost), AnyCommit shows a warning before sending diffs.

---

## Remote, SSH, and WSL

In remote workspaces (Remote-SSH, WSL, Dev Containers), extensions run on the remote machine:

- A gateway running on your local machine (`http://localhost:20128`) is not directly reachable as `localhost` inside the remote container.
- **Solutions**:
  1. Forward port `20128` in VS Code's **Ports** tab, or
  2. Set `aiCommit.baseUrl` to `http://host.docker.internal:20128/v1` or your host machine IP.

---

## Troubleshooting

- **Cannot reach `http://localhost:20128/v1`**: Verify 9router (`npx 9router`) or OmniRoute is running in terminal.
- **API key missing or invalid**: Run `AI Commit: Set API Key` or configure `aiCommit.apiKey` in Settings.
- **No staged changes found**: Stage files with `git add` or confirm the prompt to use working tree changes.
- **Model or endpoint not found**: Ensure your base URL ends with `/v1` and the model name matches an ID returned by your gateway.

---

## License

MIT &copy; 2026 [MakdumIbrohim](https://github.com/MakdumIbrohim).
