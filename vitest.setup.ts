import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Без vitest globals авто-очистка DOM от React Testing Library не запускается,
// поэтому очищаем вручную после каждого теста.
afterEach(() => {
  cleanup();
});
