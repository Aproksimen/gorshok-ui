import { describe, it, expect } from 'vitest';
import { formatTime } from './time';

const hhmm = (hour: number, minute: number): string =>
  new Date(2026, 0, 1, hour, minute).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

describe('formatTime', () => {
  const now = new Date(2026, 0, 1, 12, 0, 0);

  it('shows "Только что" at the exact moment', () => {
    expect(formatTime(now, now)).toBe('Только что');
  });

  it('shows "Только что" for a message under a minute old', () => {
    expect(formatTime(new Date(2026, 0, 1, 11, 59, 30), now)).toBe('Только что');
  });

  it('shows "1 мин" at exactly one minute', () => {
    expect(formatTime(new Date(2026, 0, 1, 11, 59, 0), now)).toBe('1 мин');
  });

  it('shows "59 мин" for a message under an hour old', () => {
    expect(formatTime(new Date(2026, 0, 1, 11, 1, 0), now)).toBe('59 мин');
  });

  it('falls back to HH:MM at one hour or more', () => {
    const result = formatTime(new Date(2026, 0, 1, 11, 0, 0), now);
    expect(result).toBe(hhmm(11, 0));
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('formats a far-past timestamp as HH:MM', () => {
    expect(formatTime(new Date(2026, 0, 1, 9, 5, 0), now)).toBe(hhmm(9, 5));
  });
});
