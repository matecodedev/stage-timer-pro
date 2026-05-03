import { describe, expect, test } from 'vitest';
import {
  getPreviewBackgroundColor,
  getPreviewMessageState,
  getPreviewSequenceLabel,
  getPreviewTextColor,
} from './preview.js';

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

  test('shows individual mode when sequence index is missing or invalid', () => {
    expect(
      getPreviewSequenceLabel({
        sequenceMode: false,
        currentSequenceIndex: 0,
        sequenceLength: 2,
      }),
    ).toBe('Individual');
    expect(getPreviewSequenceLabel({ currentSequenceIndex: undefined, sequenceLength: 2 })).toBe(
      'Individual',
    );
    expect(getPreviewSequenceLabel({ currentSequenceIndex: Number.NaN, sequenceLength: 2 })).toBe(
      'Individual',
    );
    expect(getPreviewSequenceLabel({ currentSequenceIndex: 0, sequenceLength: 0 })).toBe(
      'Individual',
    );
  });

  test('formats active sequence position when index and length are valid', () => {
    expect(
      getPreviewSequenceLabel({ sequenceMode: true, currentSequenceIndex: 1, sequenceLength: 3 }),
    ).toBe('2/3');
  });

  test('hides preview message when no visible global message exists', () => {
    expect(getPreviewMessageState(null)).toEqual({ visible: false });
    expect(getPreviewMessageState({ visible: false, text: 'Hidden', fontSize: 180 })).toEqual({
      visible: false,
    });
  });

  test('shows visible global message text and scaled font in preview', () => {
    expect(getPreviewMessageState({ visible: true, text: 'QA mensaje', fontSize: 200 })).toEqual({
      visible: true,
      text: 'QA mensaje',
      fontSizePx: 20,
    });
  });

  test('caps preview message font size for large stage messages', () => {
    expect(getPreviewMessageState({ visible: true, text: 'Grande', fontSize: 600 })).toEqual({
      visible: true,
      text: 'Grande',
      fontSizePx: 24,
    });
  });
});
