export interface NormalizeUrlResult {
  url: string;
  warning?: string;
}

const LOCALHOST_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1']);

export function normalizeBaseUrl(input: string): NormalizeUrlResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { url: '' };
  }

  // Remove trailing slashes
  const cleaned = trimmed.replace(/\/+$/, '');

  let warning: string | undefined;
  if (!cleaned.endsWith('/v1')) {
    warning = "Base URL does not end with '/v1'. Most OpenAI-compatible endpoints require a '/v1' path.";
  }

  return { url: cleaned, warning };
}

export function isNonLocalhostHttp(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    return !LOCALHOST_HOSTS.has(hostname);
  } catch {
    // If not a valid URL yet, do not falsely flag
    return false;
  }
}
