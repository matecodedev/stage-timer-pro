export function applySequenceLoadResult({
  loadResult,
  timerInputsRef,
  setHours,
  setMinutes,
  setSeconds,
  Countdown,
  createColorThresholds,
  createSequenceCountdown,
  timerRef,
  stateRef,
  setState,
  pushStageState,
  sendTimerMessage,
  messageTtlMs,
}) {
  if (!loadResult) {
    return false;
  }

  timerInputsRef.current = loadResult.nextInputs;
  setHours(loadResult.timer.hours);
  setMinutes(loadResult.timer.minutes);
  setSeconds(loadResult.timer.seconds);

  timerRef.current = createSequenceCountdown({
    Countdown,
    createColorThresholds,
    timer: loadResult.timer,
    inputs: timerInputsRef.current,
  });

  stateRef.current = loadResult.nextState;
  setState(loadResult.nextState);
  pushStageState();
  sendTimerMessage(loadResult.messageText, messageTtlMs);

  return true;
}

export function applySequenceAdvanceResult({
  sequenceStep,
  sequenceRef,
  setSequenceMode,
  setCurrentSequenceIndex,
  loadTimerFromSequence,
  scheduleAutostart,
  sendTimerMessage,
  completedMessageTtlMs,
}) {
  if (!sequenceStep) {
    return false;
  }

  sequenceRef.current = sequenceStep.sequence;

  if (sequenceStep.type === 'next') {
    setCurrentSequenceIndex(sequenceStep.nextIndex);
    loadTimerFromSequence(sequenceStep.nextIndex);
    scheduleAutostart();
    return true;
  }

  setSequenceMode(false);
  setCurrentSequenceIndex(0);
  sendTimerMessage('SECUENCIA COMPLETADA', completedMessageTtlMs);
  return true;
}

export function applySequenceJumpResult({
  jumpResult,
  sequenceRef,
  setCurrentSequenceIndex,
  loadTimerFromSequence,
  shouldAutostart,
  scheduleAutostart,
}) {
  if (!jumpResult) {
    return false;
  }

  sequenceRef.current = jumpResult.sequence;
  setCurrentSequenceIndex(jumpResult.jumpIndex);
  loadTimerFromSequence(jumpResult.jumpIndex);

  if (shouldAutostart) {
    scheduleAutostart();
  }

  return true;
}
