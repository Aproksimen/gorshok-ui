import MessageItem from './MessageItem';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <main className="chat-messages" aria-live="polite">
      <div className="chat-messages__scroll">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </main>
  );
}
