import { createDashboardMessagePayload, resolveMessageTtlMs } from './messages.js';

export function createMessageActions({
  stageWindowClient,
  pushStageState,
  setCurrentGlobalMessage,
  clearDraft = () => {},
  messageOptions,
}) {
  const scheduleMessageClear = (ttlMs) => {
    setTimeout(() => {
      setCurrentGlobalMessage(null);
      pushStageState();
    }, ttlMs);
  };

  const sendMessage = async ({ text, clearAfterSend = true }) => {
    if (!text.trim()) return;

    const ttlMs = resolveMessageTtlMs(messageOptions);
    const messageData = createDashboardMessagePayload({
      text,
      ttlMs,
      fontSize: messageOptions.fontSize,
      blinking: messageOptions.blinking,
      replaceTimer: messageOptions.replaceTimer,
    });

    setCurrentGlobalMessage(messageData);
    await stageWindowClient.emitMessage(messageData);
    await pushStageState();

    if (clearAfterSend) {
      clearDraft();
    }

    if (!messageOptions.persist) {
      scheduleMessageClear(ttlMs);
    }
  };

  const hideMessage = async () => {
    setCurrentGlobalMessage(null);
    await stageWindowClient.hideMessage();
    await pushStageState();
  };

  return {
    sendMessage,
    hideMessage,
  };
}
