import MessageItem from './MessageItem';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <main className="chat-messages" aria-label="Сообщения">
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
