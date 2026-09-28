import { BRAND_LOGO, BRAND_NAME, LOADING_TEXT } from '../constants';
import type { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const incoming = message.direction === 'incoming';
  const isTyping = message.message === LOADING_TEXT;

  return (
    <div
      className={`message ${incoming ? 'message--incoming' : 'message--outgoing'}`}
    >
      {incoming && (
        <div className="message__avatar">
          <img src={BRAND_LOGO} alt={BRAND_NAME} />
        </div>
      )}
      <div className="message__body">
        {message.image && (
          <div className="message__image">
            <img src={message.image} alt="Прикреплённое фото" />
          </div>
        )}
        {message.message && (
          <div
            className="message__bubble"
            {...(isTyping
              ? { role: 'status', 'aria-label': 'Ассистент печатает' }
              : {})}
          >
            {message.message}
          </div>
        )}
        <div className="message__time">{message.sentTime}</div>
      </div>
    </div>
  );
}
