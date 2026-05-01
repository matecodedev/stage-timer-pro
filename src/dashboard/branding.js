import { createStageBrandingPayload } from '../stage-contract/index.js';

export function createDashboardBrandingPayload({
  colors,
  logo,
  logoSize,
  blackBackground,
  showBranding,
}) {
  return createStageBrandingPayload({
    colors,
    logo,
    logoSize,
    blackBackground,
    showBranding,
  });
}
