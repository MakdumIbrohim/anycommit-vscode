export const ANYCOMMIT_VIRTUAL_MODELS: Record<string, string> = {
  'anycommit/auto-free': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  'anycommit/llama-3.3-70b': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  'anycommit/deepseek-r1': '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
  'anycommit/llama-3.2-3b': '@cf/meta/llama-3.2-3b-instruct'
};

export function resolveAnyCommitModel(modelName: string): string {
  const trimmed = (modelName || '').trim();
  if (ANYCOMMIT_VIRTUAL_MODELS[trimmed]) {
    return ANYCOMMIT_VIRTUAL_MODELS[trimmed];
  }
  if (trimmed.startsWith('anycommit/')) {
    const raw = trimmed.replace(/^anycommit\//, '');
    return ANYCOMMIT_VIRTUAL_MODELS[raw] || raw;
  }
  return trimmed;
}

export interface FreeTierModelInfo {
  id: string;
  provider: string;
  isFree: boolean;
}

export interface DiscoveredGateway {
  provider: string;
  baseUrl: string;
  models: string[];
  latencyMs: number;
  isLocal: boolean;
}

export function isFreeTierModel(model: any): boolean {
  if (!model || typeof model !== 'object') {
    return false;
  }

  const id = typeof model.id === 'string' ? model.id.toLowerCase() : '';
  if (id.endsWith(':free') || id.includes('/free/') || id.startsWith('free/')) {
    return true;
  }

  const pricing = model.pricing;
  if (pricing && typeof pricing === 'object') {
    const promptFree =
      pricing.prompt === 0 ||
      pricing.prompt === '0' ||
      pricing.prompt === '0.0' ||
      pricing.prompt === '0.00';
    const completionFree =
      pricing.completion === 0 ||
      pricing.completion === '0' ||
      pricing.completion === '0.0' ||
      pricing.completion === '0.00';

    if (promptFree && completionFree) {
      return true;
    }
  }

  return false;
}

export function extractFreeTierModels(models: any[]): string[] {
  if (!Array.isArray(models)) {
    return [];
  }
  return models
    .filter(isFreeTierModel)
    .map((m) => m.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

export interface GatewayCandidate {
  provider: string;
  baseUrl: string;
  isLocal: boolean;
  timeoutMs: number;
}

export const DEFAULT_GATEWAY_CANDIDATES: GatewayCandidate[] = [
  {
    provider: '9router',
    baseUrl: 'http://localhost:20128/v1',
    isLocal: true,
    timeoutMs: 1500
  },
  {
    provider: 'ollama',
    baseUrl: 'http://localhost:11434/v1',
    isLocal: true,
    timeoutMs: 1500
  },
  {
    provider: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    isLocal: false,
    timeoutMs: 4000
  }
];

export async function probeGateway(
  candidate: GatewayCandidate,
  fetchFn: typeof fetch = fetch
): Promise<DiscoveredGateway | null> {
  const start = Date.now();
  const endpoint = `${candidate.baseUrl.replace(/\/+$/, '')}/models`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), candidate.timeoutMs);

  try {
    const res = await fetchFn(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as any;
    const rawList: any[] = Array.isArray(data?.data) ? data.data : [];

    let freeModels: string[] = [];
    if (candidate.isLocal) {
      // Local gateways (e.g. 9router/Ollama) are zero-cost by default
      freeModels = rawList
        .map((m) => (typeof m === 'string' ? m : m?.id))
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
    } else {
      freeModels = extractFreeTierModels(rawList);
    }

    if (freeModels.length === 0) {
      return null;
    }

    return {
      provider: candidate.provider,
      baseUrl: candidate.baseUrl,
      models: freeModels,
      latencyMs: Date.now() - start,
      isLocal: candidate.isLocal
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function scanFreeTierGateways(
  candidates: GatewayCandidate[] = DEFAULT_GATEWAY_CANDIDATES,
  fetchFn: typeof fetch = fetch
): Promise<DiscoveredGateway[]> {
  const probes = candidates.map((c) => probeGateway(c, fetchFn));
  const settled = await Promise.all(probes);

  const discovered: DiscoveredGateway[] = settled.filter(
    (g): g is DiscoveredGateway => g !== null && g.models.length > 0
  );

  return discovered.sort((a, b) => {
    // Prioritize local gateways first
    if (a.isLocal && !b.isLocal) return -1;
    if (!a.isLocal && b.isLocal) return 1;
    // Then sort by response latency
    return a.latencyMs - b.latencyMs;
  });
}
