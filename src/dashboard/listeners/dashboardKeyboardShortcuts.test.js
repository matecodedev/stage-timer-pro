import { describe, expect, test, vi } from 'vitest';
import { registerDashboardKeyboardShortcuts } from './dashboardKeyboardShortcuts.js';

function createTarget() {
  const listeners = new Map();
  return {
    addEventListener: vi.fn((type, listener) => listeners.set(type, listener)),
    removeEventListener: vi.fn((type, listener) => {
      if (listeners.get(type) === listener) listeners.delete(type);
    }),
    dispatch(type, event) {
      listeners.get(type)?.(event);
    },
  };
}

function createHandlers() {
  return {
    isTimerRunning: vi.fn(() => false),
    start: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    addMin: vi.fn(),
    sendMessage: vi.fn(),
    hideMessage: vi.fn(),
  };
}

describe('registerDashboardKeyboardShortcuts', () => {
  test('toggles timer with Space and prevents default', () => {
    const target = createTarget();
    const handlers = createHandlers();
    const preventDefault = vi.fn();

    const cleanup = registerDashboardKeyboardShortcuts({ target, handlers });

    target.dispatch('keydown', { code: 'Space', key: ' ', preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(handlers.start).toHaveBeenCalledTimes(1);
    expect(handlers.pause).not.toHaveBeenCalled();

    cleanup();
    expect(target.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  test('pauses with Space when timer is running', () => {
    const target = createTarget();
    const handlers = Object.assign(createHandlers(), { isTimerRunning: vi.fn(() => true) });

    registerDashboardKeyboardShortcuts({ target, handlers });
    target.dispatch('keydown', { code: 'Space', key: ' ', preventDefault: vi.fn() });

    expect(handlers.pause).toHaveBeenCalledTimes(1);
    expect(handlers.start).not.toHaveBeenCalled();
  });

  test('maps dashboard keys to existing handlers', () => {
    const target = createTarget();
    const handlers = createHandlers();

    registerDashboardKeyboardShortcuts({ target, handlers });
    target.dispatch('keydown', { code: 'KeyS', key: 's', preventDefault: vi.fn() });
    target.dispatch('keydown', { code: 'Equal', key: '+', preventDefault: vi.fn() });
    target.dispatch('keydown', { code: 'Minus', key: '-', preventDefault: vi.fn() });
    target.dispatch('keydown', { code: 'KeyM', key: 'm', preventDefault: vi.fn() });
    target.dispatch('keydown', { code: 'KeyH', key: 'h', preventDefault: vi.fn() });

    expect(handlers.stop).toHaveBeenCalledTimes(1);
    expect(handlers.addMin).toHaveBeenNthCalledWith(1, 1);
    expect(handlers.addMin).toHaveBeenNthCalledWith(2, -1);
    expect(handlers.sendMessage).toHaveBeenCalledTimes(1);
    expect(handlers.hideMessage).toHaveBeenCalledTimes(1);
  });

  test('maps modifier plus and minus to five minute changes', () => {
    const target = createTarget();
    const handlers = createHandlers();

    registerDashboardKeyboardShortcuts({ target, handlers });
    target.dispatch('keydown', { code: 'Equal', key: '+', ctrlKey: true, preventDefault: vi.fn() });
    target.dispatch('keydown', { code: 'Minus', key: '-', metaKey: true, preventDefault: vi.fn() });

    expect(handlers.addMin).toHaveBeenNthCalledWith(1, 1);
    expect(handlers.addMin).toHaveBeenNthCalledWith(2, 5);
    expect(handlers.addMin).toHaveBeenNthCalledWith(3, -1);
    expect(handlers.addMin).toHaveBeenNthCalledWith(4, -5);
  });
});
