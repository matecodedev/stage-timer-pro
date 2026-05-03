import { describe, expect, test, vi } from 'vitest';
import { applySequenceLoadResult } from './sequenceLoader.js';

describe('applySequenceLoadResult', () => {
  test('returns false when load result is missing', () => {
    const context = {
      timerInputsRef: { current: { warn: 5, neg: false } },
      setHours: vi.fn(),
      setMinutes: vi.fn(),
      setSeconds: vi.fn(),
      Countdown: vi.fn(),
      createColorThresholds: vi.fn(),
      createSequenceCountdown: vi.fn(),
      timerRef: { current: null },
      stateRef: { current: null },
      setState: vi.fn(),
      pushStageState: vi.fn(),
      sendTimerMessage: vi.fn(),
      messageTtlMs: 4000,
    };

    expect(applySequenceLoadResult({ loadResult: null, ...context })).toBe(false);
    expect(context.setHours).not.toHaveBeenCalled();
    expect(context.createSequenceCountdown).not.toHaveBeenCalled();
    expect(context.sendTimerMessage).not.toHaveBeenCalled();
  });

  test('applies timer inputs, countdown, state and message from load result', () => {
    const timerInputsRef = { current: { warn: 5, neg: false } };
    const timerRef = { current: null };
    const stateRef = { current: null };
    const countdown = { start: vi.fn() };
    const createSequenceCountdown = vi.fn(() => countdown);
    const pushStageState = vi.fn();
    const sendTimerMessage = vi.fn();

    const loadResult = {
      timer: {
        id: 1,
        name: 'Intro',
        hours: 0,
        minutes: 5,
        seconds: 0,
        totalMs: 300000,
      },
      nextInputs: {
        hours: 0,
        minutes: 5,
        seconds: 0,
        warn: 5,
        neg: false,
      },
      nextState: {
        running: false,
        remainingMs: 300000,
        color: 'green',
      },
      messageText: 'Intro',
    };

    expect(
      applySequenceLoadResult({
        loadResult,
        timerInputsRef,
        setHours: vi.fn(),
        setMinutes: vi.fn(),
        setSeconds: vi.fn(),
        Countdown: vi.fn(),
        createColorThresholds: vi.fn(),
        createSequenceCountdown,
        timerRef,
        stateRef,
        setState: vi.fn(),
        pushStageState,
        sendTimerMessage,
        messageTtlMs: 4000,
      }),
    ).toBe(true);

    expect(timerInputsRef.current).toEqual(loadResult.nextInputs);
    expect(createSequenceCountdown).toHaveBeenCalledWith({
      Countdown: expect.any(Function),
      createColorThresholds: expect.any(Function),
      timer: loadResult.timer,
      inputs: loadResult.nextInputs,
    });
    expect(timerRef.current).toBe(countdown);
    expect(stateRef.current).toEqual(loadResult.nextState);
    expect(pushStageState).toHaveBeenCalledTimes(1);
    expect(sendTimerMessage).toHaveBeenCalledWith('Intro', 4000);
  });
});
