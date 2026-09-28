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

// jsdom не делает layout, поэтому имитируем метрики скролла контейнера.
function mockScrollMetrics(
  el: HTMLElement,
  initial: { scrollTop: number; scrollHeight: number; clientHeight: number }
): () => number {
  let scrollTop = initial.scrollTop;
  Object.defineProperty(el, 'scrollHeight', { value: initial.scrollHeight, configurable: true });
  Object.defineProperty(el, 'clientHeight', { value: initial.clientHeight, configurable: true });
  Object.defineProperty(el, 'scrollTop', {
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = value;
    },
    configurable: true,
  });
  return () => scrollTop;
}

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

  it('auto-scrolls to the bottom when a new message arrives', () => {
    const { rerender, container } = render(<MessageList messages={[baseMessage]} />);
    const scroller = container.querySelector('.chat-messages') as HTMLElement;
    const getScrollTop = mockScrollMetrics(scroller, {
      scrollTop: 800,
      scrollHeight: 1000,
      clientHeight: 200,
    });

    rerender(
      <MessageList messages={[baseMessage, { ...baseMessage, id: '2', message: 'Ответ' }]} />
    );

    expect(getScrollTop()).toBe(1000);
  });

  it('does not auto-scroll when the user has scrolled up', () => {
    const { rerender, container } = render(<MessageList messages={[baseMessage]} />);
    const scroller = container.querySelector('.chat-messages') as HTMLElement;
    const getScrollTop = mockScrollMetrics(scroller, {
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 200,
    });

    rerender(
      <MessageList messages={[baseMessage, { ...baseMessage, id: '2', message: 'Ответ' }]} />
    );

    expect(getScrollTop()).toBe(0);
  });
});
