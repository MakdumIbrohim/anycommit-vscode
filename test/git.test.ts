import { describe, it, expect, vi } from 'vitest';

vi.mock('vscode', () => ({
  window: {
    showInformationMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    activeTextEditor: undefined
  },
  extensions: {
    getExtension: vi.fn()
  }
}));

import { getRecentCommitMessages, Repository } from '../src/git';

describe('git helper', () => {
  it('extracts first lines of recent commits', async () => {
    const mockRepo: Partial<Repository> = {
      log: vi.fn().mockResolvedValue([
        { message: 'feat: first commit\n\nDetailed body' },
        { message: 'fix(core): second commit' },
        { message: 'chore: update deps\n- bullet point' }
      ])
    };

    const commits = await getRecentCommitMessages(mockRepo as Repository, 5);
    expect(commits).toEqual([
      'feat: first commit',
      'fix(core): second commit',
      'chore: update deps'
    ]);
  });

  it('handles repositories without log method safely', async () => {
    const mockRepo: Partial<Repository> = {};
    const commits = await getRecentCommitMessages(mockRepo as Repository, 5);
    expect(commits).toEqual([]);
  });

  it('handles log throwing error gracefully', async () => {
    const mockRepo: Partial<Repository> = {
      log: vi.fn().mockRejectedValue(new Error('Git log error: no commits yet'))
    };
    const commits = await getRecentCommitMessages(mockRepo as Repository, 5);
    expect(commits).toEqual([]);
  });
});
