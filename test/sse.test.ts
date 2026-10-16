import { describe, it, expect } from 'vitest';
import { SseStreamParser, parseOpenAiSseStream } from '../src/core/sse';

describe('SSE Parser', () => {
  it('parses standard OpenAI stream chunks', () => {
    const received: string[] = [];
    const parser = new SseStreamParser((delta) => received.push(delta));

    parser.feed('data: {"choices":[{"delta":{"content":"feat"}}]}\n\n');
    parser.feed('data: {"choices":[{"delta":{"content":": add"}}]}\n\n');
    parser.feed('data: {"choices":[{"delta":{"content":" login"}}]}\n\n');
    parser.feed('data: [DONE]\n\n');
    parser.finish();

    expect(received).toEqual(['feat', ': add', ' login']);
    expect(received.join('')).toBe('feat: add login');
  });

  it('handles chunk splitting in the middle of a line or json', () => {
    const received: string[] = [];
    const parser = new SseStreamParser((delta) => received.push(delta));

    const chunk1 = 'data: {"choi';
    const chunk2 = 'ces":[{"delta":{"content":"fix: ';
    const chunk3 = 'bug"}}]}\n\n';

    parser.feed(chunk1);
    parser.feed(chunk2);
    parser.feed(chunk3);
    parser.finish();

    expect(received.join('')).toBe('fix: bug');
  });

  it('ignores comments and empty lines', () => {
    const received: string[] = [];
    const parser = new SseStreamParser((delta) => received.push(delta));

    parser.feed(': keepalive\n\n');
    parser.feed('\n\n');
    parser.feed('data: {"choices":[{"delta":{"content":"hello"}}]}\n\n');
    parser.finish();

    expect(received).toEqual(['hello']);
  });

  it('works with parseOpenAiSseStream async iterator', async () => {
    async function* source() {
      yield 'data: {"choices":[{"delta":{"content":"hello"}}]}\n\n';
      yield 'data: {"choices":[{"delta":{"content":" world"}}]}\n\n';
      yield 'data: [DONE]\n\n';
    }

    const deltas: string[] = [];
    for await (const delta of parseOpenAiSseStream(source())) {
      deltas.push(delta);
    }

    expect(deltas.join('')).toBe('hello world');
  });
});
