import { describe, expect, test } from 'vitest';
import { createSequenceTimer, shouldResetSequenceIndexAfterRemoval } from './sequence.js';

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
});
