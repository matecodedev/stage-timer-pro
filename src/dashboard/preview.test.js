import { describe, expect, test } from 'vitest';
import { getPreviewBackgroundColor, getPreviewTextColor } from './preview.js';

describe('dashboard preview helpers', () => {
  test('uses black background when enabled', () => {
    expect(getPreviewBackgroundColor({ blackBackground: true, color: 'green' })).toBe('#000000');
  });

  test('maps timer color states to preview colors', () => {
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'critical' })).toBe(
      '#DC2626',
    );
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'warning' })).toBe('#EF4444');
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'caution' })).toBe('#F59E0B');
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'good' })).toBe('#059669');
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'transition' })).toBe(
      '#10B981',
    );
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'unknown' })).toBe('#1F2937');
  });

  test('keeps preview text white', () => {
    expect(getPreviewTextColor()).toBe('#FFFFFF');
  });
});
