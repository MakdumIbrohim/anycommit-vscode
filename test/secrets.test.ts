import { describe, it, expect, beforeEach } from 'vitest';
import {
  getApiKey,
  setApiKey,
  clearApiKey,
  resolveApiKey,
  formatSecretKey,
  SecretStorageLike
} from '../src/secrets';

class MockSecretStorage implements SecretStorageLike {
  private storage = new Map<string, string>();

  async get(key: string): Promise<string | undefined> {
    return this.storage.get(key);
  }

  async store(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

describe('secrets storage', () => {
  let mockStorage: MockSecretStorage;

  beforeEach(() => {
    mockStorage = new MockSecretStorage();
  });

  it('formats secret storage key per provider', () => {
    expect(formatSecretKey('9router')).toBe('anycommit.apiKey.9router');
    expect(formatSecretKey('OpenAI')).toBe('anycommit.apiKey.openai');
  });

  it('stores and retrieves api key for provider', async () => {
    await setApiKey(mockStorage, 'openai', 'sk-test-key-123');
    const key = await getApiKey(mockStorage, 'openai');
    expect(key).toBe('sk-test-key-123');
  });

  it('clears api key when set with empty string', async () => {
    await setApiKey(mockStorage, 'openai', 'sk-test-key-123');
    await setApiKey(mockStorage, 'openai', '   ');
    const key = await getApiKey(mockStorage, 'openai');
    expect(key).toBeUndefined();
  });

  it('clears api key using clearApiKey', async () => {
    await setApiKey(mockStorage, 'groq', 'gsk-12345');
    await clearApiKey(mockStorage, 'groq');
    const key = await getApiKey(mockStorage, 'groq');
    expect(key).toBeUndefined();
  });

  it('isolates keys across different providers', async () => {
    await setApiKey(mockStorage, 'openai', 'key-openai');
    await setApiKey(mockStorage, 'groq', 'key-groq');
    expect(await getApiKey(mockStorage, 'openai')).toBe('key-openai');
    expect(await getApiKey(mockStorage, 'groq')).toBe('key-groq');
    expect(await getApiKey(mockStorage, '9router')).toBeUndefined();
  });

  describe('resolveApiKey', () => {
    it('prioritizes settingsApiKey if provided', async () => {
      await setApiKey(mockStorage, 'openai', 'secret-storage-key');
      const resolved = await resolveApiKey(mockStorage, 'openai', 'settings-key');
      expect(resolved).toBe('settings-key');
    });

    it('falls back to SecretStorage if settingsApiKey is empty', async () => {
      await setApiKey(mockStorage, 'openai', 'secret-storage-key');
      const resolved = await resolveApiKey(mockStorage, 'openai', '  ');
      expect(resolved).toBe('secret-storage-key');

      const resolvedUndefined = await resolveApiKey(mockStorage, 'openai', undefined);
      expect(resolvedUndefined).toBe('secret-storage-key');
    });
  });
});
