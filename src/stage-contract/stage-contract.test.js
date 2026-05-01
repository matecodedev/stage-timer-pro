import { describe, expect, test } from 'vitest';
import {
  GLOBAL_SHORTCUT_EVENT,
  STAGE_EVENTS,
  createStageBrandingPayload,
  createStageMessagePayload,
  createStageStatePayload,
  parseStageBrandingPayload,
  parseStageMessagePayload,
  parseStageStatePayload,
} from './index.js';

describe('stage contract events', () => {
  test('exposes canonical stage event names', () => {
    expect(STAGE_EVENTS.STATE).toBe('stage:state');
    expect(STAGE_EVENTS.MESSAGE).toBe('stage:message');
    expect(STAGE_EVENTS.BRANDING).toBe('stage:branding');
    expect(STAGE_EVENTS.HIDE_MESSAGE).toBe('stage:hide-message');
    expect(STAGE_EVENTS.REQUEST_INITIAL_DATA).toBe('stage:request-initial-data');
  });

  test('exposes canonical global shortcut event name', () => {
    expect(GLOBAL_SHORTCUT_EVENT).toBe('global-shortcut');
  });
});

describe('stage contract payload creators', () => {
  test('creates a normalized stage state payload with the full contract', () => {
    const payload = createStageStatePayload({
      remainingMs: 30_000,
      running: true,
      warnMs: 10_000,
      negativeMode: false,
      color: 'good',
      colorInfo: { state: 'good' },
      totalMs: 60_000,
      sequenceMode: true,
      currentSequenceIndex: 1,
      totalSequenceTimers: 3,
      currentTimerName: 'Talk 2',
      timeConfig: { showCurrentTime: true },
    });

    expect(payload).toEqual({
      remainingMs: 30_000,
      running: true,
      warnMs: 10_000,
      negativeMode: false,
      color: 'good',
      colorInfo: { state: 'good' },
      totalMs: 60_000,
      sequenceMode: true,
      currentSequenceIndex: 1,
      totalSequenceTimers: 3,
      currentTimerName: 'Talk 2',
      timeConfig: { showCurrentTime: true },
    });
  });

  test('creates a normalized stage message payload with planned defaults', () => {
    expect(createStageMessagePayload({ text: 'BREAK' })).toEqual({
      text: 'BREAK',
      ttlMs: 4000,
      fontSize: 200,
      blinking: false,
      replaceTimer: false,
      visible: true,
    });
  });

  test('preserves provided stage message display options', () => {
    expect(
      createStageMessagePayload({
        text: 'BACK IN 5',
        ttlMs: 1000,
        fontSize: 120,
        blinking: true,
        replaceTimer: true,
        visible: false,
      }),
    ).toEqual({
      text: 'BACK IN 5',
      ttlMs: 1000,
      fontSize: 120,
      blinking: true,
      replaceTimer: true,
      visible: false,
    });
  });

  test('creates a normalized branding payload', () => {
    expect(
      createStageBrandingPayload({
        colors: { primary: '#fff' },
        logo: 'https://example.com/logo.png',
        logoSize: 100,
        blackBackground: true,
        showBranding: false,
      }),
    ).toEqual({
      colors: { primary: '#fff' },
      logo: 'https://example.com/logo.png',
      logoSize: 100,
      blackBackground: true,
      showBranding: false,
    });
  });
});

describe('stage contract payload parsers', () => {
  const statePayload = {
    remainingMs: 30_000,
    running: true,
    warnMs: 10_000,
    negativeMode: false,
    color: 'good',
    colorInfo: { state: 'good' },
    totalMs: 60_000,
    sequenceMode: true,
    currentSequenceIndex: 1,
    totalSequenceTimers: 3,
    currentTimerName: 'Talk 2',
    timeConfig: { showCurrentTime: true },
  };

  test('parses valid stage state payload JSON with the full contract', () => {
    expect(parseStageStatePayload(JSON.stringify(statePayload))).toEqual(statePayload);
  });

  test('accepts already-parsed stage state payload objects', () => {
    expect(parseStageStatePayload(statePayload)).toEqual(statePayload);
  });

  test('returns null for invalid stage state payloads', () => {
    expect(parseStageStatePayload('{"remainingMs":"30000","running":true}')).toBeNull();
    expect(parseStageStatePayload('{"remainingMs":30000,"running":"true"}')).toBeNull();
    expect(parseStageStatePayload('{bad json')).toBeNull();
  });

  test('parses valid stage message payload JSON', () => {
    expect(parseStageMessagePayload('{"text":"HELLO","ttlMs":1000}')).toEqual({
      text: 'HELLO',
      ttlMs: 1000,
    });
  });

  test('accepts already-parsed stage message payload objects', () => {
    expect(parseStageMessagePayload({ text: 'HELLO', ttlMs: 1000 })).toEqual({
      text: 'HELLO',
      ttlMs: 1000,
    });
  });

  test('returns null for invalid stage message payloads', () => {
    expect(parseStageMessagePayload('{"text":123}')).toBeNull();
    expect(parseStageMessagePayload('{bad json')).toBeNull();
  });

  test('parses valid stage branding payload JSON', () => {
    const branding = {
      colors: { primary: '#fff' },
      logo: 'https://example.com/logo.png',
      logoSize: 100,
      blackBackground: true,
      showBranding: false,
    };

    expect(parseStageBrandingPayload(JSON.stringify(branding))).toEqual(branding);
  });

  test('accepts already-parsed stage branding payload objects', () => {
    const branding = { colors: { primary: '#fff' }, showBranding: true };

    expect(parseStageBrandingPayload(branding)).toEqual(branding);
  });

  test('returns null for invalid stage branding payloads', () => {
    expect(parseStageBrandingPayload('null')).toBeNull();
    expect(parseStageBrandingPayload('{bad json')).toBeNull();
  });
});
