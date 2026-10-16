const COMMON_WRAPPER_DIRS = new Set([
  'src',
  'lib',
  'packages',
  'source',
  'app',
  'test',
  'tests',
  '__tests__'
]);

const ROOT_DOCS_FILES = new Set(['readme.md', 'changelog.md', 'contributing.md', 'license']);

export function extractFilePathsFromDiff(diff: string): string[] {
  if (!diff || !diff.trim()) {
    return [];
  }

  const paths: string[] = [];
  const lines = diff.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^diff --git a\/(.*?) b\/(.*?)(?:\s|$)/);
    if (match) {
      const file = match[2] !== '/dev/null' ? match[2] : match[1];
      if (file && !paths.includes(file)) {
        paths.push(file);
      }
    }
  }

  return paths;
}

function getCandidateScope(filePath: string): string | undefined {
  const normalized = filePath.replace(/\\/g, '/').trim();
  if (!normalized) {
    return undefined;
  }

  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 0) {
    return undefined;
  }

  // 1. Single file in root
  if (segments.length === 1) {
    const base = segments[0].toLowerCase();
    if (base.startsWith('package') || base.includes('lock')) {
      return 'deps';
    }
    if (ROOT_DOCS_FILES.has(base) || base.endsWith('.md')) {
      return 'docs';
    }
    const dotIndex = base.lastIndexOf('.');
    return dotIndex !== -1 ? base.slice(0, dotIndex) : base;
  }

  // 2. Strip leading wrapper directory (e.g. src/, packages/, lib/, test/)
  let startIndex = 0;
  while (
    startIndex < segments.length - 1 &&
    COMMON_WRAPPER_DIRS.has(segments[startIndex].toLowerCase())
  ) {
    startIndex++;
  }

  // If after stripping we are at a subdirectory
  const remaining = segments.slice(startIndex);
  if (remaining.length > 1) {
    // E.g. [auth, login.ts] -> auth
    // E.g. [commands, generate.ts] -> commands
    return remaining[0].toLowerCase();
  }

  // Only single file left under wrapper (e.g. src/git.ts -> git)
  const filename = remaining[0].toLowerCase();
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;
}

export function detectScopeFromFiles(filePaths: string[]): string | undefined {
  if (!filePaths || filePaths.length === 0) {
    return undefined;
  }

  // Filter out pure docs/ignore files if other substantive code files exist
  const substantive = filePaths.filter((p) => {
    const lower = p.toLowerCase();
    return !ROOT_DOCS_FILES.has(lower) && !lower.endsWith('.md') && !lower.endsWith('.gitignore');
  });

  const targetList = substantive.length > 0 ? substantive : filePaths;
  const scopes = new Set<string>();

  for (const file of targetList) {
    const candidate = getCandidateScope(file);
    if (candidate) {
      scopes.add(candidate);
    }
  }

  // If exactly one unified scope was detected across all changed files
  if (scopes.size === 1) {
    const [singleScope] = Array.from(scopes);
    return singleScope;
  }

  // Multiple divergent scopes -> leave it to LLM
  return undefined;
}
