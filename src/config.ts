import * as vscode from 'vscode';
import { CommitStyle } from './core/prompt';
import { ProviderId, resolveBaseUrl } from './core/providers';

export interface AnyCommitConfig {
  provider: ProviderId;
  baseUrl: string;
  resolvedBaseUrl: string;
  apiKey?: string;
  model: string;
  language: string;
  style: CommitStyle;
  includeBody: boolean;
  useRecentCommits: boolean;
  autoDetectScope: boolean;
  extractTicketFromBranch: boolean;
  ticketPattern: string;
  extraInstructions: string;
  maxDiffChars: number;
  temperature: number;
  maxTokens: number;
  timeoutSeconds: number;
}

export function getAnyCommitConfig(): AnyCommitConfig {
  const cfg = vscode.workspace.getConfiguration('aiCommit');
  const provider = (cfg.get<string>('provider') || '9router') as ProviderId;
  const baseUrl = cfg.get<string>('baseUrl') || '';
  const resolvedBaseUrl = resolveBaseUrl(provider, baseUrl);

  return {
    provider,
    baseUrl,
    resolvedBaseUrl,
    apiKey: cfg.get<string>('apiKey')?.trim() || undefined,
    model: cfg.get<string>('model')?.trim() || '',
    language: cfg.get<string>('language') || 'English',
    style: (cfg.get<string>('style') as CommitStyle) || 'conventional',
    includeBody: cfg.get<boolean>('includeBody') ?? false,
    useRecentCommits: cfg.get<boolean>('useRecentCommits') ?? true,
    autoDetectScope: cfg.get<boolean>('autoDetectScope') ?? true,
    extractTicketFromBranch: cfg.get<boolean>('extractTicketFromBranch') ?? false,
    ticketPattern: cfg.get<string>('ticketPattern') || '[A-Z]+-[0-9]+',
    extraInstructions: cfg.get<string>('extraInstructions') || '',
    maxDiffChars: cfg.get<number>('maxDiffChars') ?? 20000,
    temperature: cfg.get<number>('temperature') ?? 0.2,
    maxTokens: cfg.get<number>('maxTokens') ?? 1000,
    timeoutSeconds: cfg.get<number>('timeoutSeconds') ?? 60
  };
}

export async function updateAnyCommitConfig<T>(
  key: string,
  value: T,
  target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
): Promise<void> {
  const cfg = vscode.workspace.getConfiguration('aiCommit');
  await cfg.update(key, value, target);
}
