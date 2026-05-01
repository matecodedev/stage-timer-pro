import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { registerGlobalShortcuts } from '../listeners/globalShortcuts.js';

export function useGlobalShortcuts(handlers) {
  useEffect(() => {
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
  }, [handlers]);
}
