import { useEffect } from 'react';
import { fileToJpegDataUrl } from '../utils/image';

// Поддержка вставки изображения из буфера обмена.
// Текст вставляем без форматирования, чтобы шрифт оставался единообразным.
export function useClipboardPaste({ onImage, onError }) {
  useEffect(() => {
    const editor = document.querySelector('.cs-message-input__content-editor');
    if (!editor) return undefined;

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
              .then((dataUrl) => onImage(dataUrl))
              .catch((error) => {
                console.error('Clipboard image processing error:', error);
                onError();
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
  }, [onImage, onError]);
}
