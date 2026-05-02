import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { isTauriRuntime } from '../../infrastructure/tauri/tauriRuntime.js';
import { registerStageInitialDataRequest } from '../listeners/stageInitialData.js';

export function useStageInitialDataRequest(onRequest, { runtimeWindow = globalThis.window } = {}) {
  useEffect(() => {
    if (!isTauriRuntime(runtimeWindow)) {
      return undefined;
    }

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
  }, [onRequest, runtimeWindow]);
}
