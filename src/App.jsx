import { useState } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './App.css';

const WEBHOOK_URL =
  'https://main-production-a2c6.up.railway.app/webhook/compressorSelect';

function App() {
  const [messages, setMessages] = useState([
    {
      message: 'Здравствуйте! Опишите вашу задачу, и я подберу компрессор.',
      sentTime: 'just now',
      sender: 'assistant',
      direction: 'incoming',
      position: 'single',
    },
  ]);

  const handleSend = async (text) => {
    const userMessage = {
      message: text,
      sentTime: 'just now',
      sender: 'user',
      direction: 'outgoing',
      position: 'single',
    };
    setMessages((prev) => [...prev, userMessage]);

    const loadingId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        message: '…',
        sentTime: 'just now',
        sender: 'assistant',
        direction: 'incoming',
        position: 'single',
      },
    ]);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const replyText =
        data.reply || data.response || 'Пустой ответ от сервера';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                message: replyText,
                sentTime: 'just now',
                sender: 'assistant',
                direction: 'incoming',
                position: 'single',
              }
            : m
        )
      );
    } catch (error) {
      console.error('Webhook error:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                message: `Ошибка: ${error.message}. Проверьте, что workflow в n8n активен и CORS настроен.`,
                sentTime: 'just now',
                sender: 'assistant',
                direction: 'incoming',
                position: 'single',
              }
            : m
        )
      );
    }
  };

  return (
    <div className="app-wrapper">
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messages.map((m, i) => (
              <Message key={m.id ?? i} model={m} />
            ))}
          </MessageList>
          <MessageInput
            placeholder="Введите ваш запрос..."
            onSend={handleSend}
            attachButton={false}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default App;