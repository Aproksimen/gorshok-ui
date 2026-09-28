# Plan: P2 — Тесты (Vitest) + доступность, таймстемпы, чистка

Дата: 2026-09-28
Ветка: refactor/p2-tests-and-ux (от refactor/p1-replace-chatscope)
Тип: регрессионные тесты + UX-доработки (доступность, таймстемпы, чистка).

## Цель

1. Покрыть регрессионными тестами `utils/`, `api/`, `hooks/` (Vitest + React Testing Library).
2. Реальные таймстемпы сообщений вместо жёстко зашитого `«Только что»`.
3. Доступность: `aria-*`, `role="log"`, видимый фокус (`:focus-visible`), доступный file-upload.
4. Чистка неиспользуемых ассетов (`src/assets/*`, `public/icons.svg`).

## Итоговая структура (после P2)

```
src/
  utils/
    image.ts / image.test.ts
    time.ts / time.test.ts        # formatTime — новый
  api/
    webhook.ts / webhook.test.ts
  hooks/
    useChat.ts / useChat.test.ts
    useClipboardPaste.ts / useClipboardPaste.test.ts
    useVisualViewport.ts / useVisualViewport.test.ts
  components/
    ChatHeader.tsx
    MessageList.tsx / MessageList.test.tsx
    MessageItem.tsx / MessageItem.test.tsx
    ChatInput.tsx / ChatInput.test.tsx
vitest.config.ts
```

## Задачи (каждая — отдельный коммит)

### Задача 1. Vitest + тесты utils/api/hooks
- `npm i -D vitest jsdom @testing-library/react @testing-library/dom`.
- `vitest.config.ts`: `environment: 'jsdom'`, `include: ['src/**/*.test.{ts,tsx}']`, `@vitejs/plugin-react`.
- `package.json`: scripts `test` (`vitest run`), `test:watch` (`vitest`).
- Тесты (characterization — для существующего кода):
  - `utils/image.test.ts` — `getResizedDimensions`, `loadImage`, `fileToJpegDataUrl` (моки Image/canvas/URL).
  - `api/webhook.test.ts` — `isTimeoutError`, `sendToWebhook` (мок fetch: ok/HTTP-ошибка/таймаут/нет URL).
  - `hooks/useChat.test.ts` — начальное состояние, ввод, отправка текста, вставка, файл, ошибки (мок webhook+image).
  - `hooks/useClipboardPaste.test.ts` — картинка/текст/без clipboard (мок image).
  - `hooks/useVisualViewport.test.ts` — с/без `visualViewport`, апдейт по resize.
- Верификация: `npm test` + `npm run typecheck` + `npm run build`.

### Задача 2. Реальные таймстемпы
- `utils/time.ts` → `formatTime(date, now?)` (TDD: сначала тест).
  - `< 1 мин` → `Только что`; `< 1 ч` → `N мин`; иначе `HH:MM` (ru-RU).
- `utils/time.test.ts`.
- `constants.ts`: удалить `SENT_TIME`, добавить `LOADING_TEXT = '…'`.
- `useChat.ts`: `sentTime: formatTime(new Date())`; сообщение-заглушка = `LOADING_TEXT`.
- Верификация: `npm test` + `npm run build`.

### Задача 3. Доступность
- `ChatInput.tsx`: textarea `aria-label="Сообщение"`; file input `tabIndex={-1}`; label `tabIndex={0}` + `role="button"`.
- `MessageList.tsx`: `<main aria-label="Сообщения">`; scroll-контейнер `role="log"` + `aria-live="polite"` + `aria-relevant="additions"`.
- `MessageItem.tsx`: заглушка `…` → `role="status"` + `aria-label="Ассистент печатает"`.
- `App.css`: `:focus-visible` для attach/send/editor.
- Компонентные тесты `components/*.test.tsx` (TDD: сначала RED) для a11y-атрибутов.
- Верификация: `npm test` + `npm run build` + headless-рендер (атрибуты в DOM).

### Задача 4. Чистка ассетов
- Удалить `src/assets/{hero.png, react.svg, vite.svg, icons/}` (весь каталог не используется).
- Удалить `public/icons.svg` (нет ссылок).
- Верификация: `npm run build` + headless-рендер.

## Решения (ledger)

- Без `@testing-library/jest-dom`/`user-event`: достаточно `getBy*`/`queryBy*` + `renderHook`.
- Типы vitest импортируются явно (`import { describe, it, expect, vi } from 'vitest'`),
  без `globals`, чтобы не трогать `tsconfig` `types`.
- Компонентные тесты — только для a11y-изменений (role/label/status), не полный UI-тест.
- `reac-ui/` (черновой референс дизайна) не трогаем — вне scope чистки `public/`+`src/assets/`.
