export function getPreviewBackgroundColor({ blackBackground, color }) {
  if (blackBackground) return '#000000';
  if (color === 'critical') return '#DC2626';
  if (color === 'warning') return '#EF4444';
  if (color === 'caution') return '#F59E0B';
  if (color === 'good' || color === 'green') return '#059669';
  if (color === 'transition') return '#10B981';
  return '#1F2937';
}

export function getPreviewTextColor() {
  return '#FFFFFF';
}

export function getPreviewSequenceLabel({ sequenceMode, currentSequenceIndex, sequenceLength }) {
  if (
    !sequenceMode ||
    !Number.isInteger(currentSequenceIndex) ||
    !Number.isInteger(sequenceLength) ||
    sequenceLength <= 0
  ) {
    return 'Individual';
  }

  return `${currentSequenceIndex + 1}/${sequenceLength}`;
}
