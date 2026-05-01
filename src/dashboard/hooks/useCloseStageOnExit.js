import { useEffect } from 'react';
import { registerStageWindowCloseOnExit } from '../listeners/stageWindowClose.js';

async function getDefaultAppWindow() {
  const { appWindow } = await import('@tauri-apps/api/window');
  return appWindow;
}

export function useCloseStageOnExit(stageClient) {
  useEffect(() => {
    let cleanup = () => {};
    let disposed = false;

    getDefaultAppWindow()
      .then((appWindow) => registerStageWindowCloseOnExit({ appWindow, stageClient }))
      .then((unlisten) => {
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
  }, [stageClient]);
}
