export const DASHBOARD_SETTINGS_STORAGE_KEY = 'stage-timer/dashboard-settings/v1';

export function loadDashboardSettings({ storage = globalThis?.localStorage } = {}) {
  if (!storage?.getItem) return null;

  const raw = storage.getItem(DASHBOARD_SETTINGS_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDashboardSettings({ settings, storage = globalThis?.localStorage } = {}) {
  if (!storage?.setItem || !settings || typeof settings !== 'object') return;

  storage.setItem(DASHBOARD_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
