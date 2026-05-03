import { describe, expect, test, vi } from 'vitest';
import { getOrCreateReactRoot } from './reactRoot.js';

describe('getOrCreateReactRoot', () => {
  test('creates a root once and reuses it on later renders', () => {
    const container = {};
    const root = { render: vi.fn() };
    const createRoot = vi.fn(() => root);

    expect(getOrCreateReactRoot(container, createRoot)).toBe(root);
    expect(getOrCreateReactRoot(container, createRoot)).toBe(root);
    expect(createRoot).toHaveBeenCalledOnce();
  });
});
