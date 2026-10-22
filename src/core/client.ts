import { normalizeBaseUrl } from './url';
import { ChatMessage } from './prompt';
import { SseStreamParser } from './sse';

export interface ChatCompleteOptions {
  baseUrl: string;
  apiKey?: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutSeconds?: number;
  signal?: AbortSignal;
  retryDelayMs?: number;
}

export interface ChatCompleteStreamOptions extends ChatCompleteOptions {
  onToken: (token: string) => void;
}

export interface ListModelsOptions {
  baseUrl: string;
  apiKey?: string;
  timeoutSeconds?: number;
  signal?: AbortSignal;
  retryDelayMs?: number;
}

export class LlmClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isTransient: boolean = false
  ) {
    super(message);
    this.name = 'LlmClientError';
  }
}

type FetchFn = typeof fetch;

function isTransientStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const ANYCOMMIT_CLIENT_TOKEN = 'ac_gw_makdum_f7a8e9b10c';

function buildHeaders(apiKey?: string, baseUrl?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const trimmedKey = apiKey?.trim();
  if (trimmedKey) {
    headers['Authorization'] = `Bearer ${trimmedKey}`;
  }
  if (
    baseUrl &&
    (baseUrl.includes('anycommit') || baseUrl.includes('vercel.app'))
  ) {
    headers['x-anycommit-client-token'] = ANYCOMMIT_CLIENT_TOKEN;
  }
  return headers;
}

async function executeWithTimeoutAndRetry<T>(
  action: (signal: AbortSignal) => Promise<T>,
  options: {
    baseUrl: string;
    timeoutSeconds?: number;
    userSignal?: AbortSignal;
    retryDelayMs?: number;
  }
): Promise<T> {
  const timeoutSeconds = options.timeoutSeconds ?? 60;
  const timeoutMs = timeoutSeconds * 1000;
  const retryDelay = options.retryDelayMs ?? 300;

  let attempt = 0;
  while (true) {
    attempt++;
    const controller = new AbortController();
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const onUserAbort = () => {
      controller.abort();
    };

    if (options.userSignal) {
      if (options.userSignal.aborted) {
        clearTimeout(timer);
        throw new LlmClientError('Request was cancelled.', undefined, false);
      }
      options.userSignal.addEventListener('abort', onUserAbort, { once: true });
    }

    try {
      return await action(controller.signal);
    } catch (err: any) {
      if (options.userSignal?.aborted) {
        throw new LlmClientError('Request was cancelled.', undefined, false);
      }

      if (timedOut) {
        if (attempt === 1) {
          await delay(retryDelay);
          continue;
        }
        throw new LlmClientError(`Request timed out after ${timeoutSeconds}s.`, undefined, true);
      }

      if (err instanceof LlmClientError) {
        if (err.isTransient && attempt === 1) {
          await delay(retryDelay);
          continue;
        }
        throw err;
      }

      // Network / connection errors (e.g. fetch failed, ECONNREFUSED)
      if (attempt === 1) {
        await delay(retryDelay);
        continue;
      }

      const displayUrl = normalizeBaseUrl(options.baseUrl).url || options.baseUrl;
      throw new LlmClientError(
        `Cannot reach ${displayUrl}. Is your gateway (9router/OmniRoute) running?`,
        undefined,
        true
      );
    } finally {
      clearTimeout(timer);
      if (options.userSignal) {
        options.userSignal.removeEventListener('abort', onUserAbort);
      }
    }
  }
}

export async function chatComplete(
  options: ChatCompleteOptions,
  fetchFn: FetchFn = fetch
): Promise<string> {
  const cleanUrl = normalizeBaseUrl(options.baseUrl).url;
  if (!cleanUrl) {
    throw new LlmClientError('Base URL is not configured.', undefined, false);
  }

  const endpoint = `${cleanUrl}/chat/completions`;
  const headers = buildHeaders(options.apiKey, options.baseUrl);
  const payload = {
    model: options.model,
    messages: options.messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 400
  };

  return executeWithTimeoutAndRetry(
    async (signal) => {
      const res = await fetchFn(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new LlmClientError('API key missing or invalid.', 401, false);
        }
        if (res.status === 404) {
          throw new LlmClientError(
            'Model or endpoint not found (check base URL and model).',
            404,
            false
          );
        }

        const isTransient = isTransientStatus(res.status);
        let errorMsg = `Request failed with status ${res.status}.`;
        try {
          const body = (await res.json()) as any;
          if (body?.error?.message) {
            errorMsg = body.error.message;
          }
        } catch {
          // ignore json parse error
        }
        throw new LlmClientError(errorMsg, res.status, isTransient);
      }

      const data = (await res.json()) as any;
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string') {
        throw new LlmClientError(
          'Invalid response format: missing choices[0].message.content',
          undefined,
          false
        );
      }

      return content;
    },
    {
      baseUrl: options.baseUrl,
      timeoutSeconds: options.timeoutSeconds,
      userSignal: options.signal,
      retryDelayMs: options.retryDelayMs
    }
  );
}

export async function chatCompleteStream(
  options: ChatCompleteStreamOptions,
  fetchFn: FetchFn = fetch
): Promise<string> {
  const cleanUrl = normalizeBaseUrl(options.baseUrl).url;
  if (!cleanUrl) {
    throw new LlmClientError('Base URL is not configured.', undefined, false);
  }

  const endpoint = `${cleanUrl}/chat/completions`;
  const headers = buildHeaders(options.apiKey, options.baseUrl);
  headers['Accept'] = 'text/event-stream';

  const payload = {
    model: options.model,
    messages: options.messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 400,
    stream: true
  };

  return executeWithTimeoutAndRetry(
    async (signal) => {
      const res = await fetchFn(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new LlmClientError('API key missing or invalid.', 401, false);
        }
        if (res.status === 404) {
          throw new LlmClientError(
            'Model or endpoint not found (check base URL and model).',
            404,
            false
          );
        }

        const isTransient = isTransientStatus(res.status);
        let errorMsg = `Request failed with status ${res.status}.`;
        try {
          const body = (await res.json()) as any;
          if (body?.error?.message) {
            errorMsg = body.error.message;
          }
        } catch {
          // ignore
        }
        throw new LlmClientError(errorMsg, res.status, isTransient);
      }

      let fullText = '';
      let rawAccumulated = '';
      const parser = new SseStreamParser((delta) => {
        fullText += delta;
        options.onToken(delta);
      });

      if (res.body && typeof (res.body as any).getReader === 'function') {
        const reader = (res.body as ReadableStream<Uint8Array>).getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            if (value) {
              const text = decoder.decode(value, { stream: true });
              rawAccumulated += text;
              parser.feed(text);
            }
          }
        } finally {
          reader.releaseLock();
        }
      } else if (res.body && Symbol.asyncIterator in (res.body as any)) {
        const decoder = new TextDecoder();
        for await (const chunk of res.body as any) {
          const text = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
          rawAccumulated += text;
          parser.feed(text);
        }
      } else {
        const text = await res.text();
        rawAccumulated = text;
        parser.feed(text);
      }

      parser.finish();

      if (!fullText.trim() && rawAccumulated.trim()) {
        try {
          const parsed = JSON.parse(rawAccumulated);
          const jsonContent = parsed?.choices?.[0]?.message?.content;
          if (typeof jsonContent === 'string' && jsonContent.trim()) {
            options.onToken(jsonContent);
            return jsonContent;
          }
        } catch {
          // not json
        }
      }

      return fullText;
    },
    {
      baseUrl: options.baseUrl,
      timeoutSeconds: options.timeoutSeconds,
      userSignal: options.signal,
      retryDelayMs: options.retryDelayMs
    }
  );
}

export async function listModels(
  options: ListModelsOptions,
  fetchFn: FetchFn = fetch
): Promise<string[]> {
  const cleanUrl = normalizeBaseUrl(options.baseUrl).url;
  if (!cleanUrl) {
    throw new LlmClientError('Base URL is not configured.', undefined, false);
  }

  const endpoint = `${cleanUrl}/models`;
  const headers = buildHeaders(options.apiKey, options.baseUrl);

  return executeWithTimeoutAndRetry(
    async (signal) => {
      const res = await fetchFn(endpoint, {
        method: 'GET',
        headers,
        signal
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new LlmClientError('API key missing or invalid.', 401, false);
        }
        if (res.status === 404) {
          throw new LlmClientError(
            'Model or endpoint not found (check base URL and model).',
            404,
            false
          );
        }

        const isTransient = isTransientStatus(res.status);
        let errorMsg = `Request failed with status ${res.status}.`;
        try {
          const body = (await res.json()) as any;
          if (body?.error?.message) {
            errorMsg = body.error.message;
          }
        } catch {
          // ignore json parse error
        }
        throw new LlmClientError(errorMsg, res.status, isTransient);
      }

      const data = (await res.json()) as any;
      if (!Array.isArray(data?.data)) {
        throw new LlmClientError(
          'Invalid response format: expected data array in models response',
          undefined,
          false
        );
      }

      return data.data
        .map((m: any) => m?.id)
        .filter((id: any): id is string => typeof id === 'string');
    },
    {
      baseUrl: options.baseUrl,
      timeoutSeconds: options.timeoutSeconds,
      userSignal: options.signal,
      retryDelayMs: options.retryDelayMs
    }
  );
}
