import { createStageStatePayload } from '../stage-contract/index.js';
import { calculateTotalMs } from './timeConfig.js';

export function createDashboardStageStatePayload({ timer, timerInputs, sequence, timeConfig }) {
  const totalMs = calculateTotalMs(timerInputs);
  const currentTimer = sequence.sequenceMode
    ? sequence.timerSequence[sequence.currentSequenceIndex]
    : null;

  return createStageStatePayload({
    remainingMs: timer.remainingMs,
    running: timer.running,
    warnMs: timer.warnMs,
    negativeMode: timer.negativeMode,
    color: timer.color(),
    colorInfo: timer.getColorInfo(),
    totalMs,
    sequenceMode: sequence.sequenceMode,
    currentSequenceIndex: sequence.currentSequenceIndex,
    totalSequenceTimers: sequence.timerSequence.length,
    currentTimerName: currentTimer ? currentTimer.name : null,
    timeConfig,
  });
}
