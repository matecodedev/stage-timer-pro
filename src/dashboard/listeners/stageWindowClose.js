export async function registerStageWindowCloseOnExit({ appWindow, stageClient, logger = console }) {
  try {
    const unlisten = await appWindow.onCloseRequested(async (_event) => {
      try {
        await stageClient.close();
      } catch (error) {
        logger.log('Could not close stage window:', error);
      }
    });

    return () => unlisten();
  } catch (error) {
    logger.log('Could not setup close listener:', error);
    return () => {};
  }
}
