import { GLOBAL_SHORTCUT_EVENT } from '../../stage-contract/index.js';

export async function registerGlobalShortcuts({ listenEvent, handlers, logger = console }) {
  try {
    const unlisten = await listenEvent(GLOBAL_SHORTCUT_EVENT, (event) => {
      const action = event.payload;
      logger.log('🔥 Atajo global activado:', action);

      switch (action) {
        case 'toggle-timer':
          handlers.toggleTimer();
          break;
        case 'reset-timer':
          handlers.resetTimer();
          break;
        case 'toggle-stage-fullscreen':
          handlers.toggleStageFullscreen();
          break;
        default:
          logger.log('Acción de atajo global no reconocida:', action);
      }
    });

    logger.log('✅ Atajos globales configurados');
    return () => unlisten();
  } catch (error) {
    logger.error('❌ Error configurando atajos globales:', error);
    return () => {};
  }
}
