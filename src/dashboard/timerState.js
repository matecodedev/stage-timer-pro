export function createStoppedTimerState({ remainingMs }) {
  return {
    running: false,
    remainingMs,
    color: 'green',
  };
}
