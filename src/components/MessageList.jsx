import {
  Avatar,
  Message,
  MessageList as KitMessageList,
} from '@chatscope/chat-ui-kit-react';
import { BRAND_LOGO, BRAND_NAME } from '../constants';

function MessageList({ messages }) {
  return (
    <KitMessageList>
      {messages.map((m) => (
        <Message key={m.id} model={m} avatarPosition="tl">
          {m.direction === 'incoming' && (
            <Avatar name={BRAND_NAME} src={BRAND_LOGO} />
          )}
          {m.image && (
            <Message.ImageContent src={m.image} alt="Прикреплённое фото" />
          )}
          <Message.Footer sentTime={m.sentTime} />
        </Message>
      ))}
    </KitMessageList>
  );
}

export default MessageList;
