import { describe, expect, it, vi } from 'vitest';
import { createNativeActions } from './nativeActions.js';

describe('createNativeActions', () => {
  it('requests notification permission and returns true only when granted', async () => {
    const runTauriCommand = vi.fn().mockResolvedValue('permission granted');
    const actions = createNativeActions({ runTauriCommand, logger: silentLogger() });

    await expect(actions.requestNotificationPermission()).resolves.toBe(true);
    expect(runTauriCommand).toHaveBeenCalledWith('request_notification_permission');
  });

  it('configures the stage for capture and sends a confirmation notification', async () => {
    const runTauriCommand = vi.fn().mockResolvedValue(undefined);
    const actions = createNativeActions({ runTauriCommand, logger: silentLogger() });

    await actions.setStageForCapture(1920, 1080);

    expect(runTauriCommand).toHaveBeenNthCalledWith(1, 'set_stage_for_capture', {
      width: 1920,
      height: 1080,
    });
    expect(runTauriCommand).toHaveBeenNthCalledWith(2, 'send_notification', {
      title: 'Stage Timer - Video Capture',
      body: 'Ventana configurada para captura de video: 1920x1080',
      icon: null,
    });
  });

  it('resets the stage window and sends a confirmation notification', async () => {
    const runTauriCommand = vi.fn().mockResolvedValue(undefined);
    const actions = createNativeActions({ runTauriCommand, logger: silentLogger() });

    await actions.resetStageWindow();

    expect(runTauriCommand).toHaveBeenNthCalledWith(1, 'reset_stage_window');
    expect(runTauriCommand).toHaveBeenNthCalledWith(2, 'send_notification', {
      title: 'Stage Timer',
      body: 'Ventana restaurada al modo normal',
      icon: null,
    });
  });
});

function silentLogger() {
  return {
    log: vi.fn(),
    error: vi.fn(),
  };
}
