import { describe, expect, test } from 'vitest';
import { isTauriRuntime } from './tauriRuntime.js';

describe('tauri runtime detection', () => {
  test('returns false when no window object is available', () => {
    expect(isTauriRuntime()).toBe(false);
  });

  test('returns false for a normal browser window without Tauri IPC', () => {
    expect(isTauriRuntime({})).toBe(false);
    expect(isTauriRuntime({ __TAURI_IPC__: 'not-a-function' })).toBe(false);
  });

  test('returns true when Tauri IPC is available', () => {
    expect(isTauriRuntime({ __TAURI_IPC__: () => undefined })).toBe(true);
  });
});
