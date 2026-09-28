# Plan: P0 — Декомпозиция App.jsx

Дата: 2026-09-28
Ветка: refactor/p0-decompose-app
Тип: рефакторинг без изменения видимого поведения.

## Цель

1. Разбить god-компонент `src/App.jsx` (457 строк) на модули с одной ответственностью.
2. Убрать дублирование сетевой логики (`handleSend` vs `handleFileChange`).
3. Вынести `WEBHOOK_URL` в переменную окружения.
4. Добавить таймаут/отмену fetch (AbortController).

Поведение UI сохраняется. Явные изменения поведения (только связанные с P0):
- таймаут запроса 30s → при зависшем сервере показываем «Сервер не ответил вовремя».
- удалён мёртвый код `fileInputRef` (нигде не читается).
- id сообщений-заглушек: `Date.now()` → `crypto.randomUUID()`.

## Итоговая структура

```
src/
  App.jsx                      # композиция
  constants.js                 # бренд-константы, SENT_TIME, лимиты
  utils/image.js               # loadImage, getResizedDimensions, fileToJpegDataUrl
  api/webhook.js               # sendToWebhook + таймаут, URL из env
  hooks/
    useVisualViewport.js       # --vv-* переменные + preventBodyScroll
    useChat.js                 # messages/inputValue/pendingImage + send/attach
    useClipboardPaste.js       # вставка текста/картинки из буфера
  components/
    ChatHeader.jsx             # ConversationHeader
    MessageList.jsx            # MessageList + map сообщений
    ChatInput.jsx              # MessageInput (+ файловый input)
.env.example                   # VITE_WEBHOOK_URL
.env                          # локальная копия (gitignored)
```

## Контракты (сигнатуры)

```js
// utils/image.js
export function loadImage(src): Promise<HTMLImageElement>
export function getResizedDimensions(width, height, maxDim): { width, height }
export async function fileToJpegDataUrl(file): Promise<string> // dataURL

// api/webhook.js
export const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;
export async function sendToWebhook(payload, { timeoutMs = 30000 } = {}): Promise<object>
export function isTimeoutError(error): boolean // error.name === 'AbortError'

// hooks/useChat.js
export function useChat() {
  return {
    messages, inputValue, pendingImage,
    setInputValue, setPendingImage,
    handleSend, handleFileChange,
    handlePasteImage,      // (dataUrl) => setPendingImage + placeholder
    handlePasteError,      // () => добавить сообщение об ошибке
    sendDisabled,          // pendingImage ? false : undefined
  };
}

// hooks/useClipboardPaste.js
export function useClipboardPaste({ onImage, onError }): void

// hooks/useVisualViewport.js
export function useVisualViewport(): void
```

## Задачи (каждая — отдельный коммит)

### Задача 1. Изоляция + базовый замер
- Ветка `refactor/p0-decompose-app` создана.
- Базовый замер: `npm run lint` (0 ошибок), `npm run build` (exit 0).

### Задача 2. `src/constants.js`
- Вынести константы из `App.jsx` (FILE_INPUT_ID, BRAND_*, SENT_TIME, MAX_IMAGE_DIMENSION, JPEG_QUALITY, PENDING_IMAGE_PLACEHOLDER).
- Обновить импорты в `App.jsx`.
- Верификация: lint + build.

### Задача 3. `src/utils/image.js`
- Перенести `loadImage`, `getResizedDimensions`, `fileToJpegDataUrl` как есть.
- Верификация: lint + build.

### Задача 4. `src/api/webhook.js` + env + таймаут
- `sendToWebhook(payload, { timeoutMs })` с AbortController.
- `WEBHOOK_URL` из `import.meta.env.VITE_WEBHOOK_URL`.
- `.env.example` + `.env` (локально, gitignored) + добавить `.env` в `.gitignore`.
- Верификация: lint + build.

### Задача 5. `src/hooks/*`
- `useVisualViewport` — перенос эффекта (77–125) без изменений.
- `useChat` — состояние + `handleSend`/`handleFileChange` через общий `requestReply` (убирает дублирование), `patchMessage`, `addMessage`.
- `useClipboardPaste` — перенос paste-эффекта, использует `onImage`/`onError`.
- Верификация: lint + build.

### Задача 6. `src/components/*`
- `ChatHeader`, `MessageList`, `ChatInput` — перенос JSX без изменений.
- Файловый `<input>` остаётся прямым потомком `MainContainer` (как в оригинале), чтобы не менять позиционирование `.file-input`.
- Верификация: lint + build.

### Задача 7. `src/App.jsx` — композиция
- App собирает: `useVisualViewport` + `useChat` + `useClipboardPaste` + компоненты.
- Верификация: lint + build.

### Задача 8. Финальная верификация
- `npm run lint` — 0 ошибок.
- `npm run build` — exit 0.
- `npm run dev` — сервер стартует, ручная проверка пользователем.
- `git diff main..HEAD` — обзор изменений.

## Решения (ledger)

- Ruling: не добавляю тест-фреймворк (нет тестов/раннера в проекте; это P2). «Тестируем» = lint + build + dev-сервер.
- Ruling: ветка вместо worktree — пользователь хочет запускать локально в той же папке.
- Ruling: `fileInputRef` удалён как мёртвый код (нигде не читается).
- Ruling: id заглушек → `crypto.randomUUID()` (безопаснее `Date.now()`).
- Ruling: таймаут добавляет новое сообщение об ошибке для `AbortError` (обязательная часть P0 #4).
