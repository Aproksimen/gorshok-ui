import { MessageInput } from '@chatscope/chat-ui-kit-react';

function ChatInput({ inputValue, sendDisabled, onInputChange, onSend }) {
  return (
    <MessageInput
      placeholder="Введите ваш запрос..."
      value={inputValue}
      onChange={onInputChange}
      onSend={onSend}
      activateAfterChange
      sendDisabled={sendDisabled}
    />
  );
}

export default ChatInput;
