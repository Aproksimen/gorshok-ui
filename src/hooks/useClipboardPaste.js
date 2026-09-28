import { useCallback } from 'react';
import { fileToJpegDataUrl } from '../utils/image';

// Возвращает onPaste-обработчик для поля ввода.
// Перехватываем только картинки; текст браузер вставит сам (textarea принимает
// только plain text, форматирование отбрасывается автоматически).
export function useClipboardPaste({ onImage, onError }) {
  return useCallback(
    (event) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      if (!items) return;

      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          event.preventDefault();
          const file = item.getAsFile();
          if (!file) return;

          fileToJpegDataUrl(file)
            .then((dataUrl) => onImage(dataUrl))
            .catch((error) => {
              console.error('Clipboard image processing error:', error);
              onError();
            });
          return;
        }
      }
    },
    [onImage, onError]
  );
}
