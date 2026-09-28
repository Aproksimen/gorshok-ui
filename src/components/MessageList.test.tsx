import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Message } from '../types';
import MessageList from './MessageList';

const baseMessage: Message = {
  id: '1',
  sentTime: 'Только что',
  sender: 'assistant',
  direction: 'incoming',
  position: 'single',
  message: 'Привет',
};

describe('MessageList', () => {
  it('labels the messages region', () => {
    render(<MessageList messages={[baseMessage]} />);
    expect(screen.getByRole('main').getAttribute('aria-label')).toBe('Сообщения');
  });

  it('marks the scroll container as a polite live log region', () => {
    render(<MessageList messages={[baseMessage]} />);
    const log = screen.getByRole('log');
    expect(log.getAttribute('aria-live')).toBe('polite');
    expect(log.getAttribute('aria-relevant')).toBe('additions');
  });
});
