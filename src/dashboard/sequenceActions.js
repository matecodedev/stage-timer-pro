import {
  createSequenceAddResult,
  createSequenceAdvanceResult,
  createSequenceJumpResult,
  createSequenceLoadResult,
  createSequenceRemovalResult,
  createSequenceStartResult,
  createCompletedSequenceState,
  createSequenceTimer,
} from './sequence.js';
import {
  applySequenceAdvanceResult,
  applySequenceJumpResult,
  applySequenceLoadResult,
} from './sequenceLoader.js';

export function createSequenceActions(context) {
  const actions = {
    addTimerToSequence() {
      const { newTimerDraft, sequenceRef } = context;
      if (!newTimerDraft.name.trim()) return;

      const newTimer = createSequenceTimer({
        id: Date.now(),
        name: newTimerDraft.name,
        hours: newTimerDraft.hours,
        minutes: newTimerDraft.minutes,
        seconds: newTimerDraft.seconds,
      });

      const addResult = createSequenceAddResult({
        timerSequence: sequenceRef.current.timerSequence,
        timer: newTimer,
      });

      context.setTimerSequence(addResult.timerSequence);
      context.setNewTimerName(addResult.nextInputs.name);
      context.setNewTimerHours(addResult.nextInputs.hours);
      context.setNewTimerMinutes(addResult.nextInputs.minutes);
      context.setNewTimerSeconds(addResult.nextInputs.seconds);
    },

    removeTimerFromSequence(id) {
      context.setTimerSequence((prev) => {
        const removalResult = createSequenceRemovalResult({
          timerSequence: prev,
          currentSequenceIndex: context.currentSequenceIndex,
          idToRemove: id,
        });

        if (removalResult.shouldResetIndex) {
          context.setCurrentSequenceIndex(0);
        }

        return removalResult.timerSequence;
      });
    },

    startSequence() {
      const startResult = createSequenceStartResult(context.sequenceRef.current);
      if (!startResult) return;

      context.sequenceRef.current = startResult.sequence;
      context.setSequenceMode(true);
      context.setCurrentSequenceIndex(startResult.startIndex);
      actions.loadTimerFromSequence(startResult.startIndex);
      context.start();
    },

    stopSequence() {
      context.sequenceRef.current = createCompletedSequenceState(context.sequenceRef.current);
      context.setSequenceMode(false);
      context.setCurrentSequenceIndex(0);
      context.stop();
    },

    loadTimerFromSequence(index) {
      const loadResult = createSequenceLoadResult({
        timerSequence: context.sequenceRef.current.timerSequence,
        index,
        timerInputs: context.timerInputsRef.current,
      });

      applySequenceLoadResult({
        loadResult,
        timerInputsRef: context.timerInputsRef,
        setHours: context.setHours,
        setMinutes: context.setMinutes,
        setSeconds: context.setSeconds,
        Countdown: context.Countdown,
        createColorThresholds: context.createColorThresholds,
        createSequenceCountdown: context.createSequenceCountdown,
        timerRef: context.timerRef,
        stateRef: context.stateRef,
        setState: context.setState,
        pushStageState: context.pushStageState,
        sendTimerMessage: context.sendTimerMessage,
        messageTtlMs: context.messageTtlMs,
      });
    },

    advanceToNextTimer() {
      const sequenceStep = createSequenceAdvanceResult(context.sequenceRef.current);

      applySequenceAdvanceResult({
        sequenceStep,
        sequenceRef: context.sequenceRef,
        setSequenceMode: context.setSequenceMode,
        setCurrentSequenceIndex: context.setCurrentSequenceIndex,
        loadTimerFromSequence: actions.loadTimerFromSequence,
        scheduleAutostart: context.scheduleSequenceAutostart,
        sendTimerMessage: context.sendTimerMessage,
        completedMessageTtlMs: context.completedMessageTtlMs,
      });
    },

    jumpToSequenceTimer(index) {
      const jumpResult = createSequenceJumpResult(context.sequenceRef.current, index);

      applySequenceJumpResult({
        jumpResult,
        sequenceRef: context.sequenceRef,
        setCurrentSequenceIndex: context.setCurrentSequenceIndex,
        loadTimerFromSequence: actions.loadTimerFromSequence,
        shouldAutostart: context.stateRef.current.running,
        scheduleAutostart: context.scheduleSequenceAutostart,
      });
    },
  };

  return actions;
}
