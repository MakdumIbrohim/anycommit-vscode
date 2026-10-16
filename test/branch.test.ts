import { describe, it, expect } from 'vitest';
import { extractTicket } from '../src/core/branch';

describe('extractTicket', () => {
  it('extracts JIRA/Linear style tickets from branch name', () => {
    expect(extractTicket('feature/PROJ-1234-login-page')).toBe('PROJ-1234');
    expect(extractTicket('bugfix/CORE-42')).toBe('CORE-42');
    expect(extractTicket('feat/anycommit-890-test')).toBe('ANYCOMMIT-890');
  });

  it('normalizes lowercase tickets to uppercase', () => {
    expect(extractTicket('feature/jira-456-oauth')).toBe('JIRA-456');
  });

  it('supports custom regex pattern', () => {
    const customPattern = '(?:issue|gh)-[0-9]+';
    expect(extractTicket('fix/issue-99-crash', customPattern)).toBe('ISSUE-99');
    expect(extractTicket('feat/gh-123-dark-mode', customPattern)).toBe('GH-123');
  });

  it('returns undefined when no ticket exists in branch name', () => {
    expect(extractTicket('main')).toBeUndefined();
    expect(extractTicket('master')).toBeUndefined();
    expect(extractTicket('dev/staging')).toBeUndefined();
    expect(extractTicket('fix-typo-readme')).toBeUndefined();
  });

  it('handles empty, undefined, or invalid inputs safely', () => {
    expect(extractTicket('')).toBeUndefined();
    expect(extractTicket(undefined)).toBeUndefined();
    // Invalid regex syntax falls back to default
    expect(extractTicket('feature/ABC-123', '[invalid(regex')).toBe('ABC-123');
  });
});
