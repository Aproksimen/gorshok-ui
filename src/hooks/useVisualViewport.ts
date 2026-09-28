import { useEffect, useState } from 'react';

export interface Viewport {
  top: number;
  left: number;
  height: number;
  width: number;
  keyboardVisible: boolean;
}

// Порог, отличающий открытие клавиатуры (~300px) от показа/скрытия адресной
// строки Safari (~50–90px). Используется для определения keyboardVisible.
const KEYBOARD_THRESHOLD_PX = 150;

// Возвращает актуальные размеры visual viewport (важно на iOS при открытии
// клавиатуры). Применяется через inline-стиль, без прямой записи в DOM.
function getViewport(): Viewport {
  const vv = window.visualViewport;
  return {
    top: vv ? vv.offsetTop : 0,
    left: vv ? vv.offsetLeft : 0,
    height: vv ? vv.height : window.innerHeight,
    width: vv ? vv.width : window.innerWidth,
    // Клавиатура открыта, когда визуальный вьюпорт заметно сжался относительно
    // layout-вьюпорта: на iOS layout-вьюпорт (window.innerHeight) при открытии
    // клавиатуры не меняется, а visualViewport.height уменьшается.
    keyboardVisible: vv ? window.innerHeight - vv.height > KEYBOARD_THRESHOLD_PX : false,
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
