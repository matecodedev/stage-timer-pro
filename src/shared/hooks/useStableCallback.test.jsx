import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { useStableCallback } from './useStableCallback';

function createHookHarness() {
  const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  const originalDispatcher = internals.ReactCurrentDispatcher.current;
  const hooks = [];
  let hookIndex = 0;

  const dispatcher = {
    useCallback(callback, deps) {
      const index = hookIndex;
      hookIndex += 1;
      const previous = hooks[index];

      if (
        previous &&
        previous.deps.length === deps.length &&
        previous.deps.every((dep, depIndex) => Object.is(dep, deps[depIndex]))
      ) {
        return previous.callback;
      }

      hooks[index] = { callback, deps };
      return callback;
    },
    useRef(initialValue) {
      const index = hookIndex;
      hookIndex += 1;

      if (!hooks[index]) {
        hooks[index] = { current: initialValue };
      }

      return hooks[index];
    },
  };

  return {
    render(renderHook) {
      hookIndex = 0;
      internals.ReactCurrentDispatcher.current = dispatcher;
      try {
        return renderHook();
      } finally {
        internals.ReactCurrentDispatcher.current = originalDispatcher;
      }
    },
    restore() {
      internals.ReactCurrentDispatcher.current = originalDispatcher;
    },
  };
}

describe('useStableCallback', () => {
  let harness;

  afterEach(() => {
    harness?.restore();
    harness = null;
  });

  test('keeps callback identity stable between renders and runs the latest implementation', () => {
    const calls = [];
    harness = createHookHarness();

    const firstCallback = harness.render(() =>
      useStableCallback(() => {
        calls.push('first');
        return 'first';
      }),
    );

    expect(firstCallback()).toBe('first');

    const secondCallback = harness.render(() =>
      useStableCallback(() => {
        calls.push('second');
        return 'second';
      }),
    );

    expect(secondCallback).toBe(firstCallback);
    expect(firstCallback()).toBe('second');
    expect(calls).toEqual(['first', 'second']);
  });
});
