import { createDashboardBrandingPayload } from './branding.js';

export function createBrandingActions({
  stageWindowClient,
  setCurrentGlobalBranding,
  logger = console,
}) {
  const updateBranding = async ({ colors, logo, logoSize, blackBackground, showBranding }) => {
    const brandingData = createDashboardBrandingPayload({
      colors,
      logo,
      logoSize,
      blackBackground,
      showBranding,
    });

    logger.log('🔄 Updating branding immediately:', { logoSize, blackBackground, showBranding });
    setCurrentGlobalBranding(brandingData);

    try {
      await stageWindowClient.emitBranding(brandingData);
      logger.log('✅ Branding sent successfully');
    } catch (err) {
      logger.error('❌ Error sending branding:', err);
    }
  };

  return {
    updateBranding,
  };
}
