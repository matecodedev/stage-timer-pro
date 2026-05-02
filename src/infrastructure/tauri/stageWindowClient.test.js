import { describe, expect, test, vi } from 'vitest';
import { STAGE_EVENTS } from '../../stage-contract/index.js';
import { createStageWindowClient } from './stageWindowClient.js';

describe('stageWindowClient', () => {
  test('emits stage state through Tauri', async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createStageWindowClient({ invoke });
    const payload = { remainingMs: 1000, running: true };

    await client.emitState(payload);

    expect(invoke).toHaveBeenCalledWith('emit_to_stage', {
      event: STAGE_EVENTS.STATE,
      payload: JSON.stringify(payload),
    });
  });

  test('emits stage message through Tauri', async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createStageWindowClient({ invoke });
    const payload = { text: 'BREAK' };

    await client.emitMessage(payload);

    expect(invoke).toHaveBeenCalledWith('emit_to_stage', {
      event: STAGE_EVENTS.MESSAGE,
      payload: JSON.stringify(payload),
    });
  });

  test('emits stage branding through Tauri', async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createStageWindowClient({ invoke });
    const payload = { logo: '', showBranding: true };

    await client.emitBranding(payload);

    expect(invoke).toHaveBeenCalledWith('emit_to_stage', {
      event: STAGE_EVENTS.BRANDING,
      payload: JSON.stringify(payload),
    });
  });

  test('hides stage message through Tauri', async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createStageWindowClient({ invoke });

    await client.hideMessage();

    expect(invoke).toHaveBeenCalledWith('emit_to_stage', {
      event: STAGE_EVENTS.HIDE_MESSAGE,
      payload: '{}',
    });
  });

  test('wraps native stage window commands', async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createStageWindowClient({ invoke });

    await client.positionOnSecondaryMonitor();
    await client.toggleFullscreen(false);
    await client.close();

    expect(invoke).toHaveBeenCalledWith('position_stage_on_secondary_monitor');
    expect(invoke).toHaveBeenCalledWith('toggle_stage_fullscreen', { on: false });
    expect(invoke).toHaveBeenCalledWith('close_stage_window');
  });

  test('does not resolve native Tauri commands outside the Tauri runtime', async () => {
    const logger = { debug: vi.fn() };
    const client = createStageWindowClient({ runtimeWindow: {}, logger });

    await expect(client.emitState({ remainingMs: 1000 })).resolves.toBeUndefined();
    await expect(client.emitMessage({ text: 'BREAK' })).resolves.toBeUndefined();
    await expect(client.emitBranding({ logo: '' })).resolves.toBeUndefined();
    await expect(client.hideMessage()).resolves.toBeUndefined();
    await expect(client.positionOnSecondaryMonitor()).resolves.toBeUndefined();
    await expect(client.toggleFullscreen(false)).resolves.toBeUndefined();
    await expect(client.close()).resolves.toBeUndefined();

    expect(logger.debug).toHaveBeenCalledWith(
      'Skipping Tauri command outside runtime: emit_to_stage',
    );
    expect(logger.debug).toHaveBeenCalledWith(
      'Skipping Tauri command outside runtime: position_stage_on_secondary_monitor',
    );
    expect(logger.debug).toHaveBeenCalledWith(
      'Skipping Tauri command outside runtime: toggle_stage_fullscreen',
    );
    expect(logger.debug).toHaveBeenCalledWith(
      'Skipping Tauri command outside runtime: close_stage_window',
    );
  });
});
