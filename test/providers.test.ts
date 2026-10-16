import { describe, it, expect } from 'vitest';
import { resolveBaseUrl, PROVIDER_PRESETS } from '../src/core/providers';

describe('providers', () => {
  it('returns default baseUrl for 9router and omniroute', () => {
    expect(resolveBaseUrl('9router')).toBe('http://localhost:20128/v1');
    expect(resolveBaseUrl('omniroute')).toBe('http://localhost:20128/v1');
  });

  it('returns default baseUrl for cloud providers', () => {
    expect(resolveBaseUrl('openai')).toBe('https://api.openai.com/v1');
    expect(resolveBaseUrl('openrouter')).toBe('https://openrouter.ai/api/v1');
    expect(resolveBaseUrl('groq')).toBe('https://api.groq.com/openai/v1');
    expect(resolveBaseUrl('deepseek')).toBe('https://api.deepseek.com/v1');
  });

  it('resolves baseUrl from customProviders list', () => {
    const customList = [
      { id: 'ollama', name: 'Ollama Local', baseUrl: 'http://localhost:11434/v1' },
      { id: 'lmstudio', name: 'LM Studio', baseUrl: 'http://127.0.0.1:1234/v1' }
    ];
    expect(resolveBaseUrl('ollama', undefined, customList)).toBe('http://localhost:11434/v1');
    expect(resolveBaseUrl('LMSTUDIO', undefined, customList)).toBe('http://127.0.0.1:1234/v1');
  });

  it('prefers override when provided', () => {
    expect(resolveBaseUrl('9router', 'http://127.0.0.1:3000/v1')).toBe('http://127.0.0.1:3000/v1');
    expect(resolveBaseUrl('custom', 'https://my-gateway.internal/v1')).toBe(
      'https://my-gateway.internal/v1'
    );
  });

  it('returns empty string for custom provider without override', () => {
    expect(resolveBaseUrl('custom')).toBe('');
    expect(resolveBaseUrl('custom', '  ')).toBe('');
  });

  it('returns empty string for unknown provider without override', () => {
    expect(resolveBaseUrl('unknown_provider')).toBe('');
  });
});
