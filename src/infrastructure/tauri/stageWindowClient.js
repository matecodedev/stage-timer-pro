import { STAGE_EVENTS } from '../../stage-contract/index.js';

async function getDefaultInvoke() {
  const { invoke } = await import('@tauri-apps/api');
  return invoke;
}

async function resolveInvoke(invoke) {
  return invoke ?? getDefaultInvoke();
}

async function emitToStage(invoke, event, payload) {
  const resolvedInvoke = await resolveInvoke(invoke);

  return resolvedInvoke('emit_to_stage', {
    event,
    payload: JSON.stringify(payload),
  });
}

export function createStageWindowClient({ invoke } = {}) {
  return {
    emitState(payload) {
      return emitToStage(invoke, STAGE_EVENTS.STATE, payload);
    },

    emitMessage(payload) {
      return emitToStage(invoke, STAGE_EVENTS.MESSAGE, payload);
    },

    emitBranding(payload) {
      return emitToStage(invoke, STAGE_EVENTS.BRANDING, payload);
    },

    async hideMessage() {
      const resolvedInvoke = await resolveInvoke(invoke);

      return resolvedInvoke('emit_to_stage', {
        event: STAGE_EVENTS.HIDE_MESSAGE,
        payload: '{}',
      });
    },

    async positionOnSecondaryMonitor() {
      const resolvedInvoke = await resolveInvoke(invoke);

      return resolvedInvoke('position_stage_on_secondary_monitor');
    },

    async toggleFullscreen(on) {
      const resolvedInvoke = await resolveInvoke(invoke);

      return resolvedInvoke('toggle_stage_fullscreen', { on });
    },

    async close() {
      const resolvedInvoke = await resolveInvoke(invoke);

      return resolvedInvoke('close_stage_window');
    },
  };
}

export const stageWindowClient = createStageWindowClient();
