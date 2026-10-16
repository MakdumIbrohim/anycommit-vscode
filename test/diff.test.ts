import { describe, it, expect } from 'vitest';
import { filterAndTruncateDiff } from '../src/core/diff';

describe('diff filtering and truncation', () => {
  it('returns empty string for empty input', () => {
    expect(filterAndTruncateDiff('')).toBe('');
    expect(filterAndTruncateDiff('   ')).toBe('');
  });

  it('filters sensitive files and keeps summary', () => {
    const rawDiff = `diff --git a/.env b/.env
new file mode 100644
--- /dev/null
+++ b/.env
@@ -0,0 +1,2 @@
+SECRET_KEY=supersecret
+DATABASE_URL=postgres://...
diff --git a/src/index.ts b/src/index.ts
--- a/src/index.ts
+++ b/src/index.ts
@@ -1 +1,2 @@
+// hello
 console.log("world");`;

    const filtered = filterAndTruncateDiff(rawDiff, 20000);
    expect(filtered).toContain('Summary:');
    expect(filtered).toContain('- .env (new file, skipped: sensitive)');
    expect(filtered).toContain('- src/index.ts (modified)');
    expect(filtered).not.toContain('SECRET_KEY=supersecret');
    expect(filtered).toContain('console.log("world");');
  });

  it('filters lockfiles', () => {
    const rawDiff = `diff --git a/package-lock.json b/package-lock.json
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,3 +1,3 @@
- "version": "1.0.0"
+ "version": "1.0.1"
diff --git a/src/app.ts b/src/app.ts
--- a/src/app.ts
+++ b/src/app.ts
@@ -1 +1 @@
-const a = 1;
+const a = 2;`;

    const filtered = filterAndTruncateDiff(rawDiff, 20000);
    expect(filtered).toContain('- package-lock.json (modified, skipped: lockfile)');
    expect(filtered).not.toContain('"version": "1.0.1"');
    expect(filtered).toContain('const a = 2;');
  });

  it('filters binary files and binary diff syntax', () => {
    const rawDiff = `diff --git a/logo.png b/logo.png
new file mode 100644
Binary files /dev/null and b/logo.png differ
diff --git a/src/main.ts b/src/main.ts
--- a/src/main.ts
+++ b/src/main.ts
@@ -1 +1 @@
-old();
+new();`;

    const filtered = filterAndTruncateDiff(rawDiff, 20000);
    expect(filtered).toContain('- logo.png (new file, skipped: binary)');
    expect(filtered).not.toContain('Binary files /dev/null');
    expect(filtered).toContain('new();');
  });

  it('truncates diff when exceeding maxChars', () => {
    const hunkLines = Array.from({ length: 100 }, (_, i) => `+line ${i}`).join('\n');
    const rawDiff = `diff --git a/big.txt b/big.txt
--- a/big.txt
+++ b/big.txt
@@ -0,0 +1,100 @@
${hunkLines}`;

    const maxChars = 200;
    const truncated = filterAndTruncateDiff(rawDiff, maxChars);
    expect(truncated.length).toBeLessThanOrEqual(maxChars);
    expect(truncated).toContain('[Diff truncated: exceeded maximum length of 200 characters]');
  });
});
