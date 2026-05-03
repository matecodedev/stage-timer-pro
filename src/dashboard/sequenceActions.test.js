import { describe, expect, test, vi } from 'vitest';
import { createSequenceActions } from './sequenceActions.js';

function createContext(overrides = {}) {
  return {
    newTimerDraft: {
      name: 'Intro',
      hours: 0,
      minutes: 5,
      seconds: 0,
    },
    sequenceRef: {
      current: {
        timerSequence: [],
        currentSequenceIndex: 0,
        sequenceMode: false,
        autoAdvance: true,
      },
    },
    timerInputsRef: {
      current: {
        hours: 0,
        minutes: 15,
        seconds: 0,
        warn: 5,
        neg: false,
      },
    },
    stateRef: { current: { running: false } },
    setTimerSequence: vi.fn(),
    setNewTimerName: vi.fn(),
    setNewTimerHours: vi.fn(),
    setNewTimerMinutes: vi.fn(),
    setNewTimerSeconds: vi.fn(),
    setCurrentSequenceIndex: vi.fn(),
    setSequenceMode: vi.fn(),
    setHours: vi.fn(),
    setMinutes: vi.fn(),
    setSeconds: vi.fn(),
    setState: vi.fn(),
    pushStageState: vi.fn(),
    sendTimerMessage: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    scheduleSequenceAutostart: vi.fn(),
    timerRef: { current: null },
    Countdown: vi.fn(),
    createColorThresholds: vi.fn(),
    createSequenceCountdown: vi.fn(),
    ...overrides,
  };
}

describe('createSequenceActions', () => {
  test('does not add a sequence timer when the draft name is blank', () => {
    const context = createContext({
      newTimerDraft: { name: '   ', hours: 0, minutes: 5, seconds: 0 },
    });

    createSequenceActions(context).addTimerToSequence();

    expect(context.setTimerSequence).not.toHaveBeenCalled();
    expect(context.setNewTimerName).not.toHaveBeenCalled();
  });

  test('adds a sequence timer and resets draft inputs', () => {
    const context = createContext();

    createSequenceActions(context).addTimerToSequence();

    expect(context.setTimerSequence).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Intro',
        minutes: 5,
        totalMs: 300000,
      }),
    ]);
    expect(context.setNewTimerName).toHaveBeenCalledWith('');
    expect(context.setNewTimerHours).toHaveBeenCalledWith(0);
    expect(context.setNewTimerMinutes).toHaveBeenCalledWith(5);
    expect(context.setNewTimerSeconds).toHaveBeenCalledWith(0);
  });

  test('starts a valid sequence and loads the first timer', () => {
    const context = createContext({
      sequenceRef: {
        current: {
          timerSequence: [
            { id: 1, name: 'Intro', hours: 0, minutes: 5, seconds: 0, totalMs: 300000 },
          ],
          currentSequenceIndex: 2,
          sequenceMode: false,
          autoAdvance: true,
        },
      },
    });

    const actions = createSequenceActions(context);
    const loadSpy = vi.spyOn(actions, 'loadTimerFromSequence');

    actions.startSequence();

    expect(context.sequenceRef.current.sequenceMode).toBe(true);
    expect(context.sequenceRef.current.currentSequenceIndex).toBe(0);
    expect(context.setSequenceMode).toHaveBeenCalledWith(true);
    expect(context.setCurrentSequenceIndex).toHaveBeenCalledWith(0);
    expect(loadSpy).toHaveBeenCalledWith(0);
    expect(context.start).toHaveBeenCalledTimes(1);
  });

  test('stops the active sequence and delegates timer stop', () => {
    const context = createContext({
      sequenceRef: {
        current: {
          timerSequence: [{ id: 1 }],
          currentSequenceIndex: 1,
          sequenceMode: true,
          autoAdvance: true,
        },
      },
    });

    createSequenceActions(context).stopSequence();

    expect(context.sequenceRef.current.sequenceMode).toBe(false);
    expect(context.sequenceRef.current.currentSequenceIndex).toBe(0);
    expect(context.setSequenceMode).toHaveBeenCalledWith(false);
    expect(context.setCurrentSequenceIndex).toHaveBeenCalledWith(0);
    expect(context.stop).toHaveBeenCalledTimes(1);
  });

  test('loads a sequence timer through the extracted load helper flow', () => {
    const context = createContext({
      sequenceRef: {
        current: {
          timerSequence: [
            { id: 1, name: 'Intro', hours: 0, minutes: 5, seconds: 0, totalMs: 300000 },
          ],
          currentSequenceIndex: 0,
          sequenceMode: true,
          autoAdvance: true,
        },
      },
    });

    createSequenceActions(context).loadTimerFromSequence(0);

    expect(context.setHours).toHaveBeenCalledWith(0);
    expect(context.setMinutes).toHaveBeenCalledWith(5);
    expect(context.setSeconds).toHaveBeenCalledWith(0);
  });

  test('advances sequence and schedules autostart for next timer', () => {
    const context = createContext({
      sequenceRef: {
        current: {
          timerSequence: [
            { id: 1, name: 'Intro', hours: 0, minutes: 5, seconds: 0, totalMs: 300000 },
            { id: 2, name: 'Talk', hours: 0, minutes: 15, seconds: 0, totalMs: 900000 },
          ],
          currentSequenceIndex: 0,
          sequenceMode: true,
          autoAdvance: true,
        },
      },
    });

    const actions = createSequenceActions(context);
    const loadSpy = vi.spyOn(actions, 'loadTimerFromSequence');

    actions.advanceToNextTimer();

    expect(context.setCurrentSequenceIndex).toHaveBeenCalledWith(1);
    expect(loadSpy).toHaveBeenCalledWith(1);
    expect(context.scheduleSequenceAutostart).toHaveBeenCalledTimes(1);
  });

  test('jumps within sequence and keeps autostart when timer was running', () => {
    const context = createContext({
      stateRef: { current: { running: true } },
      sequenceRef: {
        current: {
          timerSequence: [
            { id: 1, name: 'Intro', hours: 0, minutes: 5, seconds: 0, totalMs: 300000 },
            { id: 2, name: 'Talk', hours: 0, minutes: 15, seconds: 0, totalMs: 900000 },
          ],
          currentSequenceIndex: 0,
          sequenceMode: true,
          autoAdvance: true,
        },
      },
    });

    const actions = createSequenceActions(context);
    const loadSpy = vi.spyOn(actions, 'loadTimerFromSequence');

    actions.jumpToSequenceTimer(1);

    expect(context.setCurrentSequenceIndex).toHaveBeenCalledWith(1);
    expect(loadSpy).toHaveBeenCalledWith(1);
    expect(context.scheduleSequenceAutostart).toHaveBeenCalledTimes(1);
  });
});
