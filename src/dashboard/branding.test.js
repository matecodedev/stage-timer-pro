import { describe, expect, test } from 'vitest';
import { createDashboardBrandingPayload } from './branding.js';

describe('dashboard branding helpers', () => {
  test('creates the exact stage branding payload from dashboard state', () => {
    expect(
      createDashboardBrandingPayload({
        colors: { primary: '#111111' },
        logo: 'data:image/png;base64,abc',
        logoSize: 144,
        blackBackground: true,
        showBranding: false,
      }),
    ).toEqual({
      colors: { primary: '#111111' },
      logo: 'data:image/png;base64,abc',
      logoSize: 144,
      blackBackground: true,
      showBranding: false,
    });
  });
});
