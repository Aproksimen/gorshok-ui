import { afterEach, describe, expect, it, vi } from 'vitest';

// sendToWebhook читает import.meta.env при загрузке модуля,
// поэтому пере-импортируем модуль с подставленными значениями на каждый тест.
async function loadWebhook(url: string, apiKey: string = '') {
  vi.resetModules();
  vi.stubEnv('VITE_WEBHOOK_URL', url);
  vi.stubEnv('VITE_WEBHOOK_API_KEY', apiKey);
  return import('./webhook');
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('isTimeoutError', () => {
  it('detects AbortError and rejects everything else', async () => {
    const { isTimeoutError } = await loadWebhook('https://example.com/hook');
    const abort = new Error('aborted');
    abort.name = 'AbortError';
    expect(isTimeoutError(abort)).toBe(true);
    expect(isTimeoutError(new Error('nope'))).toBe(false);
    expect(isTimeoutError('string')).toBe(false);
  });
});

describe('sendToWebhook', () => {
  it('throws when VITE_WEBHOOK_URL is not set', async () => {
    const { sendToWebhook } = await loadWebhook('');
    await expect(sendToWebhook({ message: 'hi' })).rejects.toThrow('VITE_WEBHOOK_URL');
  });

  it('throws when VITE_WEBHOOK_API_KEY is not set', async () => {
    const { sendToWebhook } = await loadWebhook('https://example.com/hook', '');
    await expect(sendToWebhook({ message: 'hi' })).rejects.toThrow('VITE_WEBHOOK_API_KEY');
  });

  it('posts JSON with X-API-Key header and returns the parsed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reply: 'Ответ бота' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { sendToWebhook } = await loadWebhook(
      'https://example.com/hook',
      'bbfd439a-265f-4b7f-bf0e-16f0d04aa34b'
    );
    const data = await sendToWebhook({ message: 'hi' });

    expect(data).toEqual({ reply: 'Ответ бота' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.com/hook');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.headers['X-API-Key']).toBe('bbfd439a-265f-4b7f-bf0e-16f0d04aa34b');
    expect(JSON.parse(init.body)).toEqual({ message: 'hi' });
  });

  it('throws on a non-OK HTTP response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const { sendToWebhook } = await loadWebhook(
      'https://example.com/hook',
      'bbfd439a-265f-4b7f-bf0e-16f0d04aa34b'
    );
    await expect(sendToWebhook({ message: 'hi' })).rejects.toThrow('HTTP 500');
  });

  it('aborts and rejects after timeoutMs', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => {
            const err = new Error('aborted');
            err.name = 'AbortError';
            reject(err);
          });
        })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { sendToWebhook } = await loadWebhook(
      'https://example.com/hook',
      'bbfd439a-265f-4b7f-bf0e-16f0d04aa34b'
    );
    const promise = sendToWebhook({ message: 'hi' }, { timeoutMs: 1000 });
    const assertion = expect(promise).rejects.toThrow('aborted');

    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });
});
