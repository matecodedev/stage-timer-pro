import { describe, expect, it } from 'vitest';
import { createStoppedTimerState } from './timerState.js';

describe('timerState', () => {
  it('creates a stopped timer state with green color', () => {
    expect(createStoppedTimerState({ remainingMs: 90000 })).toEqual({
      running: false,
      remainingMs: 90000,
      color: 'green',
    });
  });
});
