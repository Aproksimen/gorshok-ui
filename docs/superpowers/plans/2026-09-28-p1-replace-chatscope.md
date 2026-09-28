# Plan: P1 — Отказ от @chatscope + идиоматичный React + TypeScript

Дата: 2026-09-28
Ветка: refactor/p1-replace-chatscope (от refactor/p0-decompose-app)
Тип: рефакторинг без изменения видимого поведения.

## Цель

1. Отказ от `@chatscope/chat-ui-kit-react` + `@chatscope/chat-ui-kit-styles`:
   собственные компоненты и чистый CSS без `!important`
   (−458 строк CSS, −лишние зависимости из бандла).
2. Убрать DOM-хаки: без `document.querySelector`, `document.execCommand`,
   парсинга `innerHTML`, невидимого `<input type="file">`-оверлея, записи
   CSS-переменных в `document.documentElement`. Всё — через идиоматичный React
   (состояние, refs, `onPaste`, `<label htmlFor>`).
3. TypeScript: `*.jsx → *.tsx`, `*.js → *.ts`, безопасность типов.

## Итоговая структура (после P1)

```
src/
  main.tsx
  App.tsx
  App.css                      # чистый CSS, без !important
  constants.ts
  utils/image.ts
  api/webhook.ts
  hooks/
    useChat.ts
    useVisualViewport.ts       # возвращает {top,left,width,height} как state
    useClipboardPaste.ts       # возвращает onPaste-обработчик
  components/
    ChatHeader.tsx
    MessageList.tsx
    MessageItem.tsx
    ChatInput.tsx
```

## Задачи (каждая — отдельный коммит)

### Задача 1. Удалить @chatscope
- `npm uninstall @chatscope/chat-ui-kit-react @chatscope/chat-ui-kit-styles`.

### Задача 2. Собственные компоненты + чистый CSS
- `components/ChatHeader`, `MessageList`, `MessageItem`, `ChatInput`.
- Переписать `App.css` без `!important` (дизайн-токены сохранены).
- `App.jsx` — композиция.
- Верификация: lint + build + headless-рендер (те же строки, новые классы).

### Задача 3. Убрать DOM-хаки
- `useClipboardPaste` → возвращает `onPaste` (без querySelector/execCommand).
- `useChat` → plain-text состояние (без innerHTML-парсинга).
- `useVisualViewport` → state + inline-стиль (без setProperty/scrollTo).
- File input → `<label htmlFor>` + скрытый input (без оверлея).
- Верификация: lint + build + headless-рендер.

### Задача 4. TypeScript
- Добавить `typescript` + `tsconfig`; `*.js(x) → *.ts(x)`; типы Message/Webhook/env.
- `build` = `tsc -b && vite build`.
- Верификация: lint + build + headless-рендер.

## Решения (ledger)

- Порядок: сначала отказ от chatscope + DOM-хаки (в JS), затем TS — чтобы не
  типизировать выбрасываемый kit-код дважды.
- Без Tailwind/@iconify: чистый CSS + inline-SVG (Solar) — чтобы не добавлять
  зависимости (цель −бандл).
- Иконки скрепки/отправки — inline SVG (currentColor), файлы icons/*.svg удалены.
