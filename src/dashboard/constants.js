export const DEFAULT_TIMER_INPUTS = Object.freeze({
  hours: 0,
  minutes: 15,
  seconds: 0,
  warn: 5,
  negativeMode: false,
});

export const DEFAULT_COLOR_THRESHOLDS = Object.freeze({
  critical: 2,
  warning: 5,
  caution: 10,
  good: 25,
});

export const DEFAULT_TIME_CONFIG = Object.freeze({
  showCurrentTime: true,
  timeFormat24h: true,
  showSeconds: true,
  timePosition: 'top-right',
});

export const TIME_POSITIONS = Object.freeze([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]);

export const DEFAULT_MESSAGE_OPTIONS = Object.freeze({
  messageTtlSeconds: 4,
  fontSize: 200,
  blinking: false,
  replaceTimer: false,
  persistentTtlMs: 24 * 60 * 60 * 1000,
  minTtlMs: 1000,
});

export const DEFAULT_SEQUENCE_TIMER_INPUTS = Object.freeze({
  name: '',
  hours: 0,
  minutes: 5,
  seconds: 0,
});

export const PRESET_MESSAGES = Object.freeze([
  'TIME OUT',
  'BREAK',
  '5 MINUTOS',
  'ÚLTIMO MINUTO',
  'FINALIZANDO',
  'PREPARARSE',
]);

export const DEFAULT_BRAND_COLORS = Object.freeze({
  primary: '#3B82F6',
  secondary: '#10B981',
  background: '#1F2937',
  accent: '#F59E0B',
});

export const DEFAULT_BRANDING = Object.freeze({
  logo: '',
  logoSize: 120,
  blackBackground: false,
  showBranding: true,
});

export const STAGE_AUTO_POSITION_DELAY_MS = 1000;
export const STAGE_CREATE_READY_DELAY_MS = 500;
export const STAGE_SEND_DATA_DELAY_MS = 800;
export const SEQUENCE_AUTOSTART_DELAY_MS = 100;
export const SEQUENCE_MESSAGE_TTL_MS = 3000;
export const SEQUENCE_COMPLETED_TTL_MS = 5000;
export const TIMER_TICK_INTERVAL_MS = 100;
