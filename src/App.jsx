import { useEffect, useRef, useState } from 'react';
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

const FILE_INPUT_ID = 'chat-file-input';

// Логотип бренда (лежит в public/), используется в шапке и у аватара бота.
const BRAND_LOGO = '/pwa-512x512.png';
const BRAND_TITLE = 'Подбор компрессора';
const BRAND_NAME = 'GORSHOK';
const BRAND_STATUS = 'Онлайн';
// Единая подпись времени под сообщениями.
const SENT_TIME = 'Только что';

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

const PENDING_IMAGE_PLACEHOLDER = '📎 Изображение';

function App() {
  const fileInputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [pendingImage, setPendingImage] = useState(null);

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

  // Поддержка вставки изображения из буфера обмена.
  // Текст вставляем без форматирования, чтобы шрифт оставался единообразным.
  useEffect(() => {
    const editor = document.querySelector('.cs-message-input__content-editor');
    if (!editor) return;

    const handlePaste = (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      if (items) {
        for (let i = 0; i < items.length; i += 1) {
          const item = items[i];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            fileToJpegDataUrl(file)
              .then((dataUrl) => {
                setPendingImage(dataUrl);
                setInputValue(PENDING_IMAGE_PLACEHOLDER);
              })
              .catch((error) => {
                console.error('Clipboard image processing error:', error);
                setMessages((prev) => [
                  ...prev,
                  {
                    message: 'Не удалось обработать вставленное изображение.',
                    sentTime: SENT_TIME,
                    sender: 'assistant',
                    direction: 'incoming',
                    position: 'single',
                  },
                ]);
              });
            return;
          }
        }
      }

      // Вставляем только plain text, игнорируя стили из Telegram/Word и т.п.
      const plainText = clipboardData.getData('text/plain');
      if (plainText) {
        e.preventDefault();
        document.execCommand('insertText', false, plainText);
      }
    };

    editor.addEventListener('paste', handlePaste);
    return () => editor.removeEventListener('paste', handlePaste);
  }, []);

  const [messages, setMessages] = useState([
    {
      message: 'Здравствуйте! Опишите вашу задачу, и я подберу компрессор.',
      sentTime: SENT_TIME,
      sender: 'assistant',
      direction: 'incoming',
      position: 'single',
    },
  ]);

  const handleSend = async (text) => {
    // Извлекаем чистый текст из innerHTML, который присылает MessageInput.
    const tmp = document.createElement('div');
    tmp.innerHTML = text || '';
    const plainText = tmp.textContent || '';

    const imageToSend = pendingImage;
    const caption =
      plainText === PENDING_IMAGE_PLACEHOLDER ? '' : plainText;

    const userMessage = {
      message: caption,
      sentTime: SENT_TIME,
      sender: 'user',
      direction: 'outgoing',
      position: 'single',
      ...(imageToSend && { image: imageToSend }),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Отправили сообщение — очищаем поле ввода и отложенное изображение.
    setInputValue('');
    if (imageToSend) {
      setPendingImage(null);
    }

    const loadingId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        message: '…',
        sentTime: SENT_TIME,
        sender: 'assistant',
        direction: 'incoming',
        position: 'single',
      },
    ]);

    try {
      const payload = imageToSend
        ? {
            message: caption,
            image: imageToSend.slice(imageToSend.indexOf(',') + 1),
            imageMimeType: 'image/jpeg',
          }
        : { message: plainText };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
                sentTime: SENT_TIME,
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
                sentTime: SENT_TIME,
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
          sentTime: SENT_TIME,
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
          sentTime: SENT_TIME,
          sender: 'assistant',
          direction: 'incoming',
          position: 'single',
        },
      ]);
      return;
    }

    const userImageMessage = {
      message: '',
      sentTime: SENT_TIME,
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
        sentTime: SENT_TIME,
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
                sentTime: SENT_TIME,
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
                sentTime: SENT_TIME,
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
            {messages.map((m, i) => (
              <Message key={m.id ?? i} model={m} avatarPosition="tl">
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
            onChange={(html) => {
              setInputValue(html);
              // Если пользователь стёр плейсхолдер с картинкой, сбрасываем её.
              const tmp = document.createElement('div');
              tmp.innerHTML = html || '';
              if (!tmp.textContent && pendingImage) {
                setPendingImage(null);
              }
            }}
            onSend={handleSend}
            activateAfterChange
            sendDisabled={pendingImage ? false : undefined}
          />
        </ChatContainer>
        <input
          id={FILE_INPUT_ID}
          ref={fileInputRef}
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