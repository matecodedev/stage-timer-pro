import { useCallback } from 'react';
import { useLatest } from './useLatest';

export function useStableCallback(callback) {
  const callbackRef = useLatest(callback);

  return useCallback((...args) => callbackRef.current(...args), [callbackRef]);
}
