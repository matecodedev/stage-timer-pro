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
