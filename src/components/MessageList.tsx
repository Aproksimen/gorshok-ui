import { useLayoutEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

// Если пользователь находится в пределах этого расстояния от низа ленты,
// считаем его «прилипшим» к низу — и при новых сообщениях докручиваем вниз.
const STICK_TO_BOTTOM_THRESHOLD_PX = 80;

export default function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLElement | null>(null);
  // Запоминаем, прилип ли пользователь к низу, по scroll-событиям — ДО того,
  // как контент изменился. Если мерить после, рост контента (ответ агента
  // длиннее индикатора «…») ошибочно выглядит как «пользователь прокрутил вверх».
  const pinnedToBottomRef = useRef(true);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !pinnedToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    pinnedToBottomRef.current = distanceFromBottom <= STICK_TO_BOTTOM_THRESHOLD_PX;
  };

  return (
    <main
      ref={scrollRef}
      className="chat-messages"
      aria-label="Сообщения"
      onScroll={handleScroll}
    >
      <div
        className="chat-messages__scroll"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </main>
  );
}
