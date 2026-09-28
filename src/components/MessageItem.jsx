import { BRAND_LOGO, BRAND_NAME } from '../constants';

export default function MessageItem({ message }) {
  const incoming = message.direction === 'incoming';

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
          <div className="message__bubble">{message.message}</div>
        )}
        <div className="message__time">{message.sentTime}</div>
      </div>
    </div>
  );
}
