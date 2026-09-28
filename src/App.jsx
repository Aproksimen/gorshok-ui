import { MainContainer, ChatContainer } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './App.css';

import { useVisualViewport } from './hooks/useVisualViewport';
import { useChat } from './hooks/useChat';
import { useClipboardPaste } from './hooks/useClipboardPaste';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import FileInput from './components/FileInput';

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
        <ChatContainer>
          <ChatHeader />
          <MessageList messages={messages} />
          <ChatInput
            inputValue={inputValue}
            sendDisabled={sendDisabled}
            onInputChange={handleInputChange}
            onSend={handleSend}
          />
        </ChatContainer>
        <FileInput onFileChange={handleFileChange} />
      </MainContainer>
    </div>
  );
}

export default App;
