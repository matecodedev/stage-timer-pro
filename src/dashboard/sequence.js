import { calculateTotalMs } from './timeConfig.js';
import { DEFAULT_SEQUENCE_TIMER_INPUTS } from './constants.js';
import { createStoppedTimerState } from './timerState.js';

export function createSequenceTimer({ id, name, hours, minutes, seconds }) {
  return {
    id,
    name: name.trim(),
    hours,
    minutes,
    seconds,
    totalMs: calculateTotalMs({ hours, minutes, seconds }),
  };
}

export function shouldResetSequenceIndexAfterRemoval({
  currentSequenceIndex,
  sequenceLengthBeforeRemoval,
}) {
  return currentSequenceIndex >= sequenceLengthBeforeRemoval - 1;
}

export function getNextSequenceStep({ currentSequenceIndex, sequenceLength }) {
  const nextIndex = currentSequenceIndex + 1;

  if (nextIndex < sequenceLength) {
    return { type: 'next', nextIndex };
  }

  return { type: 'completed', nextIndex: 0 };
}

export function createCompletedSequenceState(sequence) {
  return {
    ...sequence,
    sequenceMode: false,
    currentSequenceIndex: 0,
  };
}

export function createStartedSequenceState(sequence) {
  return {
    ...sequence,
    sequenceMode: true,
    currentSequenceIndex: 0,
  };
}

export function createSequenceJumpState(sequence, currentSequenceIndex) {
  return {
    ...sequence,
    currentSequenceIndex,
  };
}

export function createLoadedSequenceTimerInputs(inputs, timer) {
  return {
    ...inputs,
    hours: timer.hours,
    minutes: timer.minutes,
    seconds: timer.seconds,
  };
}

export function createLoadedSequenceTimerState(timer) {
  return createStoppedTimerState({ remainingMs: timer.totalMs });
}

export function getDefaultSequenceTimerInputs() {
  return { ...DEFAULT_SEQUENCE_TIMER_INPUTS };
}

export function scheduleSequenceTimerAutostart({ timerRef, pushStageState, delayMs }) {
  setTimeout(() => {
    if (!timerRef.current) return;

    timerRef.current.start();
    pushStageState();
  }, delayMs);
}
