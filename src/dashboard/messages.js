import { createStageMessagePayload } from '../stage-contract/index.js';
import { DEFAULT_MESSAGE_OPTIONS } from './constants.js';

export function resolveMessageTtlMs({ persist, ttlSeconds }) {
  if (persist) {
    return DEFAULT_MESSAGE_OPTIONS.persistentTtlMs;
  }

  return Math.max(DEFAULT_MESSAGE_OPTIONS.minTtlMs, ttlSeconds * 1000);
}

export function createDashboardMessagePayload({ text, ttlMs, fontSize, blinking, replaceTimer }) {
  return createStageMessagePayload({
    text,
    ttlMs,
    fontSize,
    blinking,
    replaceTimer,
    visible: true,
  });
}

export function createSequenceMessagePayload({ text, ttlMs }) {
  return createStageMessagePayload({
    text,
    ttlMs,
    fontSize: 150,
    blinking: false,
    replaceTimer: false,
    visible: true,
  });
}
