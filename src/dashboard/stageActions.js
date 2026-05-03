export function createStageActions({
  stageWindowClient,
  runTauriCommand,
  getIsFullscreen,
  onFullscreenChange,
  sendStageData,
  createReadyDelayMs,
  sendDataDelayMs,
  positionRetries = 2,
  retryDelayMs = 150,
  onStageOpenStateChange = () => {},
  logger = console,
}) {
  const delay = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));
  let openInProgress = false;

  const toggleStageFullscreen = async () => {
    try {
      const nextFullscreenState = !getIsFullscreen();
      await stageWindowClient.toggleFullscreen(nextFullscreenState);
      onFullscreenChange(nextFullscreenState);
    } catch (error) {
      logger.log('Error toggling stage fullscreen:', error);
    }
  };

  const openFullscreen = async () => {
    if (openInProgress) {
      logger.log('Stage open already in progress');
      onStageOpenStateChange('busy');
      return;
    }

    openInProgress = true;
    onStageOpenStateChange('opening');

    try {
      logger.log('Opening stage window...');

      await runTauriCommand('create_stage_window');
      logger.log('Stage window created');

      await delay(createReadyDelayMs);

      let positioned = false;
      for (let attempt = 1; attempt <= Math.max(1, positionRetries); attempt += 1) {
        try {
          await stageWindowClient.positionOnSecondaryMonitor();
          logger.log('Stage positioned on secondary monitor');
          positioned = true;
          break;
        } catch (error) {
          logger.warn?.(
            `Failed to position stage on secondary monitor (attempt ${attempt}/${Math.max(1, positionRetries)})`,
            error,
          );
          if (attempt < Math.max(1, positionRetries)) {
            await delay(retryDelayMs);
          }
        }
      }

      if (!positioned) {
        logger.warn?.('Stage positioning retries exhausted; continuing without reposition');
      }

      await runTauriCommand('focus_stage');
      logger.log('Stage focused');

      setTimeout(async () => {
        try {
          await sendStageData();
        } catch (error) {
          logger.error('Error sending data to stage:', error);
        }
      }, sendDataDelayMs);
      onStageOpenStateChange('ready');
    } catch (error) {
      onStageOpenStateChange('error');
      logger.error('Error opening stage window:', error);
    } finally {
      openInProgress = false;
    }
  };

  return {
    toggleStageFullscreen,
    openFullscreen,
  };
}
