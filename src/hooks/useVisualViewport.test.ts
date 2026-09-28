import { afterEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useVisualViewport } from './useVisualViewport';

type Listener = () => void;

function makeVisualViewport() {
  const listeners: Record<string, Listener> = {};
  const viewport = {
    offsetTop: 10,
    offsetLeft: 5,
    height: 600,
    width: 400,
    addEventListener: (type: string, fn: Listener) => {
      listeners[type] = fn;
    },
    removeEventListener: () => {},
  };
  return { viewport, listeners };
}

function defineVisualViewport(value: unknown) {
  Object.defineProperty(window, 'visualViewport', { value, configurable: true });
}

afterEach(() => {
  const w = window as unknown as Record<string, unknown>;
  delete w.visualViewport;
  delete w.innerHeight;
});

describe('useVisualViewport', () => {
  it('falls back to window dimensions when visualViewport is absent', () => {
    defineVisualViewport(undefined);

    const { result } = renderHook(() => useVisualViewport());

    expect(result.current).toEqual({
      top: 0,
      left: 0,
      height: window.innerHeight,
      width: window.innerWidth,
    });
  });

  it('reads offsets and size from visualViewport', () => {
    const { viewport } = makeVisualViewport();
    defineVisualViewport(viewport);

    const { result } = renderHook(() => useVisualViewport());

    expect(result.current).toEqual({ top: 10, left: 5, height: 600, width: 400 });
  });

  it('updates on visualViewport resize', () => {
    const { viewport, listeners } = makeVisualViewport();
    defineVisualViewport(viewport);

    const { result } = renderHook(() => useVisualViewport());

    act(() => {
      viewport.offsetTop = 99;
      viewport.height = 500;
      listeners['resize']?.();
    });

    expect(result.current).toEqual({ top: 99, left: 5, height: 500, width: 400 });
  });

  it('updates on window resize when visualViewport is absent', () => {
    defineVisualViewport(undefined);
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

    const { result } = renderHook(() => useVisualViewport());
    expect(result.current.height).toBe(800);

    act(() => {
      Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.height).toBe(900);
  });
});
