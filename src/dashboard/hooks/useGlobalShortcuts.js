import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { isTauriRuntime } from '../../infrastructure/tauri/tauriRuntime.js';
import { registerGlobalShortcuts } from '../listeners/globalShortcuts.js';

export function useGlobalShortcuts(handlers, { runtimeWindow = globalThis.window } = {}) {
  useEffect(() => {
    if (!isTauriRuntime(runtimeWindow)) {
      return undefined;
    }

    let cleanup = () => {};
    let disposed = false;

    registerGlobalShortcuts({ listenEvent: listen, handlers }).then((unlisten) => {
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
  }, [handlers, runtimeWindow]);
}
