export function cleanModelOutput(raw: string): string {
  if (!raw) {
    return '';
  }

  let text = raw.trim();

  // Strip code block fences if wrapped in ``` ... ```
  const fenceRegex = /^```(?:[a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)\r?\n```$/;
  const matchFence = text.match(fenceRegex);
  if (matchFence) {
    text = matchFence[1].trim();
  } else {
    // Strip trailing or leading partial fences
    text = text.replace(/^```[a-zA-Z0-9_-]*\r?\n?/, '').replace(/\r?\n?```$/, '').trim();
  }

  // Strip common conversational prefixes like "Commit message:", "Commit:", etc.
  const prefixRegex = /^(?:commit\s*message|commit|generated\s*commit\s*message|subject)\s*:\s*/i;
  text = text.replace(prefixRegex, '').trim();

  // Strip outer quotes if the output is quoted
  if (
    (text.startsWith('"') && text.endsWith('"') && text.length >= 2) ||
    (text.startsWith("'") && text.endsWith("'") && text.length >= 2) ||
    (text.startsWith('`') && text.endsWith('`') && text.length >= 2)
  ) {
    const unquoted = text.slice(1, -1).trim();
    if (unquoted) {
      text = unquoted;
    }
  }

  return text;
}
