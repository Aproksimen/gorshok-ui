import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

// Если пользователь находится в пределах этого расстояния от низа ленты,
// считаем его «прилипшим» к низу и докручиваем до последнего сообщения.
const STICK_TO_BOTTOM_THRESHOLD_PX = 80;

export default function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom <= STICK_TO_BOTTOM_THRESHOLD_PX) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <main ref={scrollRef} className="chat-messages" aria-label="Сообщения">
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
