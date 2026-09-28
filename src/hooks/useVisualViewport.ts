import { useEffect, useState } from 'react';

export interface Viewport {
  top: number;
  left: number;
  height: number;
  width: number;
}

// Возвращает актуальные размеры visual viewport (важно на iOS при открытии
// клавиатуры). Применяется через inline-стиль, без прямой записи в DOM.
function getViewport(): Viewport {
  const vv = window.visualViewport;
  return {
    top: vv ? vv.offsetTop : 0,
    left: vv ? vv.offsetLeft : 0,
    height: vv ? vv.height : window.innerHeight,
    width: vv ? vv.width : window.innerWidth,
  };
}

export function useVisualViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(getViewport);

  useEffect(() => {
    const update = () => setViewport(getViewport());

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
    }
    window.addEventListener('resize', update);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      }
      window.removeEventListener('resize', update);
    };
  }, []);

  return viewport;
}
