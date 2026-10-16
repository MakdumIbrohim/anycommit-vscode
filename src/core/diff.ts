const SENSITIVE_EXTENSIONS = new Set(['.pem', '.key', '.pfx', '.p12', '.crt', '.cert', '.kdbx']);

const SENSITIVE_KEYWORDS = [
  'id_rsa',
  'id_ed25519',
  'id_ecdsa',
  'credentials.json',
  'service-account'
];

const LOCKFILES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'Cargo.lock',
  'poetry.lock',
  'Gemfile.lock',
  'composer.lock',
  'go.sum'
]);

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.webp',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.vsix',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.woff',
  '.woff2',
  '.ttf',
  '.wasm'
]);

interface ParsedFileDiff {
  header: string;
  filePath: string;
  status: 'new file' | 'deleted' | 'modified';
  skipReason?: 'sensitive' | 'lockfile' | 'binary';
  body: string;
}

function getBasename(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function getExtension(path: string): string {
  const base = getBasename(path);
  const dotIndex = base.lastIndexOf('.');
  return dotIndex !== -1 ? base.slice(dotIndex).toLowerCase() : '';
}

function isSensitive(filePath: string): boolean {
  const base = getBasename(filePath).toLowerCase();
  const ext = getExtension(filePath);

  if (base.startsWith('.env')) {
    return true;
  }
  if (SENSITIVE_EXTENSIONS.has(ext)) {
    return true;
  }
  return SENSITIVE_KEYWORDS.some((kw) => base.includes(kw));
}

function isLockfile(filePath: string): boolean {
  const base = getBasename(filePath);
  return LOCKFILES.has(base);
}

function isBinary(filePath: string, hunkText: string): boolean {
  if (hunkText.includes('Binary files ') || hunkText.includes('GIT binary patch')) {
    return true;
  }
  const ext = getExtension(filePath);
  return BINARY_EXTENSIONS.has(ext);
}

function parseFileDiffs(rawDiff: string): ParsedFileDiff[] {
  const trimmed = rawDiff.trim();
  if (!trimmed) {
    return [];
  }

  // Split on "diff --git " lines
  const parts = trimmed.split(/(?=^diff --git )/m);
  const result: ParsedFileDiff[] = [];

  for (const part of parts) {
    const chunk = part.trim();
    if (!chunk) {
      continue;
    }

    const headerMatch = chunk.match(/^diff --git a\/(.*?) b\/(.*?)(?:\r?\n|$)/);
    let filePath = 'unknown';
    if (headerMatch) {
      filePath = headerMatch[2] !== '/dev/null' ? headerMatch[2] : headerMatch[1];
    }

    let status: 'new file' | 'deleted' | 'modified' = 'modified';
    if (chunk.includes('\nnew file mode ') || chunk.startsWith('new file mode ')) {
      status = 'new file';
    } else if (chunk.includes('\ndeleted file mode ') || chunk.startsWith('deleted file mode ')) {
      status = 'deleted';
    }

    let skipReason: 'sensitive' | 'lockfile' | 'binary' | undefined;
    if (isSensitive(filePath)) {
      skipReason = 'sensitive';
    } else if (isLockfile(filePath)) {
      skipReason = 'lockfile';
    } else if (isBinary(filePath, chunk)) {
      skipReason = 'binary';
    }

    result.push({
      header: headerMatch ? headerMatch[0].trim() : '',
      filePath,
      status,
      skipReason,
      body: chunk
    });
  }

  return result;
}

export function filterAndTruncateDiff(diff: string, maxChars: number = 20000): string {
  if (!diff || !diff.trim()) {
    return '';
  }

  const fileDiffs = parseFileDiffs(diff);
  if (fileDiffs.length === 0) {
    return diff.slice(0, maxChars);
  }

  const summaryLines: string[] = ['Summary:'];
  const includedHunks: string[] = [];

  for (const file of fileDiffs) {
    if (file.skipReason) {
      summaryLines.push(`- ${file.filePath} (${file.status}, skipped: ${file.skipReason})`);
    } else {
      summaryLines.push(`- ${file.filePath} (${file.status})`);
      includedHunks.push(file.body);
    }
  }

  let combined = `${summaryLines.join('\n')}\n\n${includedHunks.join('\n\n')}`.trim();

  if (maxChars > 0 && combined.length > maxChars) {
    const marker = `\n\n[Diff truncated: exceeded maximum length of ${maxChars} characters]`;
    const cutoff = Math.max(0, maxChars - marker.length);
    combined = combined.slice(0, cutoff) + marker;
  }

  return combined;
}
