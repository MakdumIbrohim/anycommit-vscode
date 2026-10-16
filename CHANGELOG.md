# Changelog

All notable changes to the "anycommit" extension will be documented in this file.

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
