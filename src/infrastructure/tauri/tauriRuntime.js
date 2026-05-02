export function isTauriRuntime(runtimeWindow = globalThis.window) {
  return typeof runtimeWindow?.__TAURI_IPC__ === 'function';
}

export function createNoopTauriCommandLogger(logger = console) {
  return (commandName) => {
    logger.debug?.(`Skipping Tauri command outside runtime: ${commandName}`);
  };
}
