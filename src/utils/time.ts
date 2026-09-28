const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

// Возвращает человекочитаемую подпись времени для сообщения чата:
// «Только что» для свежих (< 1 мин), «N мин» (< 1 ч), иначе HH:MM (ru-RU).
export function formatTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < MINUTE_MS) {
    return 'Только что';
  }
  if (diffMs < HOUR_MS) {
    return `${Math.floor(diffMs / MINUTE_MS)} мин`;
  }
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
