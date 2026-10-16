export type CommitStyle = 'conventional' | 'gitmoji' | 'plain';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface BuildPromptOptions {
  diff: string;
  style?: CommitStyle;
  language?: string;
  includeBody?: boolean;
  extraInstructions?: string;
  recentCommits?: string[];
  ticket?: string;
}

export function buildMessages(options: BuildPromptOptions): ChatMessage[] {
  const style = options.style ?? 'conventional';
  const language = options.language?.trim() || 'English';
  const includeBody = Boolean(options.includeBody);

  const systemInstructions: string[] = [
    'You are an expert developer assistant specialized in generating concise, clear git commit messages from git diffs.',
    `Respond in ${language}.`,
    'Output ONLY the commit message text. Do not wrap in markdown code blocks (no ```). Do not include any prefix like "Commit message:" or conversational greetings.'
  ];

  if (style === 'conventional') {
    systemInstructions.push(
      'Follow Conventional Commits format: <type>(<optional scope>): <description>. Common types: feat, fix, docs, style, refactor, perf, test, chore. Use lowercase for description and no trailing period.'
    );
  } else if (style === 'gitmoji') {
    systemInstructions.push(
      'Follow Gitmoji convention: <gitmoji> <imperative summary> (e.g. :sparkles: add authentication). Keep it concise with no trailing period.'
    );
  } else if (style === 'plain') {
    systemInstructions.push(
      'Use a plain imperative sentence without any type prefix (e.g., "Add login endpoint", "Fix race condition in cache"). Keep subject under 72 characters.'
    );
  }

  if (includeBody) {
    systemInstructions.push(
      'Include a short subject line (under 72 chars), followed by an empty line, then bullet points explaining key changes.'
    );
  } else {
    systemInstructions.push(
      'Output a single line only (subject line, under 72 characters). Do not include any body or extra lines.'
    );
  }

  if (options.ticket && options.ticket.trim()) {
    const trimmedTicket = options.ticket.trim();
    if (style === 'conventional') {
      systemInstructions.push(
        `Include the issue/ticket ID "${trimmedTicket}" as the scope or prefix in the subject (e.g. "<type>(${trimmedTicket}): <description>").`
      );
    } else {
      systemInstructions.push(
        `Include the issue/ticket ID "${trimmedTicket}" in the subject line (e.g. "[${trimmedTicket}] <description>").`
      );
    }
  }

  if (options.extraInstructions && options.extraInstructions.trim()) {
    systemInstructions.push(`Additional user instructions: ${options.extraInstructions.trim()}`);
  }

  if (options.recentCommits && options.recentCommits.length > 0) {
    const formattedCommits = options.recentCommits
      .map((c) => `- ${c.trim()}`)
      .filter((c) => c !== '-')
      .join('\n');
    if (formattedCommits) {
      systemInstructions.push(`Recent commits in this repository for style and tone reference:\n${formattedCommits}`);
    }
  }

  return [
    {
      role: 'system',
      content: systemInstructions.join('\n\n')
    },
    {
      role: 'user',
      content: `Git diff of staged changes:\n\n${options.diff}`
    }
  ];
}
