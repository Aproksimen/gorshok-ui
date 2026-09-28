import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatInput from './ChatInput';

const noop = () => {};

function renderInput() {
  return render(
    <ChatInput
      value=""
      onInputChange={noop}
      onSend={noop}
      onAttach={noop}
      onPaste={noop}
      sendDisabled
    />
  );
}

describe('ChatInput', () => {
  it('labels the message editor', () => {
    renderInput();
    expect(screen.getByRole('textbox').getAttribute('aria-label')).toBe('Сообщение');
  });

  it('makes the attach control focusable and removes the hidden input from tab order', () => {
    const { container } = renderInput();

    const attach = container.querySelector('.chat-input__attach');
    expect(attach?.getAttribute('role')).toBe('button');
    expect(attach?.getAttribute('tabindex')).toBe('0');

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput?.getAttribute('tabindex')).toBe('-1');
  });
});
