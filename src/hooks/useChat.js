import { useCallback, useState } from 'react';
import { sendToWebhook, isTimeoutError } from '../api/webhook';
import { PENDING_IMAGE_PLACEHOLDER, SENT_TIME } from '../constants';
import { fileToJpegDataUrl } from '../utils/image';

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeMessage(overrides = {}) {
  return {
    id: makeId(),
    sentTime: SENT_TIME,
    sender: 'assistant',
    direction: 'incoming',
    position: 'single',
    ...overrides,
  };
}

const INITIAL_MESSAGE = makeMessage({
  message: 'Здравствуйте! Опишите вашу задачу, и я подберу компрессор.',
});

export function useChat() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [pendingImage, setPendingImage] = useState(null);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const patchMessage = useCallback((id, patch) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }, []);

  // Единая точка сетевого запроса: убирает дублирование между отправкой
  // текста (handleSend) и отправкой картинки (handleFileChange).
  const requestReply = useCallback(
    async (loadingId, payload) => {
      try {
        const data = await sendToWebhook(payload);
        const replyText =
          data.reply || data.response || 'Пустой ответ от сервера';
        patchMessage(loadingId, { message: replyText });
      } catch (error) {
        console.error('Webhook error:', error);
        const message = isTimeoutError(error)
          ? 'Сервер не ответил вовремя. Попробуйте ещё раз.'
          : `Ошибка: ${error.message}. Проверьте, что workflow в n8n активен и CORS настроен.`;
        patchMessage(loadingId, { message });
      }
    },
    [patchMessage]
  );

  const handleInputChange = useCallback(
    (html) => {
      setInputValue(html);
      // Если пользователь стёр плейсхолдер с картинкой, сбрасываем её.
      const tmp = document.createElement('div');
      tmp.innerHTML = html || '';
      if (!tmp.textContent && pendingImage) {
        setPendingImage(null);
      }
    },
    [pendingImage]
  );

  const handleSend = useCallback(
    async (text) => {
      // Извлекаем чистый текст из innerHTML, который присылает MessageInput.
      const tmp = document.createElement('div');
      tmp.innerHTML = text || '';
      const plainText = tmp.textContent || '';

      const imageToSend = pendingImage;
      const caption =
        plainText === PENDING_IMAGE_PLACEHOLDER ? '' : plainText;

      addMessage(
        makeMessage({
          message: caption,
          sender: 'user',
          direction: 'outgoing',
          ...(imageToSend && { image: imageToSend }),
        })
      );

      // Отправили сообщение — очищаем поле ввода и отложенное изображение.
      setInputValue('');
      if (imageToSend) {
        setPendingImage(null);
      }

      const loadingMessage = makeMessage({ message: '…' });
      addMessage(loadingMessage);

      const payload = imageToSend
        ? {
            message: caption,
            image: imageToSend.slice(imageToSend.indexOf(',') + 1),
            imageMimeType: 'image/jpeg',
          }
        : { message: plainText };

      await requestReply(loadingMessage.id, payload);
    },
    [pendingImage, addMessage, requestReply]
  );

  const handleFileChange = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        addMessage(
          makeMessage({ message: 'Можно прикреплять только изображения.' })
        );
        return;
      }

      let imageDataUrl;
      try {
        imageDataUrl = await fileToJpegDataUrl(file);
      } catch (error) {
        console.error('Image processing error:', error);
        addMessage(
          makeMessage({
            message:
              'Не удалось обработать изображение. Попробуйте другое фото.',
          })
        );
        return;
      }

      addMessage(
        makeMessage({
          message: '',
          sender: 'user',
          direction: 'outgoing',
          image: imageDataUrl,
        })
      );

      const loadingMessage = makeMessage({ message: '…' });
      addMessage(loadingMessage);

      const base64 = imageDataUrl.slice(imageDataUrl.indexOf(',') + 1);
      await requestReply(loadingMessage.id, {
        message: '',
        image: base64,
        imageMimeType: 'image/jpeg',
      });
    },
    [addMessage, requestReply]
  );

  const handlePasteImage = useCallback((dataUrl) => {
    setPendingImage(dataUrl);
    setInputValue(PENDING_IMAGE_PLACEHOLDER);
  }, []);

  const handlePasteError = useCallback(() => {
    addMessage(
      makeMessage({ message: 'Не удалось обработать вставленное изображение.' })
    );
  }, [addMessage]);

  return {
    messages,
    inputValue,
    sendDisabled: pendingImage ? false : undefined,
    handleInputChange,
    handleSend,
    handleFileChange,
    handlePasteImage,
    handlePasteError,
  };
}
