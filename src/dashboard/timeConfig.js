export function calculateTotalMs({ hours, minutes, seconds }) {
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

export function createTimeConfig({ showCurrentTime, timeFormat24h, showSeconds, timePosition }) {
  return { showCurrentTime, timeFormat24h, showSeconds, timePosition };
}

export function createColorThresholds(inputs) {
  if (!inputs.enableAdvancedColors) {
    return null;
  }

  return {
    critical: inputs.colorThresholds.critical * 60_000,
    warning: inputs.colorThresholds.warning * 60_000,
    caution: inputs.colorThresholds.caution * 60_000,
    good: inputs.colorThresholds.good / 100,
  };
}

export function formatDashboardTime(milliseconds) {
  if (!milliseconds || milliseconds < 0) return '00:00:00';

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
