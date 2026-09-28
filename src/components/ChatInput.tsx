import { useEffect, useRef } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import { FILE_INPUT_ID } from '../constants';

interface ChatInputProps {
  value: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onAttach: (event: ChangeEvent<HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  sendDisabled: boolean;
}

export default function ChatInput({
  value,
  onInputChange,
  onSend,
  onAttach,
  onPaste,
  sendDisabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Авторастягивание поля под содержимое (с ограничением max-height в CSS).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!sendDisabled) {
        onSend();
      }
    }
  };

  const handleAttachKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <footer className="chat-input">
      <div className="chat-input__pill">
        <label
          className="chat-input__attach"
          htmlFor={FILE_INPUT_ID}
          role="button"
          tabIndex={0}
          aria-label="Прикрепить файл"
          onKeyDown={handleAttachKeyDown}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
              d="M7.9175 17.8068L15.8084 10.2535C16.7558 9.34668 16.7558 7.87637 15.8084 6.96951C14.861 6.06265 13.325 6.06265 12.3776 6.96951L4.54387 14.4681C2.74382 16.1911 2.74382 18.9847 4.54387 20.7077C6.34391 22.4308 9.26237 22.4308 11.0624 20.7077L19.0105 13.0997C21.6632 10.5605 21.6632 6.44362 19.0105 3.90441C16.3578 1.3652 12.0569 1.3652 9.40419 3.90441L3 10.0346"
            />
          </svg>
        </label>
        <input
          ref={inputRef}
          id={FILE_INPUT_ID}
          type="file"
          accept="image/*"
          className="chat-input__file"
          onChange={onAttach}
          tabIndex={-1}
        />
        <textarea
          ref={textareaRef}
          className="chat-input__editor"
          aria-label="Сообщение"
          value={value}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
          placeholder="Введите ваш запрос..."
          rows={1}
        />
        <button
          type="button"
          className="chat-input__send"
          onClick={onSend}
          disabled={sendDisabled}
          aria-label="Отправить"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M20.3521 10.5208L18.6357 15.6701C17.4255 19.3008 16.8204 21.1161 15.933 21.6319C15.0889 22.1227 14.0463 22.1227 13.2022 21.6319C12.3148 21.1161 11.7097 19.3008 10.4995 15.6701C10.3052 15.0872 10.208 14.7957 10.0449 14.5521C9.88687 14.316 9.68404 14.1131 9.44793 13.9551C9.2043 13.792 8.91282 13.6948 8.32987 13.5005C4.69923 12.2903 2.88392 11.6852 2.36806 10.7978C1.87731 9.95369 1.87731 8.91112 2.36806 8.06698C2.88392 7.17964 4.69923 6.57453 8.32987 5.36432L13.4792 3.64788C17.9776 2.14842 20.2268 1.39869 21.414 2.58595C22.6013 3.77322 21.8516 6.02242 20.3521 10.5208ZM13.0457 10.9022C12.7544 10.6077 12.7571 10.1328 13.0516 9.84153L17.2621 5.67742C17.5566 5.38615 18.0315 5.38878 18.3227 5.6833C18.614 5.97781 18.6114 6.45267 18.3169 6.74394L14.1063 10.9081C13.8118 11.1993 13.337 11.1967 13.0457 10.9022Z"
            />
          </svg>
        </button>
      </div>
    </footer>
  );
}
