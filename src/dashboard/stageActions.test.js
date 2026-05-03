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

  it('retries stage positioning when the first attempt fails', async () => {
    vi.useFakeTimers();
    const context = createContext();
    context.stageWindowClient.positionOnSecondaryMonitor
      .mockRejectedValueOnce(new Error('first attempt failed'))
      .mockResolvedValueOnce(undefined);
    const actions = createStageActions(context);

    const promise = actions.openFullscreen();
    await vi.runAllTimersAsync();
    await promise;

    expect(context.stageWindowClient.positionOnSecondaryMonitor).toHaveBeenCalledTimes(2);
    expect(context.runTauriCommand).toHaveBeenCalledWith('focus_stage');
    expect(context.sendStageData).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('ignores concurrent open requests while one is already in progress', async () => {
    vi.useFakeTimers();
    const context = createContext({
      createStageWindowImplementation: () =>
        new Promise((resolve) => {
          setTimeout(resolve, 50);
        }),
    });
    const actions = createStageActions(context);

    const firstOpen = actions.openFullscreen();
    const secondOpen = actions.openFullscreen();
    await vi.runAllTimersAsync();
    await Promise.all([firstOpen, secondOpen]);

    expect(
      context.runTauriCommand.mock.calls.filter((args) => args[0] === 'create_stage_window'),
    ).toHaveLength(1);
    expect(context.logger.log).toHaveBeenCalledWith('Stage open already in progress');
    vi.useRealTimers();
  });
});

function createContext(overrides = {}) {
  const runTauriCommand = vi.fn(async (command) => {
    if (command === 'create_stage_window' && overrides.createStageWindowImplementation) {
      return overrides.createStageWindowImplementation();
    }

    return undefined;
  });

  return {
    stageWindowClient: {
      toggleFullscreen: vi.fn().mockResolvedValue(undefined),
      positionOnSecondaryMonitor: vi.fn().mockResolvedValue(undefined),
    },
    runTauriCommand,
    getIsFullscreen: vi.fn(() => overrides.isFullscreen ?? false),
    onFullscreenChange: vi.fn(),
    sendStageData: vi.fn().mockResolvedValue(undefined),
    createReadyDelayMs: 10,
    sendDataDelayMs: 20,
    retryDelayMs: 5,
    positionRetries: 2,
    logger: {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },
  };
}
