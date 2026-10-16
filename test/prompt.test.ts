import { describe, it, expect } from 'vitest';
import { buildMessages } from '../src/core/prompt';

describe('prompt builder', () => {
  const dummyDiff = 'diff --git a/file.ts b/file.ts\n+console.log("hello");';

  it('builds system and user messages with conventional commits by default', () => {
    const messages = buildMessages({ diff: dummyDiff });
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('Conventional Commits');
    expect(messages[0].content).toContain('English');
    expect(messages[0].content).toContain('single line only');
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toContain(dummyDiff);
  });

  it('supports gitmoji style', () => {
    const messages = buildMessages({ diff: dummyDiff, style: 'gitmoji' });
    expect(messages[0].content).toContain('Gitmoji convention');
  });

  it('supports plain style', () => {
    const messages = buildMessages({ diff: dummyDiff, style: 'plain' });
    expect(messages[0].content).toContain('plain imperative sentence');
  });

  it('customizes language and includeBody', () => {
    const messages = buildMessages({
      diff: dummyDiff,
      language: 'Indonesian',
      includeBody: true
    });
    expect(messages[0].content).toContain('Respond in Indonesian.');
    expect(messages[0].content).toContain('bullet points explaining key changes');
  });

  it('includes extra instructions and recent commits', () => {
    const messages = buildMessages({
      diff: dummyDiff,
      extraInstructions: 'mention JIRA-123 in commit subject',
      recentCommits: ['feat: initial commit', 'fix: resolve bug']
    });
    expect(messages[0].content).toContain('mention JIRA-123 in commit subject');
    expect(messages[0].content).toContain('- feat: initial commit');
    expect(messages[0].content).toContain('- fix: resolve bug');
  });

  it('includes ticket in instructions when provided', () => {
    const conventionalMessages = buildMessages({
      diff: dummyDiff,
      style: 'conventional',
      ticket: 'PROJ-123'
    });
    expect(conventionalMessages[0].content).toContain('PROJ-123');
    expect(conventionalMessages[0].content).toContain('<type>(PROJ-123): <description>');

    const plainMessages = buildMessages({
      diff: dummyDiff,
      style: 'plain',
      ticket: 'PROJ-123'
    });
    expect(plainMessages[0].content).toContain('[PROJ-123]');
  });
});
