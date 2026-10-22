import { describe, it, expect, vi } from 'vitest';
import {
  isFreeTierModel,
  extractFreeTierModels,
  probeGateway,
  scanFreeTierGateways,
  resolveAnyCommitModel,
  GatewayCandidate
} from '../src/core/gateway';

describe('gateway core logic', () => {
  it('resolves virtual anycommit models to target models', () => {
    expect(resolveAnyCommitModel('anycommit/auto-free')).toBe(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
    );
    expect(resolveAnyCommitModel('anycommit/llama-3.3-70b')).toBe(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
    );
    expect(resolveAnyCommitModel('anycommit/deepseek-r1')).toBe(
      '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b'
    );
    expect(resolveAnyCommitModel('anycommit/llama-3.2-3b')).toBe('@cf/meta/llama-3.2-3b-instruct');
    expect(resolveAnyCommitModel('gpt-4o')).toBe('gpt-4o');
  });

  it('correctly identifies free tier models by suffix or pricing', () => {
    expect(isFreeTierModel({ id: 'google/gemini-2.0-flash-exp:free' })).toBe(true);
    expect(isFreeTierModel({ id: 'meta-llama/llama-3.3-70b-instruct:free' })).toBe(true);
    expect(isFreeTierModel({ id: 'free/mistral-7b' })).toBe(true);
    expect(
      isFreeTierModel({
        id: 'some/paid-model',
        pricing: { prompt: '0', completion: '0' }
      })
    ).toBe(true);
    expect(
      isFreeTierModel({
        id: 'some/paid-model',
        pricing: { prompt: 0, completion: 0 }
      })
    ).toBe(true);

    expect(isFreeTierModel({ id: 'openai/gpt-4o' })).toBe(false);
    expect(
      isFreeTierModel({
        id: 'openai/gpt-4o',
        pricing: { prompt: '0.005', completion: '0.015' }
      })
    ).toBe(false);
    expect(isFreeTierModel(null)).toBe(false);
    expect(isFreeTierModel({})).toBe(false);
  });

  it('extracts only free models from candidate list', () => {
    const list = [
      { id: 'openai/gpt-4o', pricing: { prompt: '5.0', completion: '15.0' } },
      { id: 'google/gemini-flash:free' },
      { id: 'deepseek/r1:free' },
      { id: 'anthropic/claude-3-5-sonnet' }
    ];
    const free = extractFreeTierModels(list);
    expect(free).toEqual(['google/gemini-flash:free', 'deepseek/r1:free']);
  });

  it('probes gateway candidate successfully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { id: 'free-model-1:free' },
          { id: 'paid-model' }
        ]
      })
    } as any);

    const candidate: GatewayCandidate = {
      provider: 'test-gateway',
      baseUrl: 'http://test.internal/v1',
      isLocal: false,
      timeoutMs: 1000
    };

    const res = await probeGateway(candidate, mockFetch as any);
    expect(res).not.toBeNull();
    expect(res?.provider).toBe('test-gateway');
    expect(res?.models).toEqual(['free-model-1:free']);
  });

  it('probes local gateway and marks all returned models as zero-cost', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { id: 'llama3:latest' },
          { id: 'qwen2.5:coder' }
        ]
      })
    } as any);

    const candidate: GatewayCandidate = {
      provider: 'ollama',
      baseUrl: 'http://localhost:11434/v1',
      isLocal: true,
      timeoutMs: 1000
    };

    const res = await probeGateway(candidate, mockFetch as any);
    expect(res).not.toBeNull();
    expect(res?.isLocal).toBe(true);
    expect(res?.models).toEqual(['llama3:latest', 'qwen2.5:coder']);
  });

  it('handles probe failure or timeout gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const candidate: GatewayCandidate = {
      provider: 'down-gateway',
      baseUrl: 'http://localhost:9999/v1',
      isLocal: true,
      timeoutMs: 500
    };

    const res = await probeGateway(candidate, mockFetch as any);
    expect(res).toBeNull();
  });

  it('scans multiple gateways prioritizing local gateways first', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('openrouter')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [{ id: 'meta-llama/llama-3:free' }]
          })
        });
      }
      if (url.includes('20128')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [{ id: 'premium-coding' }]
          })
        });
      }
      return Promise.reject(new Error('unreachable'));
    });

    const candidates: GatewayCandidate[] = [
      {
        provider: 'openrouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        isLocal: false,
        timeoutMs: 1000
      },
      {
        provider: '9router',
        baseUrl: 'http://localhost:20128/v1',
        isLocal: true,
        timeoutMs: 1000
      }
    ];

    const results = await scanFreeTierGateways(candidates, mockFetch as any);
    expect(results.length).toBe(2);
    // 9router should be first because isLocal = true
    expect(results[0].provider).toBe('9router');
    expect(results[1].provider).toBe('openrouter');
  });
});
