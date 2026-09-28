import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fileToJpegDataUrl, getResizedDimensions, loadImage } from './image';

const OriginalImage = globalThis.Image;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  globalThis.Image = OriginalImage;
});

describe('getResizedDimensions', () => {
  it('keeps dimensions when both sides fit within the max', () => {
    expect(getResizedDimensions(100, 200, 500)).toEqual({ width: 100, height: 200 });
  });

  it('keeps dimensions when exactly at the max', () => {
    expect(getResizedDimensions(500, 500, 500)).toEqual({ width: 500, height: 500 });
  });

  it('scales down a landscape image to the max width', () => {
    expect(getResizedDimensions(4000, 2000, 1000)).toEqual({ width: 1000, height: 500 });
  });

  it('scales down a portrait image to the max height', () => {
    expect(getResizedDimensions(1000, 4000, 1000)).toEqual({ width: 250, height: 1000 });
  });

  it('scales down a square image to the max side', () => {
    expect(getResizedDimensions(3000, 3000, 1000)).toEqual({ width: 1000, height: 1000 });
  });

  it('rounds fractional dimensions to integers', () => {
    expect(getResizedDimensions(1000, 333, 500)).toEqual({ width: 500, height: 167 });
  });
});

describe('loadImage', () => {
  class MockImage {
    onload: (() => void) | null = null;
    onerror: ((error: unknown) => void) | null = null;
    src = '';
  }

  let created: MockImage[] = [];

  beforeEach(() => {
    created = [];
    globalThis.Image = class extends MockImage {
      constructor() {
        super();
        created.push(this);
      }
    } as unknown as typeof Image;
  });

  it('resolves with the loaded image', async () => {
    const promise = loadImage('blob:test');
    expect(created).toHaveLength(1);
    created[0].onload?.();
    await expect(promise).resolves.toBe(created[0]);
  });

  it('rejects when loading fails', async () => {
    const promise = loadImage('blob:test');
    created[0].onerror?.(new Error('load failed'));
    await expect(promise).rejects.toThrow('load failed');
  });
});

describe('fileToJpegDataUrl', () => {
  const createObjectURL = vi.fn(() => 'blob:mock');
  const revokeObjectURL = vi.fn();
  const drawImage = vi.fn();
  const toDataURL = vi.fn(() => 'data:image/jpeg;base64,AAAA');
  const getContext = vi.fn<() => { drawImage: typeof drawImage } | null>(() => ({ drawImage }));
  const canvas = { width: 0, height: 0, getContext, toDataURL };

  class MockImage {
    naturalWidth = 4000;
    naturalHeight = 2000;
    onload: (() => void) | null = null;
    onerror: null = null;
    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }

  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    globalThis.Image = MockImage as unknown as typeof Image;
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') return canvas as unknown as HTMLElement;
      return originalCreateElement(tagName);
    });
  });

  it('resizes and encodes a file to a JPEG data URL', async () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const result = await fileToJpegDataUrl(file);

    expect(result).toBe('data:image/jpeg;base64,AAAA');
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(960);
    expect(getContext).toHaveBeenCalledWith('2d');
    expect(drawImage).toHaveBeenCalled();
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.92);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });

  it('rejects when the 2D context is unavailable', async () => {
    getContext.mockReturnValueOnce(null);
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    await expect(fileToJpegDataUrl(file)).rejects.toThrow(
      'Canvas 2D context is not available'
    );
  });
});
