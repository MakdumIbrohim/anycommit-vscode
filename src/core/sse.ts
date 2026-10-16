export class SseStreamParser {
  private buffer = '';

  constructor(private readonly onDelta: (delta: string) => void) {}

  public feed(chunk: string): void {
    this.buffer += chunk;
    const lines = this.buffer.split(/\r?\n/);
    // Keep incomplete last fragment in buffer
    this.buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith(':')) {
        continue;
      }
      if (line.startsWith('data:')) {
        const dataStr = line.slice(5).trim();
        if (dataStr === '[DONE]') {
          continue;
        }
        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string') {
            this.onDelta(delta);
          }
        } catch {
          // Ignore partial or non-json line
        }
      }
    }
  }

  public finish(): void {
    if (this.buffer.trim()) {
      const line = this.buffer.trim();
      if (line.startsWith('data:')) {
        const dataStr = line.slice(5).trim();
        if (dataStr !== '[DONE]') {
          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (typeof delta === 'string') {
              this.onDelta(delta);
            }
          } catch {
            // Ignore
          }
        }
      }
    }
    this.buffer = '';
  }
}

export async function* parseOpenAiSseStream(
  stream: AsyncIterable<Uint8Array | string>
): AsyncGenerator<string, void, unknown> {
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of stream) {
    const text = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
    buffer += text;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith(':')) {
        continue;
      }
      if (line.startsWith('data:')) {
        const dataStr = line.slice(5).trim();
        if (dataStr === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string') {
            yield delta;
          }
        } catch {
          // Ignore
        }
      }
    }
  }

  if (buffer.trim()) {
    const line = buffer.trim();
    if (line.startsWith('data:')) {
      const dataStr = line.slice(5).trim();
      if (dataStr !== '[DONE]') {
        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string') {
            yield delta;
          }
        } catch {
          // Ignore
        }
      }
    }
  }
}
