const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

const DEFAULT_TIMEOUT_MS = 30000;

export interface WebhookPayload {
  message: string;
  image?: string;
  imageMimeType?: string;
}

export interface WebhookResponse {
  reply?: string;
  response?: string;
  [key: string]: unknown;
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export async function sendToWebhook(
  payload: WebhookPayload,
  { timeoutMs = DEFAULT_TIMEOUT_MS }: { timeoutMs?: number } = {}
): Promise<WebhookResponse> {
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

    return (await response.json()) as WebhookResponse;
  } finally {
    clearTimeout(timeout);
  }
}
