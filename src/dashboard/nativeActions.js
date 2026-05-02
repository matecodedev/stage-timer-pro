export function createNativeActions({ runTauriCommand, logger = console }) {
  const sendNotification = async (title, body, icon = null) => {
    try {
      await runTauriCommand('send_notification', { title, body, icon });
    } catch (error) {
      logger.error('Error sending notification:', error);
    }
  };

  const updateBadge = async (label) => {
    try {
      await runTauriCommand('set_badge_label', { label });
    } catch (error) {
      logger.error('Error updating badge:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const result = await runTauriCommand('request_notification_permission');
      logger.log('Notification permission:', result);
      return typeof result === 'string' && result.includes('granted');
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const setStageForCapture = async (width, height) => {
    try {
      await runTauriCommand('set_stage_for_capture', { width, height });
      logger.log(`✅ Stage configurado para captura: ${width}x${height}`);

      await sendNotification(
        'Stage Timer - Video Capture',
        `Ventana configurada para captura de video: ${width}x${height}`,
      );
    } catch (error) {
      logger.error('Error configurando stage para captura:', error);
    }
  };

  const resetStageWindow = async () => {
    try {
      await runTauriCommand('reset_stage_window');
      logger.log('✅ Stage window reset to normal mode');

      await sendNotification('Stage Timer', 'Ventana restaurada al modo normal');
    } catch (error) {
      logger.error('Error resetting stage window:', error);
    }
  };

  return {
    sendNotification,
    updateBadge,
    requestNotificationPermission,
    setStageForCapture,
    resetStageWindow,
  };
}
