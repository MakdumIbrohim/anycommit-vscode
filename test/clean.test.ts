import { describe, it, expect } from 'vitest';
import { cleanModelOutput } from '../src/core/clean';

describe('cleanModelOutput', () => {
  it('returns empty string for empty input', () => {
    expect(cleanModelOutput('')).toBe('');
    expect(cleanModelOutput('   ')).toBe('');
  });

  it('keeps clean message as is', () => {
    expect(cleanModelOutput('feat(auth): add login endpoint')).toBe('feat(auth): add login endpoint');
  });

  it('removes code fence blocks', () => {
    const fenced = '```git\nfeat(core): update parser\n```';
    expect(cleanModelOutput(fenced)).toBe('feat(core): update parser');

    const simpleFenced = '```\nfix: handle null exception\n```';
    expect(cleanModelOutput(simpleFenced)).toBe('fix: handle null exception');
  });

  it('removes common prefixes', () => {
    expect(cleanModelOutput('Commit message: feat: add new feature')).toBe('feat: add new feature');
    expect(cleanModelOutput('Commit: fix(api): resolve 500 error')).toBe('fix(api): resolve 500 error');
    expect(cleanModelOutput('Subject: chore: update deps')).toBe('chore: update deps');
    expect(cleanModelOutput('Generated commit message: feat: support sse')).toBe('feat: support sse');
  });

  it('removes wrapping quotes', () => {
    expect(cleanModelOutput('"feat: quoted subject"')).toBe('feat: quoted subject');
    expect(cleanModelOutput("'fix: single quoted subject'")).toBe('fix: single quoted subject');
    expect(cleanModelOutput('`chore: backtick subject`')).toBe('chore: backtick subject');
  });

  it('preserves multi-line commit message with body', () => {
    const multiLine = 'feat: add user profile\n\n- Add profile avatar component\n- Hook up api endpoint';
    expect(cleanModelOutput(multiLine)).toBe(multiLine);
  });

  it('strips reasoning/thinking tags from thinking models', () => {
    const thought = '<think>\nAnalyzing changes in src/core/clean.ts...\nThe user added think tag removal.\n</think>\nfeat(core): strip thinking tags';
    expect(cleanModelOutput(thought)).toBe('feat(core): strip thinking tags');

    const unclosedThought = '<think>\nIncomplete reasoning stream...';
    expect(cleanModelOutput(unclosedThought)).toBe('');
  });
});
