export function createStageActions({
  stageWindowClient,
  runTauriCommand,
  getIsFullscreen,
  onFullscreenChange,
  sendStageData,
  createReadyDelayMs,
  sendDataDelayMs,
  logger = console,
}) {
  const delay = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));

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
    try {
      logger.log('Opening stage window...');

      await runTauriCommand('create_stage_window');
      logger.log('Stage window created');

      await delay(createReadyDelayMs);

      await stageWindowClient.positionOnSecondaryMonitor();
      logger.log('Stage positioned on secondary monitor');

      await runTauriCommand('focus_stage');
      logger.log('Stage focused');

      setTimeout(async () => {
        try {
          await sendStageData();
        } catch (error) {
          logger.error('Error sending data to stage:', error);
        }
      }, sendDataDelayMs);
    } catch (error) {
      logger.error('Error opening stage window:', error);
    }
  };

  return {
    toggleStageFullscreen,
    openFullscreen,
  };
}
