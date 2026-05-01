const parseJsonPayload = (payload) => {
  try {
    return typeof payload === 'string' ? JSON.parse(payload) : payload;
  } catch {
    return null;
  }
};

const isObjectPayload = (payload) =>
  payload !== null && typeof payload === 'object' && !Array.isArray(payload);

export const parseStageStatePayload = (payload) => {
  const parsed = parseJsonPayload(payload);

  if (
    !isObjectPayload(parsed) ||
    typeof parsed.remainingMs !== 'number' ||
    typeof parsed.running !== 'boolean'
  ) {
    return null;
  }

  return parsed;
};

export const parseStageMessagePayload = (payload) => {
  const parsed = parseJsonPayload(payload);

  if (!isObjectPayload(parsed) || typeof parsed.text !== 'string') {
    return null;
  }

  return parsed;
};

export const parseStageBrandingPayload = (payload) => {
  const parsed = parseJsonPayload(payload);

  if (!isObjectPayload(parsed)) {
    return null;
  }

  return parsed;
};
