import { STAGE_EVENTS } from '../../stage-contract/index.js';

export async function registerStageInitialDataRequest({
  listenEvent,
  onRequest,
  logger = console,
}) {
  try {
    const unlisten = await listenEvent(STAGE_EVENTS.REQUEST_INITIAL_DATA, onRequest);
    return () => unlisten();
  } catch (error) {
    logger.log('Could not setup stage listener:', error);
    return () => {};
  }
}
