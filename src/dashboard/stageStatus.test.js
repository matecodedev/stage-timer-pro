import { describe, expect, test } from 'vitest';
import { getStageStatusViewModel } from './stageStatus.js';

describe('stage status view model', () => {
  test('returns opening state with loading label', () => {
    expect(getStageStatusViewModel('opening')).toEqual({
      isOpening: true,
      statusText: 'Abriendo y posicionando Stage...',
      statusClassName: 'text-xs text-emerald-500 dark:text-emerald-400',
      openButtonLabel: '⏳ Abriendo Stage...',
    });
  });

  test('returns error state with error styling', () => {
    expect(getStageStatusViewModel('error')).toEqual({
      isOpening: false,
      statusText: 'No se pudo abrir Stage. Reintentá.',
      statusClassName: 'text-xs text-red-500 dark:text-red-400',
      openButtonLabel: '🖥️ Abrir Stage Fullscreen',
    });
  });

  test('returns idle fallback for unknown states', () => {
    expect(getStageStatusViewModel('whatever')).toEqual({
      isOpening: false,
      statusText: null,
      statusClassName: 'text-xs text-emerald-500 dark:text-emerald-400',
      openButtonLabel: '🖥️ Abrir Stage Fullscreen',
    });
  });
});
