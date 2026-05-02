import { describe, expect, test } from 'vitest';
import {
  createCompletedSequenceState,
  createSequenceJumpState,
  createStartedSequenceState,
  createSequenceTimer,
  getNextSequenceStep,
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
});
