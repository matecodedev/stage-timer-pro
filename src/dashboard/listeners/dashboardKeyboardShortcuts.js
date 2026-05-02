export function registerDashboardKeyboardShortcuts({ target = window, handlers }) {
  const onKeydown = (event) => {
    if (isEditableTarget(event.target)) return;

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

function isEditableTarget(target) {
  if (!target) return false;
  if (target.isContentEditable) return true;

  const tagName = target.tagName?.toUpperCase();
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}
