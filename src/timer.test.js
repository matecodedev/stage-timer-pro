import { afterEach, describe, expect, test, vi } from 'vitest';
import { Countdown, formatMs } from './timer.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('formatMs', () => {
  test('formats durations below one hour as minutes and seconds', () => {
    expect(formatMs(61_000, false)).toBe('1:01');
  });

  test('formats durations of one hour or more with hours', () => {
    expect(formatMs(3_661_000, false)).toBe('1:01:01');
  });

  test('shows negative sign only when requested', () => {
    expect(formatMs(-61_000, true)).toBe('-1:01');
    expect(formatMs(-61_000, false)).toBe('1:01');
  });
});

describe('Countdown', () => {
  test('starts, ticks down, and pauses without ticking while stopped', () => {
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(1_000)
      .mockReturnValueOnce(1_250)
      .mockReturnValueOnce(2_000);

    const countdown = new Countdown({ initialMs: 1_000, negativeMode: true });

    expect(countdown.tick()).toBe(false);
    countdown.start();

    expect(countdown.tick()).toBe(true);
    expect(countdown.remainingMs).toBe(750);

    countdown.pause();
    expect(countdown.tick()).toBe(false);
    expect(countdown.remainingMs).toBe(750);
  });

  test('stops at zero when negative mode is disabled', () => {
    vi.spyOn(performance, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(2_500);

    const countdown = new Countdown({ initialMs: 1_000, negativeMode: false });

    countdown.start();
    countdown.tick();

    expect(countdown.remainingMs).toBe(0);
    expect(countdown.running).toBe(false);
  });

  test('continues below zero when negative mode is enabled', () => {
    vi.spyOn(performance, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(2_500);

    const countdown = new Countdown({ initialMs: 1_000, negativeMode: true });

    countdown.start();
    countdown.tick();

    expect(countdown.remainingMs).toBe(-500);
    expect(countdown.running).toBe(true);
    expect(countdown.color()).toBe('red');
  });

  test('reports zero percent instead of NaN for a zero-duration timer', () => {
    const countdown = new Countdown({ initialMs: 0 });

    expect(countdown.getColorInfo().remainingPercent).toBe(0);
  });
});
