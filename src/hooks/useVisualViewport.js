import { useEffect } from 'react';

// Держит CSS-переменные --vv-* в актуальном состоянии, чтобы интерфейс
// «приклеивался» к visual viewport (важно на iOS при открытии клавиатуры).
export function useVisualViewport() {
  useEffect(() => {
    const updateViewport = () => {
      const vv = window.visualViewport;
      if (vv) {
        document.documentElement.style.setProperty(
          '--vv-height',
          `${vv.height}px`
        );
        document.documentElement.style.setProperty(
          '--vv-width',
          `${vv.width}px`
        );
        document.documentElement.style.setProperty(
          '--vv-top',
          `${vv.offsetTop}px`
        );
        document.documentElement.style.setProperty(
          '--vv-left',
          `${vv.offsetLeft}px`
        );
      }
    };

    // Prevent iOS from scrolling the whole document when the keyboard opens;
    // keep the document pinned to the top-left of the layout viewport.
    const preventBodyScroll = () => {
      window.scrollTo(0, 0);
    };

    updateViewport();
    preventBodyScroll();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', updateViewport);
      vv.addEventListener('scroll', updateViewport);
    }
    window.addEventListener('resize', updateViewport);
    window.addEventListener('scroll', preventBodyScroll, { passive: true });

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateViewport);
        vv.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('scroll', preventBodyScroll);
    };
  }, []);
}
