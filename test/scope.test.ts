import { describe, it, expect } from 'vitest';
import { detectScopeFromFiles, extractFilePathsFromDiff } from '../src/core/scope';

describe('Smart Scope Detection', () => {
  describe('extractFilePathsFromDiff', () => {
    it('extracts unique file paths from git diff format', () => {
      const diff = `diff --git a/src/auth/login.ts b/src/auth/login.ts
--- a/src/auth/login.ts
+++ b/src/auth/login.ts
@@ -1 +1 @@
diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts`;

      expect(extractFilePathsFromDiff(diff)).toEqual(['src/auth/login.ts', 'src/auth/session.ts']);
    });

    it('returns empty array for empty diff', () => {
      expect(extractFilePathsFromDiff('')).toEqual([]);
      expect(extractFilePathsFromDiff('   ')).toEqual([]);
    });
  });

  describe('detectScopeFromFiles', () => {
    it('detects unified scope from files within the same subfolder', () => {
      const files = ['src/auth/login.ts', 'src/auth/session.ts', 'test/auth/auth.test.ts'];
      expect(detectScopeFromFiles(files)).toBe('auth');
    });

    it('detects file name without extension for single file under src', () => {
      expect(detectScopeFromFiles(['src/git.ts'])).toBe('git');
    });

    it('detects package scope in monorepos', () => {
      const files = ['packages/core/index.ts', 'packages/core/client.ts'];
      expect(detectScopeFromFiles(files)).toBe('core');
    });

    it('detects deps for package.json changes', () => {
      expect(detectScopeFromFiles(['package.json', 'package-lock.json'])).toBe('deps');
    });

    it('detects docs for documentation changes', () => {
      expect(detectScopeFromFiles(['README.md', 'CHANGELOG.md'])).toBe('docs');
    });

    it('ignores incidental README when code files belong to a specific module', () => {
      const files = ['src/commands/generate.ts', 'README.md'];
      expect(detectScopeFromFiles(files)).toBe('commands');
    });

    it('returns undefined when files span across multiple divergent modules', () => {
      const files = ['src/auth/login.ts', 'src/payment/checkout.ts'];
      expect(detectScopeFromFiles(files)).toBeUndefined();
    });

    it('returns undefined for empty input', () => {
      expect(detectScopeFromFiles([])).toBeUndefined();
    });
  });
});
