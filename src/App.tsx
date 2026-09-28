import './App.css';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { useVisualViewport } from './hooks/useVisualViewport';
import { useChat } from './hooks/useChat';
import { useClipboardPaste } from './hooks/useClipboardPaste';

function App() {
  const viewport = useVisualViewport();

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

  const handlePaste = useClipboardPaste({
    onImage: handlePasteImage,
    onError: handlePasteError,
  });

  return (
    <div
      className="app-wrapper"
      style={{
        top: `${viewport.top}px`,
        left: `${viewport.left}px`,
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
      }}
    >
      <ChatHeader />
      <MessageList messages={messages} />
      <ChatInput
        value={inputValue}
        onInputChange={handleInputChange}
        onSend={handleSend}
        onAttach={handleFileChange}
        onPaste={handlePaste}
        sendDisabled={sendDisabled}
      />
    </div>
  );
}

export default App;
