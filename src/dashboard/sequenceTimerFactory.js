export function createSequenceCountdown({ Countdown, createColorThresholds, timer, inputs }) {
  return new Countdown({
    initialMs: timer.totalMs,
    warnMs: inputs.warn * 60_000,
    negativeMode: inputs.neg,
    colorThresholds: createColorThresholds(inputs),
  });
}
