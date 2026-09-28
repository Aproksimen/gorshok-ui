import { Avatar, ConversationHeader } from '@chatscope/chat-ui-kit-react';
import {
  BRAND_LOGO,
  BRAND_NAME,
  BRAND_STATUS,
  BRAND_TITLE,
} from '../constants';

function ChatHeader() {
  return (
    <ConversationHeader>
      <Avatar name={BRAND_NAME} src={BRAND_LOGO} />
      <ConversationHeader.Content>
        <span className="brand-title">{BRAND_TITLE}</span>
        <span className="brand-subtitle">
          <span className="brand-status-dot" aria-hidden="true" />
          <span className="brand-name">{BRAND_NAME}</span>
          <span className="brand-separator">·</span>
          <span className="brand-status">{BRAND_STATUS}</span>
        </span>
      </ConversationHeader.Content>
    </ConversationHeader>
  );
}

export default ChatHeader;
