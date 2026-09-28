import MessageItem from './MessageItem';

export default function MessageList({ messages }) {
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
