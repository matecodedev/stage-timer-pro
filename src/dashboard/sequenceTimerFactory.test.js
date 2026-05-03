import { describe, expect, it, vi } from 'vitest';
import { createSequenceCountdown } from './sequenceTimerFactory.js';

describe('createSequenceCountdown', () => {
  it('creates a countdown configured from a sequence timer and dashboard inputs', () => {
    const Countdown = vi.fn();
    const colorThresholds = { critical: 2, warning: 5 };
    const createColorThresholds = vi.fn(() => colorThresholds);

    createSequenceCountdown({
      Countdown,
      createColorThresholds,
      timer: { totalMs: 120000 },
      inputs: { warn: 3, neg: true },
    });

    expect(createColorThresholds).toHaveBeenCalledWith({ warn: 3, neg: true });
    expect(Countdown).toHaveBeenCalledWith({
      initialMs: 120000,
      warnMs: 180000,
      negativeMode: true,
      colorThresholds,
    });
  });
});
