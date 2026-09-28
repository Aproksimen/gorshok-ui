import {
  MainContainer,
  ChatContainer,
  ConversationHeader,
  Avatar,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './App.css';

import {
  FILE_INPUT_ID,
  BRAND_LOGO,
  BRAND_TITLE,
  BRAND_NAME,
  BRAND_STATUS,
} from './constants';
import { useVisualViewport } from './hooks/useVisualViewport';
import { useChat } from './hooks/useChat';
import { useClipboardPaste } from './hooks/useClipboardPaste';

function App() {
  useVisualViewport();

  const {
    messages,
    inputValue,
    sendDisabled,
    handleInputChange,
    handleSend,
    handleFileChange,
    handlePasteImage,
    handlePasteError,
  } = useChat();

  useClipboardPaste({
    onImage: handlePasteImage,
    onError: handlePasteError,
  });

  return (
    <div className="app-wrapper">
      <MainContainer>
        {/* Внимание: kit-компоненты ConversationHeader / MessageList /
            MessageInput обязаны быть прямыми детьми ChatContainer — его
            getChildren() извлекает детей строго по типу и молча отбрасывает
            любые обёртки. Поэтому разбивать их на отдельные компоненты нельзя. */}
        <ChatContainer>
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
          <MessageList>
            {messages.map((m) => (
              <Message key={m.id} model={m} avatarPosition="tl">
                {m.direction === 'incoming' && (
                  <Avatar name={BRAND_NAME} src={BRAND_LOGO} />
                )}
                {m.image && (
                  <Message.ImageContent
                    src={m.image}
                    alt="Прикреплённое фото"
                  />
                )}
                <Message.Footer sentTime={m.sentTime} />
              </Message>
            ))}
          </MessageList>
          <MessageInput
            placeholder="Введите ваш запрос..."
            value={inputValue}
            onChange={handleInputChange}
            onSend={handleSend}
            activateAfterChange
            sendDisabled={sendDisabled}
          />
        </ChatContainer>
        <input
          id={FILE_INPUT_ID}
          type="file"
          accept="image/*"
          className="file-input"
          onChange={handleFileChange}
        />
      </MainContainer>
    </div>
  );
}

export default App;
