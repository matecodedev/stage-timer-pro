import { describe, expect, it, vi } from 'vitest';
import { createMessageActions } from './messageActions.js';

describe('createMessageActions', () => {
  it('sends a dashboard message, clears the draft, and schedules auto-hide when not persistent', async () => {
    vi.useFakeTimers();
    const context = createContext({ persist: false });
    const actions = createMessageActions(context);

    await actions.sendMessage({ text: 'Hello world' });

    expect(context.setCurrentGlobalMessage).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Hello world', visible: true }),
    );
    expect(context.stageWindowClient.emitMessage).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Hello world', visible: true }),
    );
    expect(context.pushStageState).toHaveBeenCalledTimes(1);
    expect(context.clearDraft).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);

    expect(context.setCurrentGlobalMessage).toHaveBeenLastCalledWith(null);
    expect(context.pushStageState).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('does not send blank messages', async () => {
    const context = createContext();
    const actions = createMessageActions(context);

    await actions.sendMessage({ text: '   ' });

    expect(context.stageWindowClient.emitMessage).not.toHaveBeenCalled();
    expect(context.setCurrentGlobalMessage).not.toHaveBeenCalled();
    expect(context.pushStageState).not.toHaveBeenCalled();
  });

  it('hides the active message and refreshes stage state', async () => {
    const context = createContext();
    const actions = createMessageActions(context);

    await actions.hideMessage();

    expect(context.setCurrentGlobalMessage).toHaveBeenCalledWith(null);
    expect(context.stageWindowClient.hideMessage).toHaveBeenCalledTimes(1);
    expect(context.pushStageState).toHaveBeenCalledTimes(1);
  });
});

function createContext(overrides = {}) {
  return {
    stageWindowClient: {
      emitMessage: vi.fn().mockResolvedValue(undefined),
      hideMessage: vi.fn().mockResolvedValue(undefined),
    },
    pushStageState: vi.fn().mockResolvedValue(undefined),
    setCurrentGlobalMessage: vi.fn(),
    clearDraft: vi.fn(),
    messageOptions: {
      persist: overrides.persist ?? false,
      ttlSeconds: 5,
      fontSize: 120,
      blinking: false,
      replaceTimer: false,
    },
  };
}
