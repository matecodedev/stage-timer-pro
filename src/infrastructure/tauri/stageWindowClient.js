import { STAGE_EVENTS } from '../../stage-contract/index.js';
import { createNoopTauriCommandLogger, isTauriRuntime } from './tauriRuntime.js';

async function getDefaultInvoke() {
  const { invoke } = await import('@tauri-apps/api');
  return invoke;
}

async function resolveInvoke(invoke) {
  return invoke ?? getDefaultInvoke();
}

function shouldSkipNativeCommand({ invoke, runtimeWindow }) {
  return !invoke && !isTauriRuntime(runtimeWindow);
}

async function emitToStage({ invoke, runtimeWindow, skipNativeCommand }, event, payload) {
  if (shouldSkipNativeCommand({ invoke, runtimeWindow })) {
    skipNativeCommand('emit_to_stage');
    return undefined;
  }

  const resolvedInvoke = await resolveInvoke(invoke);

  return resolvedInvoke('emit_to_stage', {
    event,
    payload: JSON.stringify(payload),
  });
}

export function createStageWindowClient({
  invoke,
  runtimeWindow = globalThis.window,
  logger = console,
} = {}) {
  const commandContext = {
    invoke,
    runtimeWindow,
    skipNativeCommand: createNoopTauriCommandLogger(logger),
  };

  async function runNativeCommand(commandName, args) {
    if (shouldSkipNativeCommand({ invoke, runtimeWindow })) {
      commandContext.skipNativeCommand(commandName);
      return undefined;
    }

    const resolvedInvoke = await resolveInvoke(invoke);
    return args === undefined ? resolvedInvoke(commandName) : resolvedInvoke(commandName, args);
  }

  return {
    emitState(payload) {
      return emitToStage(commandContext, STAGE_EVENTS.STATE, payload);
    },

    emitMessage(payload) {
      return emitToStage(commandContext, STAGE_EVENTS.MESSAGE, payload);
    },

    emitBranding(payload) {
      return emitToStage(commandContext, STAGE_EVENTS.BRANDING, payload);
    },

    async hideMessage() {
      return runNativeCommand('emit_to_stage', {
        event: STAGE_EVENTS.HIDE_MESSAGE,
        payload: '{}',
      });
    },

    async positionOnSecondaryMonitor() {
      return runNativeCommand('position_stage_on_secondary_monitor');
    },

    async toggleFullscreen(on) {
      return runNativeCommand('toggle_stage_fullscreen', { on });
    },

    async close() {
      return runNativeCommand('close_stage_window');
    },
  };
}

export const stageWindowClient = createStageWindowClient();
