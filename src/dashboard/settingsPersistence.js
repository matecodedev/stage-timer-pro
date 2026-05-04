export const DASHBOARD_SETTINGS_STORAGE_KEY = 'stage-timer/dashboard-settings/v1';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeDashboardSettings(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const normalized = {};

  if (raw.timer && typeof raw.timer === 'object') {
    const timer = {};
    if (Number.isFinite(raw.timer.hours)) timer.hours = clamp(raw.timer.hours, 0, 23);
    if (Number.isFinite(raw.timer.minutes)) timer.minutes = clamp(raw.timer.minutes, 0, 59);
    if (Number.isFinite(raw.timer.seconds)) timer.seconds = clamp(raw.timer.seconds, 0, 59);
    if (Number.isFinite(raw.timer.warn)) timer.warn = clamp(raw.timer.warn, 0, 120);
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
    if (Number.isFinite(raw.message.ttl)) message.ttl = clamp(raw.message.ttl, 1, 3600);
    if (typeof raw.message.persist === 'boolean') message.persist = raw.message.persist;
    if (Number.isFinite(raw.message.fontSize))
      message.fontSize = clamp(raw.message.fontSize, 40, 400);
    if (typeof raw.message.blinking === 'boolean') message.blinking = raw.message.blinking;
    if (typeof raw.message.replaceTimer === 'boolean')
      message.replaceTimer = raw.message.replaceTimer;
    if (Object.keys(message).length > 0) normalized.message = message;
  }

  if (raw.branding && typeof raw.branding === 'object') {
    const branding = {};
    if (typeof raw.branding.logo === 'string') branding.logo = raw.branding.logo;
    if (Number.isFinite(raw.branding.logoSize))
      branding.logoSize = clamp(raw.branding.logoSize, 40, 600);
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
    if (raw.colors.thresholds && typeof raw.colors.thresholds === 'object') {
      const thresholds = {};
      if (Number.isFinite(raw.colors.thresholds.critical))
        thresholds.critical = clamp(raw.colors.thresholds.critical, 0, 120);
      if (Number.isFinite(raw.colors.thresholds.warning))
        thresholds.warning = clamp(raw.colors.thresholds.warning, 0, 120);
      if (Number.isFinite(raw.colors.thresholds.caution))
        thresholds.caution = clamp(raw.colors.thresholds.caution, 0, 120);
      if (Number.isFinite(raw.colors.thresholds.good))
        thresholds.good = clamp(raw.colors.thresholds.good, 0, 100);
      if (Object.keys(thresholds).length > 0) colors.thresholds = thresholds;
    }
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
