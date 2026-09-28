import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ClipboardEvent } from 'react';
import { useClipboardPaste } from './useClipboardPaste';

const mocks = vi.hoisted(() => ({
  fileToJpegDataUrl: vi.fn(),
}));

vi.mock('../utils/image', () => ({
  fileToJpegDataUrl: mocks.fileToJpegDataUrl,
}));

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  mocks.fileToJpegDataUrl.mockReset();
});

function pasteEvent(
  items: { kind: string; type: string; getAsFile: () => File | null }[] | null
): ClipboardEvent<HTMLTextAreaElement> {
  const clipboardData = items ? { items: items as unknown as DataTransferItem[] } : null;
  return { clipboardData, preventDefault: vi.fn() } as unknown as ClipboardEvent<HTMLTextAreaElement>;
}

describe('useClipboardPaste', () => {
  it('processes an image file from the clipboard', async () => {
    mocks.fileToJpegDataUrl.mockResolvedValue('data:image/jpeg;base64,AAAA');
    const onImage = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useClipboardPaste({ onImage, onError }));

    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const event = pasteEvent([{ kind: 'file', type: 'image/png', getAsFile: () => file }]);

    act(() => {
      result.current(event);
    });

    await waitFor(() => expect(onImage).toHaveBeenCalledWith('data:image/jpeg;base64,AAAA'));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mocks.fileToJpegDataUrl).toHaveBeenCalledWith(file);
    expect(onError).not.toHaveBeenCalled();
  });

  it('ignores non-image items', () => {
    const onImage = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useClipboardPaste({ onImage, onError }));

    const event = pasteEvent([{ kind: 'string', type: 'text/plain', getAsFile: () => null }]);

    act(() => {
      result.current(event);
    });

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(onImage).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('does nothing without clipboard data', () => {
    const onImage = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useClipboardPaste({ onImage, onError }));

    const event = pasteEvent(null);

    act(() => {
      result.current(event);
    });

    expect(onImage).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onError when image processing fails', async () => {
    mocks.fileToJpegDataUrl.mockRejectedValue(new Error('boom'));
    const onImage = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useClipboardPaste({ onImage, onError }));

    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const event = pasteEvent([{ kind: 'file', type: 'image/png', getAsFile: () => file }]);

    act(() => {
      result.current(event);
    });

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onImage).not.toHaveBeenCalled();
  });
});
