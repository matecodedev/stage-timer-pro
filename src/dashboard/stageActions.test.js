import { describe, expect, it, vi } from 'vitest';
import { createStageActions } from './stageActions.js';

describe('createStageActions', () => {
  it('toggles stage fullscreen and notifies the new state', async () => {
    const context = createContext({ isFullscreen: true });
    const actions = createStageActions(context);

    await actions.toggleStageFullscreen();

    expect(context.stageWindowClient.toggleFullscreen).toHaveBeenCalledWith(false);
    expect(context.onFullscreenChange).toHaveBeenCalledWith(false);
  });

  it('opens the stage window, positions it, focuses it, and schedules current data sync', async () => {
    vi.useFakeTimers();
    const context = createContext();
    const actions = createStageActions(context);

    const promise = actions.openFullscreen();
    await vi.runAllTimersAsync();
    await promise;

    expect(context.runTauriCommand).toHaveBeenNthCalledWith(1, 'create_stage_window');
    expect(context.stageWindowClient.positionOnSecondaryMonitor).toHaveBeenCalledTimes(1);
    expect(context.runTauriCommand).toHaveBeenNthCalledWith(2, 'focus_stage');
    expect(context.sendStageData).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('logs open errors instead of throwing', async () => {
    const context = createContext();
    context.runTauriCommand.mockRejectedValueOnce(new Error('native failed'));
    const actions = createStageActions(context);

    await expect(actions.openFullscreen()).resolves.toBeUndefined();

    expect(context.logger.error).toHaveBeenCalledWith(
      'Error opening stage window:',
      expect.any(Error),
    );
  });
});

function createContext(overrides = {}) {
  return {
    stageWindowClient: {
      toggleFullscreen: vi.fn().mockResolvedValue(undefined),
      positionOnSecondaryMonitor: vi.fn().mockResolvedValue(undefined),
    },
    runTauriCommand: vi.fn().mockResolvedValue(undefined),
    getIsFullscreen: vi.fn(() => overrides.isFullscreen ?? false),
    onFullscreenChange: vi.fn(),
    sendStageData: vi.fn().mockResolvedValue(undefined),
    createReadyDelayMs: 10,
    sendDataDelayMs: 20,
    logger: {
      log: vi.fn(),
      error: vi.fn(),
    },
  };
}
