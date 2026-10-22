# Changelog

All notable changes to the "anycommit" extension will be documented in this file.

## [0.2.0] - 2026-10-22

### Added
- **AnyCommit Built-in Gateway**: Zero-config default free router (`anycommit/auto-free`) connecting to high-speed models (Meta LLaMA 3.3 70B, DeepSeek R1, LLaMA 3.2 3B) with no API keys required.
- **Interactive Settings Dashboard**: Dedicated graphical settings panel (`AI Commit: Open Settings Dashboard`) with live endpoint model discovery and instant search filtering.
- **Official Model Branding**: Automatic detection and rendering of official AI provider logos (ChatGPT, Claude, Gemini, DeepSeek, Meta LLaMA, Mistral, Qwen, Ollama) directly inside the model selector.
- **Native VS Code Codicons**: Standardized all dashboard and action icons using official VS Code Codicons.
- **Dual Protocol Support**: Automatic parsing for both Server-Sent Events (SSE) streaming and standard JSON responses.
- **First-Run Free Tier Scanner**: Background engine to discover local gateways (`9router`, `Ollama`) and zero-cost endpoints on startup.

## [0.1.2] - 2026-10-21

### Changed
- Refactored dashboard webview into modular component architecture.
- Added themed SVG icons for generate and regenerate SCM buttons.
- Enhanced SecretStorage fallback when querying model endpoints without manual API key.

## [0.1.0] - 2026-10-16

### Initial Release

- **Staged Diff Commit Generation**: Generate commit messages directly from staged git diffs via SCM sparkle button or Command Palette.
- **Local Gateway Support**: Out-of-the-box presets for 9router and OmniRoute (`http://localhost:20128/v1`) with optional API keys and flexible model/combo naming.
- **Cloud Provider Presets**: Presets for OpenAI, OpenRouter, Groq, DeepSeek, and Custom OpenAI-compatible endpoints.
- **Streaming Output**: Real-time token streaming to the SCM input box with cancellation support.
- **Commit Styles**: Conventional Commits, Gitmoji, and Plain styles with configurable language and optional body.
- **Style Learning**: Automatically extract 5 recent commits from the repository as style/tone examples.
- **Diff Filtering**: Automatic exclusion of sensitive files (`.env*`, private keys, certificates), lockfiles, and binaries.
- **Secure Key Storage**: Encrypted credential storage via VS Code `SecretStorage` per provider.
- **URL Safety**: Automatic normalization and security warnings for non-localhost HTTP endpoints.
