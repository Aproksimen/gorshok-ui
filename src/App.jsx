import { useEffect, useRef, useState } from 'react';
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

const MAX_IMAGE_DIMENSION = 1920;
const JPEG_QUALITY = 0.92;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function getResizedDimensions(width, height, maxDim) {
  if (width <= maxDim && height <= maxDim) {
    return { width, height };
  }
  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function fileToJpegDataUrl(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const { width, height } = getResizedDimensions(
      img.naturalWidth,
      img.naturalHeight,
      MAX_IMAGE_DIMENSION
    );
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function App() {
  const fileInputRef = useRef(null);

  useEffect(() => {
    const updateViewport = () => {
      const vv = window.visualViewport;
      if (vv) {
        document.documentElement.style.setProperty(
          '--vv-height',
          `${vv.height}px`
        );
        document.documentElement.style.setProperty(
          '--vv-width',
          `${vv.width}px`
        );
        document.documentElement.style.setProperty(
          '--vv-top',
          `${vv.offsetTop}px`
        );
        document.documentElement.style.setProperty(
          '--vv-left',
          `${vv.offsetLeft}px`
        );
      }
    };

    // Prevent iOS from scrolling the whole document when the keyboard opens;
    // keep the document pinned to the top-left of the layout viewport.
    const preventBodyScroll = () => {
      window.scrollTo(0, 0);
    };

    updateViewport();
    preventBodyScroll();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', updateViewport);
      vv.addEventListener('scroll', updateViewport);
    }
    window.addEventListener('resize', updateViewport);
    window.addEventListener('scroll', preventBodyScroll, { passive: true });

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateViewport);
        vv.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('scroll', preventBodyScroll);
    };
  }, []);

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

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessages((prev) => [
        ...prev,
        {
          message: 'Можно прикреплять только изображения.',
          sentTime: 'just now',
          sender: 'assistant',
          direction: 'incoming',
          position: 'single',
        },
      ]);
      return;
    }

    let imageDataUrl;
    try {
      imageDataUrl = await fileToJpegDataUrl(file);
    } catch (error) {
      console.error('Image processing error:', error);
      setMessages((prev) => [
        ...prev,
        {
          message:
            'Не удалось обработать изображение. Попробуйте другое фото.',
          sentTime: 'just now',
          sender: 'assistant',
          direction: 'incoming',
          position: 'single',
        },
      ]);
      return;
    }

    const userImageMessage = {
      message: '',
      sentTime: 'just now',
      sender: 'user',
      direction: 'outgoing',
      position: 'single',
      image: imageDataUrl,
    };
    setMessages((prev) => [...prev, userImageMessage]);

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
      const base64 = imageDataUrl.slice(imageDataUrl.indexOf(',') + 1);
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
          image: base64,
          imageMimeType: 'image/jpeg',
        }),
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
              <Message key={m.id ?? i} model={m}>
                {m.image && (
                  <Message.ImageContent
                    src={m.image}
                    alt="Прикреплённое фото"
                  />
                )}
              </Message>
            ))}
          </MessageList>
          <MessageInput
            placeholder="Введите ваш запрос..."
            onSend={handleSend}
            onAttachClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="file-input"
            onChange={handleFileChange}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default App;