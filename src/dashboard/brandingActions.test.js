import { describe, expect, it, vi } from 'vitest';
import { createBrandingActions } from './brandingActions.js';

describe('createBrandingActions', () => {
  it('updates global branding and emits it to the stage', async () => {
    const context = createContext();
    const actions = createBrandingActions(context);
    const brandingOptions = createBrandingOptions();

    await actions.updateBranding(brandingOptions);

    expect(context.setCurrentGlobalBranding).toHaveBeenCalledWith(
      expect.objectContaining({
        logo: 'logo.png',
        logoSize: 42,
        blackBackground: true,
        showBranding: true,
      }),
    );
    expect(context.stageWindowClient.emitBranding).toHaveBeenCalledWith(
      expect.objectContaining({ logo: 'logo.png' }),
    );
  });

  it('logs branding emit errors without throwing', async () => {
    const context = createContext();
    context.stageWindowClient.emitBranding.mockRejectedValueOnce(new Error('stage failed'));
    const actions = createBrandingActions(context);

    await expect(actions.updateBranding(createBrandingOptions())).resolves.toBeUndefined();

    expect(context.logger.error).toHaveBeenCalledWith(
      '❌ Error sending branding:',
      expect.any(Error),
    );
  });
});

function createContext() {
  return {
    stageWindowClient: {
      emitBranding: vi.fn().mockResolvedValue(undefined),
    },
    setCurrentGlobalBranding: vi.fn(),
    logger: {
      log: vi.fn(),
      error: vi.fn(),
    },
  };
}

function createBrandingOptions() {
  return {
    colors: {
      background: '#000000',
      text: '#ffffff',
      accent: '#ff0000',
    },
    logo: 'logo.png',
    logoSize: 42,
    blackBackground: true,
    showBranding: true,
  };
}
