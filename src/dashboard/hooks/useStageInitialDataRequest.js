import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { registerStageInitialDataRequest } from '../listeners/stageInitialData.js';

export function useStageInitialDataRequest(onRequest) {
  useEffect(() => {
    let cleanup = () => {};
    let disposed = false;

    registerStageInitialDataRequest({ listenEvent: listen, onRequest }).then((unlisten) => {
      if (disposed) {
        unlisten();
        return;
      }
      cleanup = unlisten;
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [onRequest]);
}
