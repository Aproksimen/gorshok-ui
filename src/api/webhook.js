const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

const DEFAULT_TIMEOUT_MS = 30000;

export function isTimeoutError(error) {
  return error?.name === 'AbortError';
}

export async function sendToWebhook(payload, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!WEBHOOK_URL) {
    throw new Error('VITE_WEBHOOK_URL не задана (см. .env.example)');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
