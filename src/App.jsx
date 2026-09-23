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

  const handleSend = (text) => {
    const userMessage = {
      message: text,
      sentTime: 'just now',
      sender: 'user',
      direction: 'outgoing',
      position: 'single',
    };
    setMessages((prev) => [...prev, userMessage]);

    // Имитация ответа от бота (позже заменим на запрос к n8n)
    setTimeout(() => {
      const botReply = {
        message: `Получил ваш запрос: "${text}". Уже подбираю варианты!`,
        sentTime: 'just now',
        sender: 'assistant',
        direction: 'incoming',
        position: 'single',
      };
      setMessages((prev) => [...prev, botReply]);
    }, 800);
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        paddingTop: 'env(safe-area-inset-top, 44px)',
        paddingBottom: 'env(safe-area-inset-bottom, 20px)',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
      }}
    >
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messages.map((m, i) => (
              <Message key={i} model={m} />
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