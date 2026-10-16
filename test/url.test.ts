import { describe, it, expect } from 'vitest';
import { normalizeBaseUrl, isNonLocalhostHttp } from '../src/core/url';

describe('url', () => {
  describe('normalizeBaseUrl', () => {
    it('removes trailing slashes', () => {
      expect(normalizeBaseUrl('http://localhost:20128/v1/').url).toBe('http://localhost:20128/v1');
      expect(normalizeBaseUrl('http://localhost:20128/v1///').url).toBe('http://localhost:20128/v1');
    });

    it('warns if url does not end with /v1', () => {
      const result = normalizeBaseUrl('http://localhost:20128');
      expect(result.url).toBe('http://localhost:20128');
      expect(result.warning).toBeDefined();
    });

    it('does not warn if url ends with /v1', () => {
      const result = normalizeBaseUrl('https://api.openai.com/v1');
      expect(result.url).toBe('https://api.openai.com/v1');
      expect(result.warning).toBeUndefined();
    });

    it('handles empty input gracefully', () => {
      expect(normalizeBaseUrl('').url).toBe('');
      expect(normalizeBaseUrl('   ').url).toBe('');
    });
  });

  describe('isNonLocalhostHttp', () => {
    it('returns false for localhost and loopback http', () => {
      expect(isNonLocalhostHttp('http://localhost:20128/v1')).toBe(false);
      expect(isNonLocalhostHttp('http://127.0.0.1:20128/v1')).toBe(false);
      expect(isNonLocalhostHttp('http://0.0.0.0:20128/v1')).toBe(false);
      expect(isNonLocalhostHttp('http://[::1]:20128/v1')).toBe(false);
    });

    it('returns false for https urls', () => {
      expect(isNonLocalhostHttp('https://remote-gateway.example.com/v1')).toBe(false);
      expect(isNonLocalhostHttp('https://api.openai.com/v1')).toBe(false);
    });

    it('returns true for remote unencrypted http', () => {
      expect(isNonLocalhostHttp('http://192.168.1.100:20128/v1')).toBe(true);
      expect(isNonLocalhostHttp('http://my-server.com/v1')).toBe(true);
    });

    it('returns false for empty or invalid input', () => {
      expect(isNonLocalhostHttp('')).toBe(false);
      expect(isNonLocalhostHttp('not-a-url')).toBe(false);
    });
  });
});
