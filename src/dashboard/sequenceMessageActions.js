import { createSequenceMessagePayload } from './messages.js';

export function createSequenceMessageActions({
  stageWindowClient,
  pushStageState,
  setCurrentGlobalMessage,
}) {
  const sendTimerMessage = async (text, ttlMs) => {
    const messageData = createSequenceMessagePayload({ text, ttlMs });

    setCurrentGlobalMessage(messageData);
    await stageWindowClient.emitMessage(messageData);
    await pushStageState();

    setTimeout(() => {
      setCurrentGlobalMessage(null);
      pushStageState();
    }, ttlMs);
  };

  return {
    sendTimerMessage,
  };
}
