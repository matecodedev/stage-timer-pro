export function registerDashboardKeyboardShortcuts({ target = window, handlers }) {
  const onKeydown = (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      if (handlers.isTimerRunning()) {
        handlers.pause();
      } else {
        handlers.start();
      }
    }

    if (event.key === 's' || event.key === 'S') handlers.stop();
    if (event.key === '+') handlers.addMin(1);
    if (event.key === '-') handlers.addMin(-1);
    if ((event.ctrlKey || event.metaKey) && event.key === '+') handlers.addMin(5);
    if ((event.ctrlKey || event.metaKey) && event.key === '-') handlers.addMin(-5);
    if (event.key === 'm' || event.key === 'M') handlers.sendMessage();
    if (event.key === 'h' || event.key === 'H') handlers.hideMessage();
  };

  target.addEventListener('keydown', onKeydown);
  return () => target.removeEventListener('keydown', onKeydown);
}
