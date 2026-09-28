import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import { sendToWebhook, isTimeoutError } from '../api/webhook';
import type { WebhookPayload } from '../api/webhook';
import { PENDING_IMAGE_PLACEHOLDER, SENT_TIME } from '../constants';
import type { Message } from '../types';
import { fileToJpegDataUrl } from '../utils/image';

function makeId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeMessage(overrides: Partial<Message> & { message: string }): Message {
  return {
    id: makeId(),
    sentTime: SENT_TIME,
    sender: 'assistant',
    direction: 'incoming',
    position: 'single',
    ...overrides,
  };
}

const INITIAL_MESSAGE: Message = makeMessage({
  message: 'Здравствуйте! Опишите вашу задачу, и я подберу компрессор.',
});

export interface UseChatResult {
  messages: Message[];
  inputValue: string;
  sendDisabled: boolean;
  handleInputChange: (text: string) => void;
  handleSend: () => Promise<void>;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handlePasteImage: (dataUrl: string) => void;
  handlePasteError: () => void;
}

export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const patchMessage = useCallback((id: string, patch: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }, []);

  const requestReply = useCallback(
    async (loadingId: string, payload: WebhookPayload): Promise<void> => {
      try {
        const data = await sendToWebhook(payload);
        const replyText =
          data.reply || data.response || 'Пустой ответ от сервера';
        patchMessage(loadingId, { message: replyText });
      } catch (error) {
        console.error('Webhook error:', error);
        const message = isTimeoutError(error)
          ? 'Сервер не ответил вовремя. Попробуйте ещё раз.'
          : `Ошибка: ${
              error instanceof Error ? error.message : String(error)
            }. Проверьте, что workflow в n8n активен и CORS настроен.`;
        patchMessage(loadingId, { message });
      }
    },
    [patchMessage]
  );

  const handleInputChange = useCallback(
    (text: string) => {
      setInputValue(text);
      if (pendingImage && text === '') {
        setPendingImage(null);
      }
    },
    [pendingImage]
  );

  const handleSend = useCallback(async (): Promise<void> => {
    const caption =
      inputValue === PENDING_IMAGE_PLACEHOLDER || inputValue === ''
        ? ''
        : inputValue;
    const imageToSend = pendingImage;

    if (!caption && !imageToSend) return;

    addMessage(
      makeMessage({
        message: caption,
        sender: 'user',
        direction: 'outgoing',
        ...(imageToSend && { image: imageToSend }),
      })
    );

    setInputValue('');
    if (imageToSend) {
      setPendingImage(null);
    }

    const loadingMessage = makeMessage({ message: '…' });
    addMessage(loadingMessage);

    const payload: WebhookPayload = imageToSend
      ? {
          message: caption,
          image: imageToSend.slice(imageToSend.indexOf(',') + 1),
          imageMimeType: 'image/jpeg',
        }
      : { message: caption };

    await requestReply(loadingMessage.id, payload);
  }, [inputValue, pendingImage, addMessage, requestReply]);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        addMessage(
          makeMessage({ message: 'Можно прикреплять только изображения.' })
        );
        return;
      }

      let imageDataUrl: string;
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

  const handlePasteImage = useCallback((dataUrl: string) => {
    setPendingImage(dataUrl);
    setInputValue(PENDING_IMAGE_PLACEHOLDER);
  }, []);

  const handlePasteError = useCallback(() => {
    addMessage(
      makeMessage({ message: 'Не удалось обработать вставленное изображение.' })
    );
  }, [addMessage]);

  const canSend = Boolean(pendingImage) || inputValue.trim() !== '';

  return {
    messages,
    inputValue,
    sendDisabled: !canSend,
    handleInputChange,
    handleSend,
    handleFileChange,
    handlePasteImage,
    handlePasteError,
  };
}
