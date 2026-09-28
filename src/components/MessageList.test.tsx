import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
) {
  const state = { ...initial };
  Object.defineProperty(el, 'scrollHeight', {
    get: () => state.scrollHeight,
    configurable: true,
  });
  Object.defineProperty(el, 'clientHeight', {
    get: () => state.clientHeight,
    configurable: true,
  });
  Object.defineProperty(el, 'scrollTop', {
    get: () => state.scrollTop,
    set: (value: number) => {
      state.scrollTop = value;
    },
    configurable: true,
  });
  return {
    getScrollTop: () => state.scrollTop,
    set: (patch: Partial<typeof initial>) => Object.assign(state, patch),
  };
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
    const metrics = mockScrollMetrics(scroller, {
      scrollTop: 800,
      scrollHeight: 1000,
      clientHeight: 200,
    });

    rerender(
      <MessageList messages={[baseMessage, { ...baseMessage, id: '2', message: 'Ответ' }]} />
    );

    expect(metrics.getScrollTop()).toBe(1000);
  });

  it('auto-scrolls even when a taller reply replaces the loading indicator', () => {
    const { rerender, container } = render(<MessageList messages={[baseMessage]} />);
    const scroller = container.querySelector('.chat-messages') as HTMLElement;
    const metrics = mockScrollMetrics(scroller, {
      scrollTop: 800,
      scrollHeight: 1000,
      clientHeight: 200,
    });

    // Контент резко вырос (длинный ответ агента вместо «…»), позиция не менялась —
    // пользователь всё ещё «прилип» к низу, поэтому должны докрутить до нового низа.
    metrics.set({ scrollHeight: 1600 });

    rerender(
      <MessageList messages={[baseMessage, { ...baseMessage, id: '2', message: 'Длинный ответ' }]} />
    );

    expect(metrics.getScrollTop()).toBe(1600);
  });

  it('does not auto-scroll after the user scrolls up', () => {
    const { rerender, container } = render(<MessageList messages={[baseMessage]} />);
    const scroller = container.querySelector('.chat-messages') as HTMLElement;
    const metrics = mockScrollMetrics(scroller, {
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 200,
    });

    // Пользователь прокрутил вверх — фиксируем «отлипание» от низа.
    fireEvent.scroll(scroller);

    rerender(
      <MessageList messages={[baseMessage, { ...baseMessage, id: '2', message: 'Ответ' }]} />
    );

    expect(metrics.getScrollTop()).toBe(0);
  });
});
