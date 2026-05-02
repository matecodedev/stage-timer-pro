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
