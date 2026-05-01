import { describe, expect, test, vi } from 'vitest';
import { GLOBAL_SHORTCUT_EVENT } from '../../stage-contract/index.js';
import { registerGlobalShortcuts } from './globalShortcuts.js';

describe('registerGlobalShortcuts', () => {
  test('registers global shortcut listener and routes known actions', async () => {
    const unlisten = vi.fn();
    let callback;
    const listenEvent = vi.fn(async (_eventName, cb) => {
      callback = cb;
      return unlisten;
    });
    const handlers = {
      toggleTimer: vi.fn(),
      resetTimer: vi.fn(),
      toggleStageFullscreen: vi.fn(),
    };

    const cleanup = await registerGlobalShortcuts({ listenEvent, handlers, logger: console });

    expect(listenEvent).toHaveBeenCalledWith(GLOBAL_SHORTCUT_EVENT, expect.any(Function));
    callback({ payload: 'toggle-timer' });
    callback({ payload: 'reset-timer' });
    callback({ payload: 'toggle-stage-fullscreen' });

    expect(handlers.toggleTimer).toHaveBeenCalledTimes(1);
    expect(handlers.resetTimer).toHaveBeenCalledTimes(1);
    expect(handlers.toggleStageFullscreen).toHaveBeenCalledTimes(1);

    cleanup();
    expect(unlisten).toHaveBeenCalledTimes(1);
  });

  test('returns inert cleanup when listener setup fails', async () => {
    const listenEvent = vi.fn(async () => {
      throw new Error('tauri unavailable');
    });
    const logger = { log: vi.fn(), error: vi.fn() };

    const cleanup = await registerGlobalShortcuts({
      listenEvent,
      handlers: { toggleTimer: vi.fn(), resetTimer: vi.fn(), toggleStageFullscreen: vi.fn() },
      logger,
    });

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
