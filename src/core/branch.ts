const DEFAULT_TICKET_PATTERN = '[a-zA-Z]+-[0-9]+';

export function extractTicket(
  branchName?: string,
  pattern?: string
): string | undefined {
  if (!branchName || !branchName.trim()) {
    return undefined;
  }

  const rawPattern = pattern?.trim() || DEFAULT_TICKET_PATTERN;
  let regex: RegExp;

  try {
    regex = new RegExp(rawPattern, 'i');
  } catch {
    regex = new RegExp(DEFAULT_TICKET_PATTERN, 'i');
  }

  const match = branchName.match(regex);
  if (!match) {
    return undefined;
  }

  // Normalize match to uppercase if standard letter-dash-number format
  const extracted = match[0].trim();
  return extracted ? extracted.toUpperCase() : undefined;
}
