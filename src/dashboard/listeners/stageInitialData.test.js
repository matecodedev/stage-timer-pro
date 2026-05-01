import { describe, expect, test, vi } from 'vitest';
import { STAGE_EVENTS } from '../../stage-contract/index.js';
import { registerStageInitialDataRequest } from './stageInitialData.js';

describe('registerStageInitialDataRequest', () => {
  test('listens for stage initial data requests', async () => {
    const unlisten = vi.fn();
    let callback;
    const listenEvent = vi.fn(async (_eventName, cb) => {
      callback = cb;
      return unlisten;
    });
    const onRequest = vi.fn();

    const cleanup = await registerStageInitialDataRequest({
      listenEvent,
      onRequest,
      logger: console,
    });

    expect(listenEvent).toHaveBeenCalledWith(
      STAGE_EVENTS.REQUEST_INITIAL_DATA,
      expect.any(Function),
    );
    await callback();
    expect(onRequest).toHaveBeenCalledTimes(1);

    cleanup();
    expect(unlisten).toHaveBeenCalledTimes(1);
  });

  test('returns inert cleanup when setup fails', async () => {
    const logger = { log: vi.fn() };
    const cleanup = await registerStageInitialDataRequest({
      listenEvent: vi.fn(async () => {
        throw new Error('listener failed');
      }),
      onRequest: vi.fn(),
      logger,
    });

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
    expect(logger.log).toHaveBeenCalledWith('Could not setup stage listener:', expect.any(Error));
  });
});
