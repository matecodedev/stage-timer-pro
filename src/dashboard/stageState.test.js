import { describe, expect, test } from 'vitest';
import { createDashboardStageStatePayload } from './stageState.js';

describe('dashboard stage state helper', () => {
  test('creates the full stage state payload from timer inputs and sequence state', () => {
    const timer = {
      remainingMs: 20_000,
      running: true,
      warnMs: 300_000,
      negativeMode: false,
      color: () => 'warning',
      getColorInfo: () => ({ state: 'warning' }),
    };

    expect(
      createDashboardStageStatePayload({
        timer,
        timerInputs: { hours: 0, minutes: 1, seconds: 0 },
        sequence: {
          sequenceMode: true,
          currentSequenceIndex: 1,
          timerSequence: [{ name: 'Talk 1' }, { name: 'Talk 2' }],
        },
        timeConfig: { showCurrentTime: true, timePosition: 'top-right' },
      }),
    ).toEqual({
      remainingMs: 20_000,
      running: true,
      warnMs: 300_000,
      negativeMode: false,
      color: 'warning',
      colorInfo: { state: 'warning' },
      totalMs: 60_000,
      sequenceMode: true,
      currentSequenceIndex: 1,
      totalSequenceTimers: 2,
      currentTimerName: 'Talk 2',
      timeConfig: { showCurrentTime: true, timePosition: 'top-right' },
    });
  });

  test('uses null current timer name when sequence mode is disabled', () => {
    const timer = {
      remainingMs: 60_000,
      running: false,
      warnMs: 300_000,
      negativeMode: false,
      color: () => 'green',
      getColorInfo: () => ({ state: 'green' }),
    };

    const payload = createDashboardStageStatePayload({
      timer,
      timerInputs: { hours: 0, minutes: 1, seconds: 0 },
      sequence: {
        sequenceMode: false,
        currentSequenceIndex: 0,
        timerSequence: [{ name: 'Talk 1' }],
      },
      timeConfig: { showCurrentTime: false },
    });

    expect(payload.currentTimerName).toBeNull();
    expect(payload.totalSequenceTimers).toBe(1);
  });
});
