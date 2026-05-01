export function createStageStatePayload({
  remainingMs,
  running,
  warnMs,
  negativeMode,
  color,
  colorInfo,
  totalMs,
  sequenceMode,
  currentSequenceIndex,
  totalSequenceTimers,
  currentTimerName,
  timeConfig,
}) {
  return {
    remainingMs,
    running,
    warnMs,
    negativeMode,
    color,
    colorInfo,
    totalMs,
    sequenceMode,
    currentSequenceIndex,
    totalSequenceTimers,
    currentTimerName,
    timeConfig,
  };
}

export function createStageMessagePayload({
  text,
  ttlMs = 4000,
  fontSize = 200,
  blinking = false,
  replaceTimer = false,
  visible = true,
}) {
  return {
    text,
    ttlMs,
    fontSize,
    blinking,
    replaceTimer,
    visible,
  };
}

export function createStageBrandingPayload({
  colors,
  logo,
  logoSize,
  blackBackground,
  showBranding,
}) {
  return {
    colors,
    logo,
    logoSize,
    blackBackground,
    showBranding,
  };
}
