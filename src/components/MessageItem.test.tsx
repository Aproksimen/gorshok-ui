import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LOADING_TEXT } from '../constants';
import type { Message } from '../types';
import MessageItem from './MessageItem';

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: '1',
    sentTime: 'Только что',
    sender: 'assistant',
    direction: 'incoming',
    position: 'single',
    message: 'Привет',
    ...overrides,
  };
}

describe('MessageItem', () => {
  it('renders a regular message without a status role', () => {
    render(<MessageItem message={makeMessage()} />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('marks the loading placeholder as a status region', () => {
    render(<MessageItem message={makeMessage({ message: LOADING_TEXT })} />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-label')).toBe('Ассистент печатает');
    expect(status.textContent).toBe(LOADING_TEXT);
  });
});
