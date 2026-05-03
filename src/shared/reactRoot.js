const REACT_ROOT_KEY = '__stageTimerReactRoot';

export function getOrCreateReactRoot(container, createRoot) {
  if (!container[REACT_ROOT_KEY]) {
    container[REACT_ROOT_KEY] = createRoot(container);
  }

  return container[REACT_ROOT_KEY];
}
