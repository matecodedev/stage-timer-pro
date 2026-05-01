import { describe, expect, test } from 'vitest';
import {
  createDashboardMessagePayload,
  createSequenceMessagePayload,
  resolveMessageTtlMs,
} from './messages.js';

describe('dashboard message helpers', () => {
  test('uses persistent TTL when persistence is enabled', () => {
    expect(resolveMessageTtlMs({ persist: true, ttlSeconds: 4 })).toBe(86_400_000);
  });

  test('uses a minimum non-persistent TTL of one second', () => {
    expect(resolveMessageTtlMs({ persist: false, ttlSeconds: 0 })).toBe(1000);
    expect(resolveMessageTtlMs({ persist: false, ttlSeconds: 2 })).toBe(2000);
  });

  test('creates dashboard message payload preserving display options', () => {
    expect(
      createDashboardMessagePayload({
        text: 'BREAK',
        ttlMs: 2000,
        fontSize: 120,
        blinking: true,
        replaceTimer: true,
      }),
    ).toEqual({
      text: 'BREAK',
      ttlMs: 2000,
      fontSize: 120,
      blinking: true,
      replaceTimer: true,
      visible: true,
    });
  });

  test('creates sequence message payload with dashboard defaults', () => {
    expect(createSequenceMessagePayload({ text: 'Talk 1', ttlMs: 3000 })).toEqual({
      text: 'Talk 1',
      ttlMs: 3000,
      fontSize: 150,
      blinking: false,
      replaceTimer: false,
      visible: true,
    });
  });
});
