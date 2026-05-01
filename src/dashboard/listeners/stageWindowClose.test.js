import { describe, expect, test, vi } from 'vitest';
import { registerStageWindowCloseOnExit } from './stageWindowClose.js';

describe('registerStageWindowCloseOnExit', () => {
  test('closes stage window when app window close is requested', async () => {
    const unlisten = vi.fn();
    let callback;
    const appWindow = {
      onCloseRequested: vi.fn(async (cb) => {
        callback = cb;
        return unlisten;
      }),
    };
    const stageClient = { close: vi.fn(async () => undefined) };

    const cleanup = await registerStageWindowCloseOnExit({
      appWindow,
      stageClient,
      logger: console,
    });

    await callback({});
    expect(stageClient.close).toHaveBeenCalledTimes(1);

    cleanup();
    expect(unlisten).toHaveBeenCalledTimes(1);
  });

  test('returns inert cleanup when setup fails', async () => {
    const logger = { log: vi.fn() };
    const cleanup = await registerStageWindowCloseOnExit({
      appWindow: {
        onCloseRequested: vi.fn(async () => {
          throw new Error('close listener failed');
        }),
      },
      stageClient: { close: vi.fn() },
      logger,
    });

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
    expect(logger.log).toHaveBeenCalledWith('Could not setup close listener:', expect.any(Error));
  });

  test('logs close errors without throwing from close callback', async () => {
    let callback;
    const logger = { log: vi.fn() };
    const appWindow = {
      onCloseRequested: vi.fn(async (cb) => {
        callback = cb;
        return vi.fn();
      }),
    };
    const stageClient = {
      close: vi.fn(async () => {
        throw new Error('close failed');
      }),
    };

    await registerStageWindowCloseOnExit({ appWindow, stageClient, logger });
    await expect(callback({})).resolves.toBeUndefined();
    expect(logger.log).toHaveBeenCalledWith('Could not close stage window:', expect.any(Error));
  });
});
