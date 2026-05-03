import { describe, expect, it, vi } from 'vitest';
import { createSequenceMessageActions } from './sequenceMessageActions.js';

describe('createSequenceMessageActions', () => {
  it('sends a sequence timer message and clears it after the ttl', async () => {
    vi.useFakeTimers();
    const context = createContext();
    const actions = createSequenceMessageActions(context);

    await actions.sendTimerMessage('Intro', 3000);

    expect(context.setCurrentGlobalMessage).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Intro', ttlMs: 3000, visible: true }),
    );
    expect(context.stageWindowClient.emitMessage).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Intro', ttlMs: 3000, visible: true }),
    );
    expect(context.pushStageState).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(3000);

    expect(context.setCurrentGlobalMessage).toHaveBeenLastCalledWith(null);
    expect(context.pushStageState).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

function createContext() {
  return {
    stageWindowClient: {
      emitMessage: vi.fn().mockResolvedValue(undefined),
    },
    pushStageState: vi.fn().mockResolvedValue(undefined),
    setCurrentGlobalMessage: vi.fn(),
  };
}
