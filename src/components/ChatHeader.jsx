import { BRAND_LOGO, BRAND_TITLE, BRAND_NAME, BRAND_STATUS } from '../constants';

export default function ChatHeader() {
  return (
    <header className="chat-header">
      <div className="chat-header__avatar">
        <img src={BRAND_LOGO} alt={BRAND_NAME} />
      </div>
      <div className="chat-header__info">
        <h1 className="chat-header__title">{BRAND_TITLE}</h1>
        <div className="chat-header__status">
          <span className="chat-header__status-dot" aria-hidden="true" />
          <span className="chat-header__status-text">
            {BRAND_NAME} · {BRAND_STATUS}
          </span>
        </div>
      </div>
    </header>
  );
}
