# Stage Contract Adapters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Isolate Stage window event contracts and Tauri IPC calls so the dashboard and stage communicate through tested, explicit boundaries instead of scattered strings and raw JSON parsing.

**Architecture:** Add a small `stage-contract` module for event names, payload creation, and safe payload parsing. Add a `stageWindowClient` adapter that owns Tauri `invoke(...)` calls for Stage operations. Migrate `src/main.jsx` and `src/stage.jsx` incrementally without changing visible behavior.

**Tech Stack:** React 18, Vite 8, Tauri 1, Vitest 4, ESLint 10, Prettier 3, JavaScript ES modules.

---

## Scope

### In scope

- Add tested Stage event constants.
- Add tested payload creators/parsers.
- Add tested Tauri Stage adapter using dependency injection for `invoke`.
- Replace raw Stage event strings in `src/main.jsx` and `src/stage.jsx`.
- Replace direct `emit_to_stage` calls in `src/main.jsx` with `stageWindowClient` calls.
- Fix the runtime bug where `main.jsx` calls unregistered Tauri command `get_window`.
- Verify with `npm run check`.

### Out of scope

- No build command.
- No React 19 migration.
- No Tauri 2 migration.
- No TypeScript migration.
- No dashboard redesign.
- No large component split.
- No Tauri permission hardening yet.

---

## File Structure

### Create

- `src/stage-contract/events.js` — canonical names for Stage and global shortcut events.
- `src/stage-contract/payloads.js` — pure functions that normalize Stage payloads.
- `src/stage-contract/parsers.js` — safe JSON parsing and payload parsing helpers used by `stage.jsx`.
- `src/stage-contract/index.js` — public exports for the contract module.
- `src/stage-contract/stage-contract.test.js` — Vitest coverage for events, payloads, and parsers.
- `src/infrastructure/tauri/stageWindowClient.js` — Tauri IPC adapter for Stage operations.
- `src/infrastructure/tauri/stageWindowClient.test.js` — Vitest coverage for adapter command/event calls.

### Modify

- `src/main.jsx` — import `stageWindowClient`, `STAGE_EVENTS`, and payload creators; replace raw emits and fix fullscreen toggle.
- `src/stage.jsx` — import `STAGE_EVENTS` and parsers; replace raw `JSON.parse` and raw event strings.

---

## Task 1: Stage event constants

**Files:**

- Create: `src/stage-contract/events.js`
- Create: `src/stage-contract/index.js`
- Create: `src/stage-contract/stage-contract.test.js`

- [ ] **Step 1: Write failing tests for canonical event names**

Add this initial test file:

```js
import { describe, expect, test } from 'vitest';
import { GLOBAL_SHORTCUT_EVENT, STAGE_EVENTS } from './index.js';

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
```

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
npm_config_cache=.npm-cache npx vitest run src/stage-contract/stage-contract.test.js
```

Expected: FAIL because `src/stage-contract/index.js` does not exist.

- [ ] **Step 3: Add minimal event constants**

Create `src/stage-contract/events.js`:

```js
export const STAGE_EVENTS = Object.freeze({
  STATE: 'stage:state',
  MESSAGE: 'stage:message',
  BRANDING: 'stage:branding',
  HIDE_MESSAGE: 'stage:hide-message',
  REQUEST_INITIAL_DATA: 'stage:request-initial-data',
});

export const GLOBAL_SHORTCUT_EVENT = 'global-shortcut';
```

Create `src/stage-contract/index.js`:

```js
export { GLOBAL_SHORTCUT_EVENT, STAGE_EVENTS } from './events.js';
```

- [ ] **Step 4: Run test to verify GREEN**

Run:

```bash
npm_config_cache=.npm-cache npx vitest run src/stage-contract/stage-contract.test.js
```

Expected: PASS, 2 tests.

---

## Task 2: Payload creators and parsers

**Files:**

- Create: `src/stage-contract/payloads.js`
- Create: `src/stage-contract/parsers.js`
- Modify: `src/stage-contract/index.js`
- Modify: `src/stage-contract/stage-contract.test.js`

- [ ] **Step 1: Add failing tests for payload normalization and safe parsing**

Append these tests to `src/stage-contract/stage-contract.test.js`:

```js
import {
  createStageBrandingPayload,
  createStageMessagePayload,
  createStageStatePayload,
  parseStageBrandingPayload,
  parseStageMessagePayload,
  parseStageStatePayload,
} from './index.js';

describe('stage payload creators', () => {
  test('creates a normalized stage state payload', () => {
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

  test('creates a normalized stage message payload', () => {
    expect(createStageMessagePayload({ text: 'BREAK' })).toEqual({
      text: 'BREAK',
      ttlMs: 4000,
      fontSize: 200,
      blinking: false,
      replaceTimer: false,
      visible: true,
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

describe('stage payload parsers', () => {
  test('parses valid JSON payloads', () => {
    const payload = parseStageMessagePayload('{"text":"HELLO","ttlMs":1000}');

    expect(payload.text).toBe('HELLO');
    expect(payload.ttlMs).toBe(1000);
  });

  test('returns fallback payload when JSON is invalid', () => {
    expect(parseStageMessagePayload('{bad json')).toEqual(null);
    expect(parseStageStatePayload('{bad json')).toEqual(null);
    expect(parseStageBrandingPayload('{bad json')).toEqual(null);
  });
});
```

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
npm_config_cache=.npm-cache npx vitest run src/stage-contract/stage-contract.test.js
```

Expected: FAIL because payload functions are not exported.

- [ ] **Step 3: Add payload creators**

Create `src/stage-contract/payloads.js`:

```js
export function createStageStatePayload({
  remainingMs,
  running,
  warnMs,
  negativeMode,
  color,
  colorInfo,
  totalMs,
  sequenceMode,
  currentSequenceIndex,
  totalSequenceTimers,
  currentTimerName,
  timeConfig,
}) {
  return {
    remainingMs,
    running,
    warnMs,
    negativeMode,
    color,
    colorInfo,
    totalMs,
    sequenceMode,
    currentSequenceIndex,
    totalSequenceTimers,
    currentTimerName,
    timeConfig,
  };
}

export function createStageMessagePayload({
  text,
  ttlMs = 4000,
  fontSize = 200,
  blinking = false,
  replaceTimer = false,
  visible = true,
}) {
  return {
    text,
    ttlMs,
    fontSize,
    blinking,
    replaceTimer,
    visible,
  };
}

export function createStageBrandingPayload({
  colors,
  logo,
  logoSize,
  blackBackground,
  showBranding,
}) {
  return {
    colors,
    logo,
    logoSize,
    blackBackground,
    showBranding,
  };
}
```

- [ ] **Step 4: Add safe parsers**

Create `src/stage-contract/parsers.js`:

```js
function parseJsonPayload(payload) {
  try {
    return typeof payload === 'string' ? JSON.parse(payload) : payload;
  } catch {
    return null;
  }
}

export function parseStageStatePayload(payload) {
  const parsed = parseJsonPayload(payload);
  if (!parsed || typeof parsed !== 'object') return null;
  if (typeof parsed.remainingMs !== 'number') return null;
  if (typeof parsed.running !== 'boolean') return null;
  return parsed;
}

export function parseStageMessagePayload(payload) {
  const parsed = parseJsonPayload(payload);
  if (!parsed || typeof parsed !== 'object') return null;
  if (typeof parsed.text !== 'string') return null;
  return parsed;
}

export function parseStageBrandingPayload(payload) {
  const parsed = parseJsonPayload(payload);
  if (!parsed || typeof parsed !== 'object') return null;
  return parsed;
}
```

- [ ] **Step 5: Export payload helpers**

Update `src/stage-contract/index.js`:

```js
export { GLOBAL_SHORTCUT_EVENT, STAGE_EVENTS } from './events.js';
export {
  createStageBrandingPayload,
  createStageMessagePayload,
  createStageStatePayload,
} from './payloads.js';
export {
  parseStageBrandingPayload,
  parseStageMessagePayload,
  parseStageStatePayload,
} from './parsers.js';
```

- [ ] **Step 6: Run tests to verify GREEN**

Run:

```bash
npm_config_cache=.npm-cache npx vitest run src/stage-contract/stage-contract.test.js
```

Expected: PASS.

---

## Task 3: Tauri Stage window client adapter

**Files:**

- Create: `src/infrastructure/tauri/stageWindowClient.js`
- Create: `src/infrastructure/tauri/stageWindowClient.test.js`

- [ ] **Step 1: Write failing adapter tests**

Create `src/infrastructure/tauri/stageWindowClient.test.js`:

```js
import { describe, expect, test, vi } from 'vitest';
import { STAGE_EVENTS } from '../../stage-contract/index.js';
import { createStageWindowClient } from './stageWindowClient.js';

describe('stageWindowClient', () => {
  test('emits stage state through Tauri', async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createStageWindowClient({ invoke });
    const payload = { remainingMs: 1000, running: true };

    await client.emitState(payload);

    expect(invoke).toHaveBeenCalledWith('emit_to_stage', {
      event: STAGE_EVENTS.STATE,
      payload: JSON.stringify(payload),
    });
  });

  test('emits stage message through Tauri', async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createStageWindowClient({ invoke });
    const payload = { text: 'BREAK' };

    await client.emitMessage(payload);

    expect(invoke).toHaveBeenCalledWith('emit_to_stage', {
      event: STAGE_EVENTS.MESSAGE,
      payload: JSON.stringify(payload),
    });
  });

  test('emits stage branding through Tauri', async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createStageWindowClient({ invoke });
    const payload = { logo: '', showBranding: true };

    await client.emitBranding(payload);

    expect(invoke).toHaveBeenCalledWith('emit_to_stage', {
      event: STAGE_EVENTS.BRANDING,
      payload: JSON.stringify(payload),
    });
  });

  test('hides stage message through Tauri', async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createStageWindowClient({ invoke });

    await client.hideMessage();

    expect(invoke).toHaveBeenCalledWith('emit_to_stage', {
      event: STAGE_EVENTS.HIDE_MESSAGE,
      payload: '{}',
    });
  });

  test('wraps native stage window commands', async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const client = createStageWindowClient({ invoke });

    await client.positionOnSecondaryMonitor();
    await client.toggleFullscreen(false);
    await client.close();

    expect(invoke).toHaveBeenCalledWith('position_stage_on_secondary_monitor');
    expect(invoke).toHaveBeenCalledWith('toggle_stage_fullscreen', { on: false });
    expect(invoke).toHaveBeenCalledWith('close_stage_window');
  });
});
```

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
npm_config_cache=.npm-cache npx vitest run src/infrastructure/tauri/stageWindowClient.test.js
```

Expected: FAIL because `stageWindowClient.js` does not exist.

- [ ] **Step 3: Add minimal adapter implementation**

Create `src/infrastructure/tauri/stageWindowClient.js`:

```js
import { invoke as defaultInvoke } from '@tauri-apps/api';
import { STAGE_EVENTS } from '../../stage-contract/index.js';

function emitToStage(invoke, event, payload) {
  return invoke('emit_to_stage', {
    event,
    payload: JSON.stringify(payload),
  });
}

export function createStageWindowClient({ invoke = defaultInvoke } = {}) {
  return {
    emitState(payload) {
      return emitToStage(invoke, STAGE_EVENTS.STATE, payload);
    },

    emitMessage(payload) {
      return emitToStage(invoke, STAGE_EVENTS.MESSAGE, payload);
    },

    emitBranding(payload) {
      return emitToStage(invoke, STAGE_EVENTS.BRANDING, payload);
    },

    hideMessage() {
      return invoke('emit_to_stage', {
        event: STAGE_EVENTS.HIDE_MESSAGE,
        payload: '{}',
      });
    },

    positionOnSecondaryMonitor() {
      return invoke('position_stage_on_secondary_monitor');
    },

    toggleFullscreen(on) {
      return invoke('toggle_stage_fullscreen', { on });
    },

    close() {
      return invoke('close_stage_window');
    },
  };
}

export const stageWindowClient = createStageWindowClient();
```

- [ ] **Step 4: Run test to verify GREEN**

Run:

```bash
npm_config_cache=.npm-cache npx vitest run src/infrastructure/tauri/stageWindowClient.test.js
```

Expected: PASS.

---

## Task 4: Migrate dashboard Stage emits through adapter

**Files:**

- Modify: `src/main.jsx`

- [ ] **Step 1: Add imports**

Update imports at the top of `src/main.jsx`:

```js
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import {
  createStageBrandingPayload,
  createStageMessagePayload,
  createStageStatePayload,
  GLOBAL_SHORTCUT_EVENT,
  STAGE_EVENTS,
} from './stage-contract';
import { stageWindowClient } from './infrastructure/tauri/stageWindowClient';
```

Keep `invoke` because this phase only moves Stage window operations. Other native APIs such as notifications, badge, and video capture remain for later phases.

- [ ] **Step 2: Replace auto-position call**

Find:

```js
await invoke('position_stage_on_secondary_monitor');
```

When it is used for Stage positioning, replace with:

```js
await stageWindowClient.positionOnSecondaryMonitor();
```

Do this for the app-start positioning and the manual stage positioning path.

- [ ] **Step 3: Replace branding emit in branding effect**

Replace the local `brandingData` object creation with:

```js
const brandingData = createStageBrandingPayload({
  colors: brandColors,
  logo,
  logoSize,
  blackBackground,
  showBranding,
});
```

Replace:

```js
await invoke('emit_to_stage', {
  event: 'stage:branding',
  payload: JSON.stringify(brandingData),
});
```

with:

```js
await stageWindowClient.emitBranding(brandingData);
```

- [ ] **Step 4: Replace fullscreen handler and remove invalid command**

Replace the whole body of `handleToggleStageFullscreen` with:

```js
const handleToggleStageFullscreen = async () => {
  try {
    const nextFullscreenState = !isStageFullscreen;
    await stageWindowClient.toggleFullscreen(nextFullscreenState);
    setIsStageFullscreen(nextFullscreenState);
  } catch (error) {
    console.log('Error toggling stage fullscreen:', error);
  }
};
```

This removes the invalid call:

```js
invoke('get_window', { label: 'stage' })
```

because there is no registered Rust command named `get_window`.

- [ ] **Step 5: Replace message emits**

In `sendTimerMessage`, replace manual message object with:

```js
const messageData = createStageMessagePayload({
  text,
  ttlMs,
  fontSize: 150,
  blinking: false,
  replaceTimer: false,
  visible: true,
});
```

Replace its `invoke('emit_to_stage', { event: 'stage:message', ... })` call with:

```js
await stageWindowClient.emitMessage(messageData);
```

In `sendMessage`, replace manual object with:

```js
const messageData = createStageMessagePayload({
  text: message,
  ttlMs,
  fontSize,
  blinking,
  replaceTimer,
  visible: true,
});
```

Then replace the emit with:

```js
await stageWindowClient.emitMessage(messageData);
```

In `sendPresetMessage`, replace manual object with:

```js
const messageData = createStageMessagePayload({
  text: presetText,
  ttlMs,
  fontSize,
  blinking,
  replaceTimer,
  visible: true,
});
```

Then replace the emit with:

```js
await stageWindowClient.emitMessage(messageData);
```

- [ ] **Step 6: Replace stage state emit**

In `pushStageState`, replace manual payload construction with:

```js
const payload = createStageStatePayload({
  remainingMs: timerRef.current.remainingMs,
  running: timerRef.current.running,
  warnMs: timerRef.current.warnMs,
  negativeMode: timerRef.current.negativeMode,
  color: timerRef.current.color(),
  colorInfo,
  totalMs,
  sequenceMode,
  currentSequenceIndex,
  totalSequenceTimers: timerSequence.length,
  currentTimerName:
    sequenceMode && timerSequence[currentSequenceIndex]
      ? timerSequence[currentSequenceIndex].name
      : null,
  timeConfig: currentTimeConfig,
});
```

Replace:

```js
await invoke('emit_to_stage', { event: 'stage:state', payload });
```

with:

```js
await stageWindowClient.emitState(payload);
```

- [ ] **Step 7: Replace hide message emit**

Replace:

```js
await invoke('emit_to_stage', { event: 'stage:hide-message', payload: '{}' });
```

with:

```js
await stageWindowClient.hideMessage();
```

- [ ] **Step 8: Replace request initial data listener event name**

Replace:

```js
listen('stage:request-initial-data', async () => {
```

with:

```js
listen(STAGE_EVENTS.REQUEST_INITIAL_DATA, async () => {
```

Replace raw `stage:branding` emits inside that listener with `stageWindowClient.emitBranding(brandingData)`.

- [ ] **Step 9: Replace global shortcut event name**

Replace:

```js
listen('global-shortcut', (event) => {
```

with:

```js
listen(GLOBAL_SHORTCUT_EVENT, (event) => {
```

- [ ] **Step 10: Replace close stage command**

Replace:

```js
await invoke('close_stage_window');
```

with:

```js
await stageWindowClient.close();
```

- [ ] **Step 11: Run focused tests**

Run:

```bash
npm_config_cache=.npm-cache npm run test
```

Expected: PASS.

- [ ] **Step 12: Run lint**

Run:

```bash
npm_config_cache=.npm-cache npm run lint
```

Expected: PASS. If `invoke` becomes unused in `main.jsx`, remove the import only after confirming no remaining direct `invoke(...)` calls exist for non-Stage commands.

---

## Task 5: Migrate Stage window listeners through contract parsers

**Files:**

- Modify: `src/stage.jsx`

- [ ] **Step 1: Add imports**

Update the imports in `src/stage.jsx`:

```js
import {
  parseStageBrandingPayload,
  parseStageMessagePayload,
  parseStageStatePayload,
  STAGE_EVENTS,
} from './stage-contract';
```

- [ ] **Step 2: Replace initial-data emit event name**

Replace:

```js
await emit('stage:request-initial-data', {});
```

with:

```js
await emit(STAGE_EVENTS.REQUEST_INITIAL_DATA, {});
```

- [ ] **Step 3: Replace state listener parsing**

Replace:

```js
listen('stage:state', (ev) => {
  const s = JSON.parse(ev.payload);
```

with:

```js
listen(STAGE_EVENTS.STATE, (ev) => {
  const s = parseStageStatePayload(ev.payload);
  if (!s) return;
```

Keep the rest of the state handling logic the same.

- [ ] **Step 4: Replace message listener parsing**

Replace:

```js
listen('stage:message', (ev) => {
  const { text, ttlMs = 4000, fontSize = 200, blinking = false, replaceTimer = false } = JSON.parse(
    ev.payload,
  );
```

with:

```js
listen(STAGE_EVENTS.MESSAGE, (ev) => {
  const payload = parseStageMessagePayload(ev.payload);
  if (!payload) return;
  const { text, ttlMs = 4000, fontSize = 200, blinking = false, replaceTimer = false } = payload;
```

Keep the rest of the message logic the same.

- [ ] **Step 5: Replace branding listener parsing**

Replace:

```js
listen('stage:branding', (ev) => {
  const brandingData = JSON.parse(ev.payload);
```

with:

```js
listen(STAGE_EVENTS.BRANDING, (ev) => {
  const brandingData = parseStageBrandingPayload(ev.payload);
  if (!brandingData) return;
```

Keep the rest of the branding logic the same.

- [ ] **Step 6: Replace hide-message listener event name**

Replace:

```js
listen('stage:hide-message', () => {
```

with:

```js
listen(STAGE_EVENTS.HIDE_MESSAGE, () => {
```

The console message text can remain unchanged for now.

- [ ] **Step 7: Run tests and lint**

Run:

```bash
npm_config_cache=.npm-cache npm run test
npm_config_cache=.npm-cache npm run lint
```

Expected: both PASS.

---

## Task 6: Final verification and commit

**Files:**

- All files touched in Tasks 1-5.

- [ ] **Step 1: Run formatter**

Run:

```bash
npm_config_cache=.npm-cache npm run format
```

Expected: Prettier completes without error.

- [ ] **Step 2: Run full quality gate**

Run:

```bash
npm_config_cache=.npm-cache npm run check
```

Expected:

- ESLint passes.
- Vitest passes all tests.
- Prettier check passes.
- npm audit reports 0 high vulnerabilities.

- [ ] **Step 3: Review diff**

Run:

```bash
git diff --stat
git diff -- src/stage-contract src/infrastructure/tauri src/main.jsx src/stage.jsx
```

Expected:

- New contract and adapter files are focused.
- `main.jsx` still owns existing dashboard behavior, but Stage IPC goes through `stageWindowClient`.
- `stage.jsx` still renders the same UI, but listeners use constants and safe parsers.
- No build artifacts, caches, or `node_modules` are staged.

- [ ] **Step 4: Commit locally**

Run:

```bash
git add src/stage-contract src/infrastructure/tauri src/main.jsx src/stage.jsx
git commit -m "refactor: isolate stage event contract"
```

Expected: local commit created on the current branch. Do not push to GitHub unless the user explicitly asks.

---

## Self-Review

### Spec coverage

- Stage event constants: covered in Task 1.
- Payload creation and parsing: covered in Task 2.
- Tauri adapter: covered in Task 3.
- `main.jsx` migration: covered in Task 4.
- `stage.jsx` migration: covered in Task 5.
- `get_window` invalid command removal: covered in Task 4.
- Verification: covered in Task 6.

### Placeholder scan

No `TBD`, incomplete implementation placeholders, or vague “add tests” instructions are present. Each implementation task includes exact files, code snippets, commands, and expected results.

### Type/name consistency

- Event constants use `STAGE_EVENTS` and `GLOBAL_SHORTCUT_EVENT` consistently.
- Payload creators use `createStageStatePayload`, `createStageMessagePayload`, and `createStageBrandingPayload` consistently.
- Parsers use `parseStageStatePayload`, `parseStageMessagePayload`, and `parseStageBrandingPayload` consistently.
- Adapter uses `createStageWindowClient` and `stageWindowClient` consistently.
