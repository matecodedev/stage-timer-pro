export const DASHBOARD_SETTINGS_STORAGE_KEY = 'stage-timer/dashboard-settings/v1';

export function normalizeDashboardSettings(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const normalized = {};

  if (raw.timer && typeof raw.timer === 'object') {
    const timer = {};
    if (Number.isFinite(raw.timer.hours)) timer.hours = raw.timer.hours;
    if (Number.isFinite(raw.timer.minutes)) timer.minutes = raw.timer.minutes;
    if (Number.isFinite(raw.timer.seconds)) timer.seconds = raw.timer.seconds;
    if (Number.isFinite(raw.timer.warn)) timer.warn = raw.timer.warn;
    if (typeof raw.timer.neg === 'boolean') timer.neg = raw.timer.neg;
    if (Object.keys(timer).length > 0) normalized.timer = timer;
  }

  if (raw.sequence && typeof raw.sequence === 'object') {
    const sequence = {};
    if (typeof raw.sequence.autoAdvance === 'boolean') {
      sequence.autoAdvance = raw.sequence.autoAdvance;
    }
    if (Object.keys(sequence).length > 0) normalized.sequence = sequence;
  }

  if (raw.message && typeof raw.message === 'object') {
    const message = {};
    if (Number.isFinite(raw.message.ttl)) message.ttl = raw.message.ttl;
    if (typeof raw.message.persist === 'boolean') message.persist = raw.message.persist;
    if (Number.isFinite(raw.message.fontSize)) message.fontSize = raw.message.fontSize;
    if (typeof raw.message.blinking === 'boolean') message.blinking = raw.message.blinking;
    if (typeof raw.message.replaceTimer === 'boolean')
      message.replaceTimer = raw.message.replaceTimer;
    if (Object.keys(message).length > 0) normalized.message = message;
  }

  if (raw.branding && typeof raw.branding === 'object') {
    const branding = {};
    if (typeof raw.branding.logo === 'string') branding.logo = raw.branding.logo;
    if (Number.isFinite(raw.branding.logoSize)) branding.logoSize = raw.branding.logoSize;
    if (typeof raw.branding.blackBackground === 'boolean')
      branding.blackBackground = raw.branding.blackBackground;
    if (typeof raw.branding.showBranding === 'boolean')
      branding.showBranding = raw.branding.showBranding;
    if (Object.keys(branding).length > 0) normalized.branding = branding;
  }

  if (raw.timeDisplay && typeof raw.timeDisplay === 'object') {
    const timeDisplay = {};
    if (typeof raw.timeDisplay.showCurrentTime === 'boolean')
      timeDisplay.showCurrentTime = raw.timeDisplay.showCurrentTime;
    if (typeof raw.timeDisplay.timeFormat24h === 'boolean')
      timeDisplay.timeFormat24h = raw.timeDisplay.timeFormat24h;
    if (typeof raw.timeDisplay.showSeconds === 'boolean')
      timeDisplay.showSeconds = raw.timeDisplay.showSeconds;
    if (typeof raw.timeDisplay.timePosition === 'string')
      timeDisplay.timePosition = raw.timeDisplay.timePosition;
    if (Object.keys(timeDisplay).length > 0) normalized.timeDisplay = timeDisplay;
  }

  if (raw.colors && typeof raw.colors === 'object') {
    const colors = {};
    if (typeof raw.colors.enableAdvancedColors === 'boolean')
      colors.enableAdvancedColors = raw.colors.enableAdvancedColors;
    if (raw.colors.thresholds && typeof raw.colors.thresholds === 'object')
      colors.thresholds = raw.colors.thresholds;
    if (Object.keys(colors).length > 0) normalized.colors = colors;
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

export function loadDashboardSettings({ storage = globalThis?.localStorage } = {}) {
  if (!storage?.getItem) return null;

  let raw;
  try {
    raw = storage.getItem(DASHBOARD_SETTINGS_STORAGE_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return normalizeDashboardSettings(parsed);
  } catch {
    return null;
  }
}

export function saveDashboardSettings({ settings, storage = globalThis?.localStorage } = {}) {
  if (!storage?.setItem || !settings || typeof settings !== 'object') return;

  try {
    storage.setItem(DASHBOARD_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors (quota exceeded, disabled storage, privacy mode).
  }
}
