import { describe, expect, test, vi } from 'vitest';
import {
  DASHBOARD_SETTINGS_STORAGE_KEY,
  loadDashboardSettings,
  saveDashboardSettings,
} from './settingsPersistence.js';

function createStorage() {
  const store = new Map();
  return {
    getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => store.set(key, value)),
    removeItem: vi.fn((key) => store.delete(key)),
  };
}

describe('dashboard settings persistence', () => {
  test('returns null when there are no saved settings', () => {
    const storage = createStorage();
    expect(loadDashboardSettings({ storage })).toBeNull();
  });

  test('returns null when saved settings are invalid json', () => {
    const storage = createStorage();
    storage.setItem(DASHBOARD_SETTINGS_STORAGE_KEY, '{invalid');

    expect(loadDashboardSettings({ storage })).toBeNull();
  });

  test('loads valid saved settings object', () => {
    const storage = createStorage();
    const saved = {
      timer: { hours: 0, minutes: 20, seconds: 0, warn: 4, neg: true },
      message: { ttl: 6, persist: true, fontSize: 180, blinking: true, replaceTimer: true },
      timeDisplay: {
        showCurrentTime: false,
        timeFormat24h: false,
        showSeconds: false,
        timePosition: 'top-left',
      },
    };
    storage.setItem(DASHBOARD_SETTINGS_STORAGE_KEY, JSON.stringify(saved));

    expect(loadDashboardSettings({ storage })).toEqual(saved);
  });

  test('saves settings as json', () => {
    const storage = createStorage();
    const settings = {
      timer: { hours: 1, minutes: 2, seconds: 3, warn: 4, neg: false },
    };

    saveDashboardSettings({ storage, settings });

    expect(storage.setItem).toHaveBeenCalledWith(
      DASHBOARD_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings),
    );
  });
});
