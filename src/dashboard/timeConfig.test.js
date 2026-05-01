import { describe, expect, test } from 'vitest';
import {
  calculateTotalMs,
  createColorThresholds,
  createTimeConfig,
  formatDashboardTime,
} from './timeConfig.js';

const inputs = {
  hours: 1,
  minutes: 2,
  seconds: 3,
  warn: 5,
  neg: false,
  colorThresholds: { critical: 2, warning: 5, caution: 10, good: 25 },
  enableAdvancedColors: true,
};

describe('dashboard time config helpers', () => {
  test('calculates total milliseconds from hour minute second inputs', () => {
    expect(calculateTotalMs({ hours: 1, minutes: 2, seconds: 3 })).toBe(3_723_000);
  });

  test('creates a stable current time config payload', () => {
    expect(
      createTimeConfig({
        showCurrentTime: false,
        timeFormat24h: false,
        showSeconds: false,
        timePosition: 'bottom-left',
      }),
    ).toEqual({
      showCurrentTime: false,
      timeFormat24h: false,
      showSeconds: false,
      timePosition: 'bottom-left',
    });
  });

  test('converts advanced color thresholds to timer units', () => {
    expect(createColorThresholds(inputs)).toEqual({
      critical: 120_000,
      warning: 300_000,
      caution: 600_000,
      good: 0.25,
    });
  });

  test('returns null thresholds when advanced colors are disabled', () => {
    expect(
      createColorThresholds(Object.assign({}, inputs, { enableAdvancedColors: false })),
    ).toBeNull();
  });

  test('formats dashboard duration with hours minutes and seconds', () => {
    expect(formatDashboardTime(3_723_000)).toBe('01:02:03');
    expect(formatDashboardTime(0)).toBe('00:00:00');
    expect(formatDashboardTime(-1)).toBe('00:00:00');
  });
});
