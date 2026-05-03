import { describe, expect, test, vi } from 'vitest';
import {
  createSequenceAddResult,
  createSequenceAdvanceResult,
  createSequenceJumpResult,
  createSequenceLoadResult,
  createSequenceRemovalResult,
  createSequenceStartResult,
  createCompletedSequenceState,
  createLoadedSequenceTimerInputs,
  createLoadedSequenceTimerState,
  createSequenceJumpState,
  createStartedSequenceState,
  createSequenceTimer,
  getDefaultSequenceTimerInputs,
  getNextSequenceStep,
  scheduleSequenceTimerAutostart,
  shouldResetSequenceIndexAfterRemoval,
} from './sequence.js';

describe('dashboard sequence helpers', () => {
  test('creates a sequence timer with trimmed name and total milliseconds', () => {
    expect(
      createSequenceTimer({
        id: 42,
        name: '  Keynote  ',
        hours: 1,
        minutes: 2,
        seconds: 3,
      }),
    ).toEqual({
      id: 42,
      name: 'Keynote',
      hours: 1,
      minutes: 2,
      seconds: 3,
      totalMs: 3_723_000,
    });
  });

  test('creates sequence add result with appended timer and reset form inputs', () => {
    expect(
      createSequenceAddResult({
        timerSequence: [{ id: 1, name: 'Intro' }],
        timer: { id: 2, name: 'Cierre' },
      }),
    ).toEqual({
      timerSequence: [
        { id: 1, name: 'Intro' },
        { id: 2, name: 'Cierre' },
      ],
      nextInputs: {
        name: '',
        hours: 0,
        minutes: 5,
        seconds: 0,
      },
    });
  });

  test('detects when removing a timer should reset current sequence index', () => {
    expect(
      shouldResetSequenceIndexAfterRemoval({
        currentSequenceIndex: 2,
        sequenceLengthBeforeRemoval: 3,
      }),
    ).toBe(true);
    expect(
      shouldResetSequenceIndexAfterRemoval({
        currentSequenceIndex: 1,
        sequenceLengthBeforeRemoval: 3,
      }),
    ).toBe(false);
    expect(
      shouldResetSequenceIndexAfterRemoval({
        currentSequenceIndex: 0,
        sequenceLengthBeforeRemoval: 1,
      }),
    ).toBe(true);
  });

  test('creates sequence removal result with filtered timers and reset flag', () => {
    expect(
      createSequenceRemovalResult({
        timerSequence: [{ id: 1 }, { id: 2 }, { id: 3 }],
        currentSequenceIndex: 2,
        idToRemove: 3,
      }),
    ).toEqual({
      timerSequence: [{ id: 1 }, { id: 2 }],
      shouldResetIndex: true,
    });
  });

  test('keeps current sequence index when removing a different timer', () => {
    expect(
      createSequenceRemovalResult({
        timerSequence: [{ id: 1 }, { id: 2 }, { id: 3 }],
        currentSequenceIndex: 1,
        idToRemove: 3,
      }),
    ).toEqual({
      timerSequence: [{ id: 1 }, { id: 2 }],
      shouldResetIndex: false,
    });
  });

  test('returns the next sequence timer step when another timer exists', () => {
    expect(
      getNextSequenceStep({
        currentSequenceIndex: 0,
        sequenceLength: 2,
      }),
    ).toEqual({ type: 'next', nextIndex: 1 });
  });

  test('returns completed when the current timer is the last in the sequence', () => {
    expect(
      getNextSequenceStep({
        currentSequenceIndex: 1,
        sequenceLength: 2,
      }),
    ).toEqual({ type: 'completed', nextIndex: 0 });
  });

  test('creates next-step advance result for a sequence with remaining timers', () => {
    expect(
      createSequenceAdvanceResult({
        timerSequence: [{ id: 1 }, { id: 2 }],
        currentSequenceIndex: 0,
        sequenceMode: true,
        autoAdvance: true,
      }),
    ).toEqual({
      type: 'next',
      nextIndex: 1,
      sequence: {
        timerSequence: [{ id: 1 }, { id: 2 }],
        currentSequenceIndex: 1,
        sequenceMode: true,
        autoAdvance: true,
      },
    });
  });

  test('creates completed advance result when sequence reaches the end', () => {
    expect(
      createSequenceAdvanceResult({
        timerSequence: [{ id: 1 }, { id: 2 }],
        currentSequenceIndex: 1,
        sequenceMode: true,
        autoAdvance: true,
      }),
    ).toEqual({
      type: 'completed',
      nextIndex: 0,
      sequence: {
        timerSequence: [{ id: 1 }, { id: 2 }],
        currentSequenceIndex: 0,
        sequenceMode: false,
        autoAdvance: true,
      },
    });
  });

  test('creates a completed sequence state that disables sequence mode and resets index', () => {
    expect(
      createCompletedSequenceState({
        timerSequence: [{ id: 1 }],
        currentSequenceIndex: 1,
        sequenceMode: true,
        autoAdvance: true,
      }),
    ).toEqual({
      timerSequence: [{ id: 1 }],
      currentSequenceIndex: 0,
      sequenceMode: false,
      autoAdvance: true,
    });
  });

  test('creates a started sequence state from the current sequence', () => {
    expect(
      createStartedSequenceState({
        timerSequence: [{ id: 1 }],
        currentSequenceIndex: 4,
        sequenceMode: false,
        autoAdvance: false,
      }),
    ).toEqual({
      timerSequence: [{ id: 1 }],
      currentSequenceIndex: 0,
      sequenceMode: true,
      autoAdvance: false,
    });
  });

  test('creates start result for a non-empty sequence', () => {
    expect(
      createSequenceStartResult({
        timerSequence: [{ id: 1 }],
        currentSequenceIndex: 4,
        sequenceMode: false,
        autoAdvance: false,
      }),
    ).toEqual({
      startIndex: 0,
      sequence: {
        timerSequence: [{ id: 1 }],
        currentSequenceIndex: 0,
        sequenceMode: true,
        autoAdvance: false,
      },
    });
  });

  test('returns null start result for an empty sequence', () => {
    expect(
      createSequenceStartResult({
        timerSequence: [],
        currentSequenceIndex: 0,
        sequenceMode: false,
        autoAdvance: true,
      }),
    ).toBeNull();
  });

  test('creates a sequence state for jumping to a specific timer', () => {
    expect(
      createSequenceJumpState(
        {
          timerSequence: [{ id: 1 }, { id: 2 }],
          currentSequenceIndex: 0,
          sequenceMode: true,
          autoAdvance: true,
        },
        1,
      ),
    ).toEqual({
      timerSequence: [{ id: 1 }, { id: 2 }],
      currentSequenceIndex: 1,
      sequenceMode: true,
      autoAdvance: true,
    });
  });

  test('creates jump result for a valid sequence timer index', () => {
    expect(
      createSequenceJumpResult(
        {
          timerSequence: [{ id: 1 }, { id: 2 }],
          currentSequenceIndex: 0,
          sequenceMode: true,
          autoAdvance: true,
        },
        1,
      ),
    ).toEqual({
      jumpIndex: 1,
      sequence: {
        timerSequence: [{ id: 1 }, { id: 2 }],
        currentSequenceIndex: 1,
        sequenceMode: true,
        autoAdvance: true,
      },
    });
  });

  test('returns null jump result for an invalid sequence timer index', () => {
    expect(
      createSequenceJumpResult(
        {
          timerSequence: [{ id: 1 }, { id: 2 }],
          currentSequenceIndex: 0,
          sequenceMode: true,
          autoAdvance: true,
        },
        3,
      ),
    ).toBeNull();
  });

  test('creates timer inputs for a loaded sequence timer while preserving other settings', () => {
    expect(
      createLoadedSequenceTimerInputs(
        {
          hours: 0,
          minutes: 15,
          seconds: 0,
          warn: 5,
          neg: false,
        },
        {
          hours: 1,
          minutes: 2,
          seconds: 3,
        },
      ),
    ).toEqual({
      hours: 1,
      minutes: 2,
      seconds: 3,
      warn: 5,
      neg: false,
    });
  });

  test('creates load result for a valid sequence timer index', () => {
    expect(
      createSequenceLoadResult({
        timerSequence: [
          { id: 1, name: 'Intro', hours: 0, minutes: 5, seconds: 0, totalMs: 300000 },
        ],
        currentSequenceIndex: 0,
        sequenceMode: true,
        autoAdvance: true,
        index: 0,
        timerInputs: {
          hours: 0,
          minutes: 15,
          seconds: 0,
          warn: 5,
          neg: false,
        },
      }),
    ).toEqual({
      timer: { id: 1, name: 'Intro', hours: 0, minutes: 5, seconds: 0, totalMs: 300000 },
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
    });
  });

  test('returns null load result for an invalid sequence timer index', () => {
    expect(
      createSequenceLoadResult({
        timerSequence: [
          { id: 1, name: 'Intro', hours: 0, minutes: 5, seconds: 0, totalMs: 300000 },
        ],
        currentSequenceIndex: 0,
        sequenceMode: true,
        autoAdvance: true,
        index: 2,
        timerInputs: {
          hours: 0,
          minutes: 15,
          seconds: 0,
          warn: 5,
          neg: false,
        },
      }),
    ).toBeNull();
  });

  test('creates dashboard timer state for a loaded sequence timer', () => {
    expect(createLoadedSequenceTimerState({ totalMs: 12345 })).toEqual({
      running: false,
      remainingMs: 12345,
      color: 'green',
    });
  });

  test('returns default sequence timer form inputs', () => {
    expect(getDefaultSequenceTimerInputs()).toEqual({
      name: '',
      hours: 0,
      minutes: 5,
      seconds: 0,
    });
  });

  test('schedules sequence timer autostart and pushes stage state', () => {
    vi.useFakeTimers();
    const timer = { start: vi.fn() };
    const timerRef = { current: timer };
    const pushStageState = vi.fn();

    scheduleSequenceTimerAutostart({ timerRef, pushStageState, delayMs: 100 });
    expect(timer.start).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(timer.start).toHaveBeenCalledTimes(1);
    expect(pushStageState).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  test('skips sequence timer autostart when the timer ref is empty', () => {
    vi.useFakeTimers();
    const pushStageState = vi.fn();

    scheduleSequenceTimerAutostart({
      timerRef: { current: null },
      pushStageState,
      delayMs: 100,
    });
    vi.advanceTimersByTime(100);

    expect(pushStageState).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
