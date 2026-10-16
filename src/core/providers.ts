export type ProviderId =
  '9router' | 'omniroute' | 'openai' | 'openrouter' | 'groq' | 'deepseek' | 'custom';

export interface ProviderPreset {
  id: ProviderId;
  name: string;
  defaultBaseUrl: string;
  isLocal: boolean;
  requiresApiKey: boolean;
}

export const PROVIDER_PRESETS: Record<ProviderId, ProviderPreset> = {
  '9router': {
    id: '9router',
    name: '9router',
    defaultBaseUrl: 'http://localhost:20128/v1',
    isLocal: true,
    requiresApiKey: false
  },
  omniroute: {
    id: 'omniroute',
    name: 'OmniRoute',
    defaultBaseUrl: 'http://localhost:20128/v1',
    isLocal: true,
    requiresApiKey: false
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    isLocal: false,
    requiresApiKey: true
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    isLocal: false,
    requiresApiKey: true
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    isLocal: false,
    requiresApiKey: true
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    isLocal: false,
    requiresApiKey: true
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    defaultBaseUrl: '',
    isLocal: false,
    requiresApiKey: false
  }
};

export function resolveBaseUrl(provider: string, override?: string): string {
  const trimmed = override?.trim();
  if (trimmed) {
    return trimmed;
  }
  const preset = PROVIDER_PRESETS[provider as ProviderId];
  return preset ? preset.defaultBaseUrl : '';
}
