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

export function createSequenceAddResult({ timerSequence, timer }) {
  return {
    timerSequence: [...timerSequence, timer],
    nextInputs: getDefaultSequenceTimerInputs(),
  };
}

export function shouldResetSequenceIndexAfterRemoval({
  currentSequenceIndex,
  sequenceLengthBeforeRemoval,
}) {
  return currentSequenceIndex >= sequenceLengthBeforeRemoval - 1;
}

export function createSequenceRemovalResult({ timerSequence, currentSequenceIndex, idToRemove }) {
  return {
    timerSequence: timerSequence.filter((timer) => timer.id !== idToRemove),
    shouldResetIndex: shouldResetSequenceIndexAfterRemoval({
      currentSequenceIndex,
      sequenceLengthBeforeRemoval: timerSequence.length,
    }),
  };
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

export function createSequenceStartResult(sequence) {
  if (sequence.timerSequence.length === 0) {
    return null;
  }

  return {
    startIndex: 0,
    sequence: createStartedSequenceState(sequence),
  };
}

export function createSequenceJumpState(sequence, currentSequenceIndex) {
  return {
    ...sequence,
    currentSequenceIndex,
  };
}

export function createSequenceJumpResult(sequence, currentSequenceIndex) {
  if (currentSequenceIndex >= sequence.timerSequence.length) {
    return null;
  }

  return {
    jumpIndex: currentSequenceIndex,
    sequence: createSequenceJumpState(sequence, currentSequenceIndex),
  };
}

export function createSequenceAdvanceResult(sequence) {
  const step = getNextSequenceStep({
    currentSequenceIndex: sequence.currentSequenceIndex,
    sequenceLength: sequence.timerSequence.length,
  });

  if (step.type === 'next') {
    return {
      ...step,
      sequence: createSequenceJumpState(sequence, step.nextIndex),
    };
  }

  return {
    ...step,
    sequence: createCompletedSequenceState(sequence),
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

export function createSequenceLoadResult({ timerSequence, index, timerInputs }) {
  const timer = timerSequence[index];
  if (!timer) {
    return null;
  }

  return {
    timer,
    nextInputs: createLoadedSequenceTimerInputs(timerInputs, timer),
    nextState: createLoadedSequenceTimerState(timer),
    messageText: timer.name,
  };
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
