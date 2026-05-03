import { describe, expect, test, vi } from 'vitest';
import {
  applySequenceAdvanceResult,
  applySequenceJumpResult,
  applySequenceLoadResult,
} from './sequenceLoader.js';

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

describe('applySequenceAdvanceResult', () => {
  test('returns false when sequence step is missing', () => {
    const context = {
      sequenceRef: { current: null },
      setSequenceMode: vi.fn(),
      setCurrentSequenceIndex: vi.fn(),
      loadTimerFromSequence: vi.fn(),
      scheduleAutostart: vi.fn(),
      sendTimerMessage: vi.fn(),
      completedMessageTtlMs: 5000,
    };

    expect(applySequenceAdvanceResult({ sequenceStep: null, ...context })).toBe(false);
    expect(context.loadTimerFromSequence).not.toHaveBeenCalled();
    expect(context.sendTimerMessage).not.toHaveBeenCalled();
  });

  test('applies next sequence step and schedules autostart', () => {
    const sequenceRef = { current: null };
    const setCurrentSequenceIndex = vi.fn();
    const loadTimerFromSequence = vi.fn();
    const scheduleAutostart = vi.fn();

    expect(
      applySequenceAdvanceResult({
        sequenceStep: {
          type: 'next',
          nextIndex: 1,
          sequence: { currentSequenceIndex: 1, sequenceMode: true },
        },
        sequenceRef,
        setSequenceMode: vi.fn(),
        setCurrentSequenceIndex,
        loadTimerFromSequence,
        scheduleAutostart,
        sendTimerMessage: vi.fn(),
        completedMessageTtlMs: 5000,
      }),
    ).toBe(true);

    expect(sequenceRef.current).toEqual({ currentSequenceIndex: 1, sequenceMode: true });
    expect(setCurrentSequenceIndex).toHaveBeenCalledWith(1);
    expect(loadTimerFromSequence).toHaveBeenCalledWith(1);
    expect(scheduleAutostart).toHaveBeenCalledTimes(1);
  });

  test('applies completed sequence step and sends completed message', () => {
    const sequenceRef = { current: null };
    const setSequenceMode = vi.fn();
    const setCurrentSequenceIndex = vi.fn();
    const sendTimerMessage = vi.fn();

    expect(
      applySequenceAdvanceResult({
        sequenceStep: {
          type: 'completed',
          nextIndex: 0,
          sequence: { currentSequenceIndex: 0, sequenceMode: false },
        },
        sequenceRef,
        setSequenceMode,
        setCurrentSequenceIndex,
        loadTimerFromSequence: vi.fn(),
        scheduleAutostart: vi.fn(),
        sendTimerMessage,
        completedMessageTtlMs: 5000,
      }),
    ).toBe(true);

    expect(sequenceRef.current).toEqual({ currentSequenceIndex: 0, sequenceMode: false });
    expect(setSequenceMode).toHaveBeenCalledWith(false);
    expect(setCurrentSequenceIndex).toHaveBeenCalledWith(0);
    expect(sendTimerMessage).toHaveBeenCalledWith('SECUENCIA COMPLETADA', 5000);
  });
});

describe('applySequenceJumpResult', () => {
  test('returns false when jump result is missing', () => {
    const context = {
      sequenceRef: { current: null },
      setCurrentSequenceIndex: vi.fn(),
      loadTimerFromSequence: vi.fn(),
      shouldAutostart: false,
      scheduleAutostart: vi.fn(),
    };

    expect(applySequenceJumpResult({ jumpResult: null, ...context })).toBe(false);
    expect(context.loadTimerFromSequence).not.toHaveBeenCalled();
    expect(context.scheduleAutostart).not.toHaveBeenCalled();
  });

  test('applies jump result and schedules autostart when requested', () => {
    const sequenceRef = { current: null };
    const setCurrentSequenceIndex = vi.fn();
    const loadTimerFromSequence = vi.fn();
    const scheduleAutostart = vi.fn();

    expect(
      applySequenceJumpResult({
        jumpResult: {
          jumpIndex: 2,
          sequence: { currentSequenceIndex: 2, sequenceMode: true },
        },
        sequenceRef,
        setCurrentSequenceIndex,
        loadTimerFromSequence,
        shouldAutostart: true,
        scheduleAutostart,
      }),
    ).toBe(true);

    expect(sequenceRef.current).toEqual({ currentSequenceIndex: 2, sequenceMode: true });
    expect(setCurrentSequenceIndex).toHaveBeenCalledWith(2);
    expect(loadTimerFromSequence).toHaveBeenCalledWith(2);
    expect(scheduleAutostart).toHaveBeenCalledTimes(1);
  });

  test('applies jump result without scheduling autostart when not running', () => {
    const scheduleAutostart = vi.fn();

    expect(
      applySequenceJumpResult({
        jumpResult: {
          jumpIndex: 1,
          sequence: { currentSequenceIndex: 1, sequenceMode: true },
        },
        sequenceRef: { current: null },
        setCurrentSequenceIndex: vi.fn(),
        loadTimerFromSequence: vi.fn(),
        shouldAutostart: false,
        scheduleAutostart,
      }),
    ).toBe(true);

    expect(scheduleAutostart).not.toHaveBeenCalled();
  });
});
