import * as vscode from 'vscode';

export interface CommitEntry {
  message: string;
}

export interface Repository {
  rootUri: vscode.Uri;
  inputBox: {
    value: string;
  };
  ui: {
    selected: boolean;
  };
  diff(cached?: boolean): Promise<string>;
  log?(options?: { maxEntries?: number }): Promise<CommitEntry[]>;
}

export interface GitApi {
  repositories: Repository[];
}

export function getGitApi(): GitApi | undefined {
  const extension = vscode.extensions.getExtension('vscode.git');
  if (!extension) {
    return undefined;
  }
  const exports = extension.exports;
  if (!exports || typeof exports.getAPI !== 'function') {
    return undefined;
  }
  return exports.getAPI(1);
}

export function getActiveRepository(gitApi: GitApi): Repository | undefined {
  if (!gitApi.repositories || gitApi.repositories.length === 0) {
    return undefined;
  }

  // 1. Check UI selected repository
  const selectedRepo = gitApi.repositories.find((r) => r.ui.selected);
  if (selectedRepo) {
    return selectedRepo;
  }

  // 2. Check active text editor document URI against repository root
  const activeUri = vscode.window.activeTextEditor?.document.uri;
  if (activeUri) {
    const matchingRepo = gitApi.repositories.find((r) =>
      activeUri.fsPath.startsWith(r.rootUri.fsPath)
    );
    if (matchingRepo) {
      return matchingRepo;
    }
  }

  // 3. Fallback to first repository
  return gitApi.repositories[0];
}

export async function getDiffFromRepository(
  repo: Repository
): Promise<{ diff: string; isStaged: boolean } | undefined> {
  // Try staged diff first (cached = true)
  const stagedDiff = await repo.diff(true);
  if (stagedDiff && stagedDiff.trim().length > 0) {
    return { diff: stagedDiff, isStaged: true };
  }

  // Fallback to working tree diff (cached = false)
  const workingDiff = await repo.diff(false);
  if (!workingDiff || workingDiff.trim().length === 0) {
    vscode.window.showInformationMessage(
      'AnyCommit: No changes detected (neither staged nor working tree).'
    );
    return undefined;
  }

  const choice = await vscode.window.showWarningMessage(
    'AnyCommit: No staged changes found. Generate commit message from working tree changes?',
    { modal: true },
    'Generate',
    'Cancel'
  );

  if (choice === 'Generate') {
    return { diff: workingDiff, isStaged: false };
  }

  return undefined;
}

export function setCommitMessage(repo: Repository, message: string): void {
  repo.inputBox.value = message;
}

export async function getRecentCommitMessages(
  repo: Repository,
  count: number = 5
): Promise<string[]> {
  if (!repo.log || typeof repo.log !== 'function') {
    return [];
  }
  try {
    const commits = await repo.log({ maxEntries: count });
    if (!Array.isArray(commits)) {
      return [];
    }
    return commits
      .map((c) => {
        const firstLine = c?.message?.split(/\r?\n/)[0]?.trim();
        return firstLine || '';
      })
      .filter((msg) => msg.length > 0);
  } catch {
    return [];
  }
}
