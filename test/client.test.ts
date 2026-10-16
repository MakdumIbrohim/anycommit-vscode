import { describe, it, expect, vi } from 'vitest';
import { chatComplete, chatCompleteStream, listModels, LlmClientError } from '../src/core/client';

describe('LLM client', () => {
  const baseUrl = 'http://localhost:20128/v1';

  describe('chatComplete', () => {
    it('sends correct payload and parses response successfully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'feat: add login feature' } }]
        })
      });

      const result = await chatComplete(
        {
          baseUrl,
          apiKey: 'test-key',
          model: 'premium-coding',
          messages: [{ role: 'user', content: 'test diff' }],
          temperature: 0.3,
          maxTokens: 300,
          retryDelayMs: 0
        },
        mockFetch as any
      );

      expect(result).toBe('feat: add login feature');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:20128/v1/chat/completions');
      expect(init.headers['Authorization']).toBe('Bearer test-key');
      expect(JSON.parse(init.body)).toEqual({
        model: 'premium-coding',
        messages: [{ role: 'user', content: 'test diff' }],
        temperature: 0.3,
        max_tokens: 300
      });
    });

    it('omits Authorization header when apiKey is empty', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'fix: typo' } }]
        })
      });

      await chatComplete(
        {
          baseUrl,
          apiKey: '   ',
          model: 'auto/best-coding',
          messages: [],
          retryDelayMs: 0
        },
        mockFetch as any
      );

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers['Authorization']).toBeUndefined();
    });

    it('maps 401 status to API key invalid message', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } })
      });

      await expect(
        chatComplete(
          { baseUrl, model: 'm1', messages: [], retryDelayMs: 0 },
          mockFetch as any
        )
      ).rejects.toThrow('API key missing or invalid.');
    });

    it('maps 404 status to Model/endpoint not found message', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'Not found' } })
      });

      await expect(
        chatComplete(
          { baseUrl, model: 'm1', messages: [], retryDelayMs: 0 },
          mockFetch as any
        )
      ).rejects.toThrow('Model or endpoint not found (check base URL and model).');
    });

    it('retries once on transient server errors (e.g. 503) and succeeds', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ error: { message: 'Service unavailable' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'chore: retry success' } }]
          })
        });

      const result = await chatComplete(
        { baseUrl, model: 'm1', messages: [], retryDelayMs: 0 },
        mockFetch as any
      );

      expect(result).toBe('chore: retry success');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('retries once on connection failure and throws gateway connection message if still failing', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new TypeError('fetch failed'));

      await expect(
        chatComplete(
          { baseUrl, model: 'm1', messages: [], retryDelayMs: 0 },
          mockFetch as any
        )
      ).rejects.toThrow(
        'Cannot reach http://localhost:20128/v1. Is your gateway (9router/OmniRoute) running?'
      );

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('handles cancellation via user AbortSignal without retrying', async () => {
      const controller = new AbortController();
      controller.abort();

      const mockFetch = vi.fn();

      await expect(
        chatComplete(
          {
            baseUrl,
            model: 'm1',
            messages: [],
            signal: controller.signal,
            retryDelayMs: 0
          },
          mockFetch as any
        )
      ).rejects.toThrow('Request was cancelled.');

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('chatCompleteStream', () => {
    it('streams tokens through onToken callback and returns full text', async () => {
      const ssePayload = [
        'data: {"choices":[{"delta":{"content":"feat: "}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"support streaming"}}]}\n\n',
        'data: [DONE]\n\n'
      ].join('');

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => ssePayload
      });

      const tokens: string[] = [];
      const result = await chatCompleteStream(
        {
          baseUrl,
          model: 'm1',
          messages: [],
          onToken: (t) => tokens.push(t),
          retryDelayMs: 0
        },
        mockFetch as any
      );

      expect(tokens).toEqual(['feat: ', 'support streaming']);
      expect(result).toBe('feat: support streaming');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, init] = mockFetch.mock.calls[0];
      expect(JSON.parse(init.body).stream).toBe(true);
    });

    it('propagates 401 and 404 errors during stream initiation', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } })
      });

      await expect(
        chatCompleteStream(
          {
            baseUrl,
            model: 'm1',
            messages: [],
            onToken: () => {},
            retryDelayMs: 0
          },
          mockFetch as any
        )
      ).rejects.toThrow('API key missing or invalid.');
    });
  });

  describe('listModels', () => {
    it('returns array of model IDs from OpenAI format', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { id: 'premium-coding' },
            { id: 'auto/best-coding' },
            { id: 'openai/gpt-4o' }
          ]
        })
      });

      const models = await listModels(
        { baseUrl, apiKey: 'test-key', retryDelayMs: 0 },
        mockFetch as any
      );

      expect(models).toEqual(['premium-coding', 'auto/best-coding', 'openai/gpt-4o']);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:20128/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({ Authorization: 'Bearer test-key' })
        })
      );
    });

    it('throws when model response format is invalid', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ models: [] })
      });

      await expect(
        listModels({ baseUrl, retryDelayMs: 0 }, mockFetch as any)
      ).rejects.toThrow('Invalid response format: expected data array in models response');
    });
  });
});
