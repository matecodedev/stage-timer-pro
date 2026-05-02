import { calculateTotalMs } from './timeConfig.js';

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
