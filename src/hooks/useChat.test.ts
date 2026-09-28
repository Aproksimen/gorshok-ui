import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import { PENDING_IMAGE_PLACEHOLDER } from '../constants';
import { useChat } from './useChat';

const mocks = vi.hoisted(() => ({
  sendToWebhook: vi.fn(),
  fileToJpegDataUrl: vi.fn(),
}));

vi.mock('../api/webhook', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/webhook')>();
  return { ...actual, sendToWebhook: mocks.sendToWebhook };
});

vi.mock('../utils/image', () => ({
  fileToJpegDataUrl: mocks.fileToJpegDataUrl,
}));

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  mocks.sendToWebhook.mockReset();
  mocks.fileToJpegDataUrl.mockReset();
});

function fileEvent(file: File): ChangeEvent<HTMLInputElement> {
  return { target: { files: [file], value: '' } } as unknown as ChangeEvent<HTMLInputElement>;
}

describe('useChat', () => {
  it('starts with a greeting, empty input and send disabled', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].message).toContain('Здравствуйте');
    expect(result.current.inputValue).toBe('');
    expect(result.current.sendDisabled).toBe(true);
  });

  it('updates input value and enables send', () => {
    const { result } = renderHook(() => useChat());

    act(() => result.current.handleInputChange('привет'));

    expect(result.current.inputValue).toBe('привет');
    expect(result.current.sendDisabled).toBe(false);
  });

  it('does nothing when there is nothing to send', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.handleSend();
    });

    expect(result.current.messages).toHaveLength(1);
    expect(mocks.sendToWebhook).not.toHaveBeenCalled();
  });

  it('sends text, appends the user message and patches the reply', async () => {
    mocks.sendToWebhook.mockResolvedValue({ reply: 'Ответ бота' });
    const { result } = renderHook(() => useChat());

    act(() => result.current.handleInputChange('подбери компрессор'));
    await act(async () => {
      await result.current.handleSend();
    });

    const { messages } = result.current;
    expect(messages).toHaveLength(3);
    expect(messages[1].sender).toBe('user');
    expect(messages[1].direction).toBe('outgoing');
    expect(messages[1].message).toBe('подбери компрессор');
    expect(messages[2].sender).toBe('assistant');
    expect(messages[2].message).toBe('Ответ бота');
    expect(result.current.inputValue).toBe('');
    expect(mocks.sendToWebhook).toHaveBeenCalledWith({ message: 'подбери компрессор' });
  });

  it('shows a timeout message when the request aborts', async () => {
    mocks.sendToWebhook.mockRejectedValue(
      Object.assign(new Error('aborted'), { name: 'AbortError' })
    );
    const { result } = renderHook(() => useChat());

    act(() => result.current.handleInputChange('hi'));
    await act(async () => {
      await result.current.handleSend();
    });

    expect(result.current.messages[2].message).toContain('Сервер не ответил вовремя');
  });

  it('shows a generic error message when the request fails', async () => {
    mocks.sendToWebhook.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useChat());

    act(() => result.current.handleInputChange('hi'));
    await act(async () => {
      await result.current.handleSend();
    });

    expect(result.current.messages[2].message).toContain('Ошибка: boom');
  });

  it('sets the pending image placeholder on paste', () => {
    const { result } = renderHook(() => useChat());

    act(() => result.current.handlePasteImage('data:image/jpeg;base64,AAAA'));

    expect(result.current.inputValue).toBe(PENDING_IMAGE_PLACEHOLDER);
    expect(result.current.sendDisabled).toBe(false);
  });

  it('appends an error message on paste error', () => {
    const { result } = renderHook(() => useChat());

    act(() => result.current.handlePasteError());

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].message).toContain(
      'Не удалось обработать вставленное изображение'
    );
  });

  it('attaches an image and sends it to the webhook', async () => {
    mocks.fileToJpegDataUrl.mockResolvedValue('data:image/jpeg;base64,AAAA');
    mocks.sendToWebhook.mockResolvedValue({ reply: 'ok' });
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.handleFileChange(fileEvent(new File(['x'], 'a.png', { type: 'image/png' })));
    });

    expect(mocks.fileToJpegDataUrl).toHaveBeenCalledTimes(1);
    expect(mocks.sendToWebhook).toHaveBeenCalledWith({
      message: '',
      image: 'AAAA',
      imageMimeType: 'image/jpeg',
    });
    const { messages } = result.current;
    expect(messages).toHaveLength(3);
    expect(messages[1].sender).toBe('user');
    expect(messages[1].image).toBe('data:image/jpeg;base64,AAAA');
  });

  it('rejects non-image files with a message', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.handleFileChange(fileEvent(new File(['x'], 'a.txt', { type: 'text/plain' })));
    });

    expect(mocks.fileToJpegDataUrl).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].message).toContain('только изображения');
  });

  it('shows an error when image processing fails', async () => {
    mocks.fileToJpegDataUrl.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.handleFileChange(fileEvent(new File(['x'], 'a.png', { type: 'image/png' })));
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].message).toContain('Не удалось обработать изображение');
  });
});
