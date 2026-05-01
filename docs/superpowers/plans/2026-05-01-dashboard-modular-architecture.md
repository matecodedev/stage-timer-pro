# Fase 4 — Dashboard Modular Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modularizar `src/main.jsx` para que el dashboard quede como orquestador de estado, servicios y hooks sin cambiar UI ni comportamiento observable.

**Architecture:** Separar constantes, defaults, transformaciones puras y suscripciones de larga vida en módulos pequeños bajo `src/dashboard/`. Mantener JSX, estilos, copy visible y flujo Tauri sin rediseño; cada extracción debe ser primero cubierta por tests cuando el comportamiento sea puro o instalable sin navegador real. `src/main.jsx` debe seguir siendo el punto de composición del dashboard y delegar lógica reusable a helpers y hooks.

**Tech Stack:** React 18, Vite, Vitest, JavaScript ESM, Tauri API v1, Tailwind CSS, stage contract existente en `src/stage-contract/`, hooks compartidos `useLatest` y `useStableCallback`.

---

## Contexto verificado

- Repo: `/Users/fernandogabrielrusso/Documents/New project/new-timer-pro`
- Branch al planificar: `codex/production-hardening-phase-1`
- Último commit al planificar: `5b22aa5 refactor: stabilize timer callbacks`
- `src/main.jsx` tiene 2119 líneas y concentra estado, efectos, servicios Tauri, helpers de payload, listeners, hotkeys, lógica de secuencias y UI.
- `src/stage.jsx` tiene 568 líneas y consume `STAGE_EVENTS` mediante parsers del contrato; no es objetivo de esta fase salvo evitar romper su contrato.
- Ya existen `src/shared/hooks/useLatest.js` y `src/shared/hooks/useStableCallback.js` por Fase 3.
- Los tests actuales viven al lado del código: `src/timer.test.js`, `src/stage-contract/stage-contract.test.js`, `src/infrastructure/tauri/stageWindowClient.test.js`, `src/shared/hooks/useStableCallback.test.jsx`.
- Scripts disponibles: `npm run test`, `npm run lint`, `npm run format:check`, `npm run check`.
- Restricción fuerte: no ejecutar `npm run build`, `vite build`, `tauri build` ni scripts equivalentes de build.

## Objetivo de Fase 4

Convertir `src/main.jsx` en un orquestador más chico y legible, extrayendo piezas con responsabilidad clara:

1. Defaults y constantes del dashboard.
2. Helpers puros para tiempo, colores, branding, mensajes, estado del stage y preview.
3. Instaladores testeables de listeners y hooks React finitos para hotkeys, atajos globales, request inicial del stage y cierre de ventana.
4. Componente `Button` reusable sin tocar clases ni variantes.
5. Tests unitarios para las unidades puras y para instaladores de listeners donde se pueda con dependencias actuales.

## Fuera de alcance

- Rediseño visual.
- Cambio de copy visible.
- Migración a TypeScript.
- Upgrades mayores de React, Tauri o Vite.
- Instalación de dependencias nuevas.
- Build de producción.
- Cambios en `src/stage.jsx` salvo que una verificación demuestre un contrato roto por la extracción.
- Commits, push o cambios remotos.

## Arquitectura propuesta

### Principio rector

No estamos “moviendo por mover”. Eso es barrer mugre abajo de la alfombra, hermano. Cada extracción tiene que cortar una dependencia real:

- **Datos estáticos** van a `constants.js`.
- **Transformaciones determinísticas** van a servicios puros y se prueban sin React.
- **Suscripciones externas** se separan en una función `registerNombreDelListener` testeable y un hook `useNombreDelListener` que sólo conecta React.
- **`main.jsx`** queda con estado React, wiring de callbacks, JSX del dashboard y composición de módulos.

### Dependencias permitidas por módulo

- `src/dashboard/constants.js`: sin imports.
- `src/dashboard/timeConfig.js`: sin imports.
- `src/dashboard/branding.js`: puede importar `createStageBrandingPayload` desde `src/stage-contract/`.
- `src/dashboard/messages.js`: puede importar `createStageMessagePayload` desde `src/stage-contract/`.
- `src/dashboard/stageState.js`: puede importar `createStageStatePayload` desde `src/stage-contract/`.
- `src/dashboard/preview.js`: sin imports.
- `src/dashboard/listeners/*.js`: pueden importar `GLOBAL_SHORTCUT_EVENT` o `STAGE_EVENTS`; las APIs Tauri deben entrar por inyección o por wrappers default.
- `src/dashboard/hooks/*.js`: pueden importar React hooks, listeners testeables y APIs Tauri default.
- `src/dashboard/components/Button.jsx`: sólo React implícito JSX y clases existentes.

## Mapa de archivos

### Crear

- `src/dashboard/constants.js` — defaults de tiempo, mensajes, branding, posiciones, tamaños y delays que hoy están hardcodeados en `src/main.jsx`.
- `src/dashboard/timeConfig.js` — `calculateTotalMs`, `createTimeConfig`, `createColorThresholds`, `formatDashboardTime`.
- `src/dashboard/branding.js` — helper para crear payload de branding del stage desde estado del dashboard.
- `src/dashboard/messages.js` — helper para TTL y payloads de mensajes libres, presets y mensajes de secuencia.
- `src/dashboard/stageState.js` — helper puro para construir `createStageStatePayload` desde timer, inputs, secuencia y time config.
- `src/dashboard/preview.js` — helpers de color para la preview local.
- `src/dashboard/components/Button.jsx` — botón actual extraído sin cambios de clases.
- `src/dashboard/listeners/dashboardKeyboardShortcuts.js` — instalador puro de keydown local.
- `src/dashboard/listeners/globalShortcuts.js` — instalador testeable de atajos globales Tauri.
- `src/dashboard/listeners/stageInitialData.js` — instalador testeable de request inicial del stage.
- `src/dashboard/listeners/stageWindowClose.js` — instalador testeable de cierre del stage al cerrar dashboard.
- `src/dashboard/hooks/useDashboardKeyboardShortcuts.js` — hook mínimo que registra keydown local.
- `src/dashboard/hooks/useGlobalShortcuts.js` — hook mínimo que registra atajos globales.
- `src/dashboard/hooks/useStageInitialDataRequest.js` — hook mínimo que registra request inicial del stage.
- `src/dashboard/hooks/useCloseStageOnExit.js` — hook mínimo que registra cierre del stage al salir.
- `src/dashboard/timeConfig.test.js` — tests de cálculos de tiempo y thresholds.
- `src/dashboard/branding.test.js` — tests de payload de branding.
- `src/dashboard/messages.test.js` — tests de TTL y payloads.
- `src/dashboard/stageState.test.js` — tests de payload completo al stage.
- `src/dashboard/preview.test.js` — tests de colores de preview.
- `src/dashboard/listeners/dashboardKeyboardShortcuts.test.js` — tests de mapping de teclado.
- `src/dashboard/listeners/globalShortcuts.test.js` — tests de mapping y cleanup de atajos globales.
- `src/dashboard/listeners/stageInitialData.test.js` — tests de listener de request inicial.
- `src/dashboard/listeners/stageWindowClose.test.js` — tests de cierre de stage.

### Modificar

- `src/main.jsx` — reemplazar helpers inline por imports, reemplazar efectos de listeners por hooks, importar `Button`, mantener JSX y estado visible.
- Opcionalmente `src/stage-contract/stage-contract.test.js` — sólo si el plan de implementación detecta que falta una aserción de payload que ya existía implícita en `main.jsx`.

### No modificar

- `src/stage.jsx`
- `src/timer.js`
- `src/infrastructure/tauri/stageWindowClient.js`
- `package.json`
- `vite.config.js`
- `eslint.config.js`
- `src/index.css`
- `src-tauri/**`

## Tareas bite-sized

### Task 1: Baseline seguro y control de cambios ajenos

**Files:**
- Inspect only: `/Users/fernandogabrielrusso/Documents/New project/new-timer-pro/src/main.jsx`
- Inspect only: `/Users/fernandogabrielrusso/Documents/New project/new-timer-pro/package.json`

- [ ] **Step 1: Confirmar estado de Git antes de tocar archivos**

Run:

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

Expected:

```text
codex/production-hardening-phase-1
5b22aa5 refactor: stabilize timer callbacks
```

Si `git status --short` muestra archivos modificados por otra persona, anotar esos paths y no revertirlos.

- [ ] **Step 2: Confirmar comandos permitidos**

Run:

```bash
node -e "const pkg=require('./package.json'); console.log(pkg.scripts)"
```

Expected: salida con `test`, `lint`, `format:check` y `check`. No ejecutar `build`.

### Task 2: Extraer defaults y constantes del dashboard

**Files:**
- Create: `src/dashboard/constants.js`
- Modify: `src/main.jsx`
- Test: no aplica, sólo datos estáticos cubiertos por tests de servicios posteriores.

- [ ] **Step 1: Crear archivo de constantes**

Create `src/dashboard/constants.js` with:

```js
export const DEFAULT_TIMER_INPUTS = Object.freeze({
  hours: 0,
  minutes: 15,
  seconds: 0,
  warn: 5,
  negativeMode: false,
});

export const DEFAULT_COLOR_THRESHOLDS = Object.freeze({
  critical: 2,
  warning: 5,
  caution: 10,
  good: 25,
});

export const DEFAULT_TIME_CONFIG = Object.freeze({
  showCurrentTime: true,
  timeFormat24h: true,
  showSeconds: true,
  timePosition: 'top-right',
});

export const TIME_POSITIONS = Object.freeze(['top-left', 'top-right', 'bottom-left', 'bottom-right']);

export const DEFAULT_MESSAGE_OPTIONS = Object.freeze({
  messageTtlSeconds: 4,
  fontSize: 200,
  blinking: false,
  replaceTimer: false,
  persistentTtlMs: 24 * 60 * 60 * 1000,
  minTtlMs: 1000,
});

export const DEFAULT_SEQUENCE_TIMER_INPUTS = Object.freeze({
  name: '',
  hours: 0,
  minutes: 5,
  seconds: 0,
});

export const PRESET_MESSAGES = Object.freeze([
  'TIME OUT',
  'BREAK',
  '5 MINUTOS',
  'ÚLTIMO MINUTO',
  'FINALIZANDO',
  'PREPARARSE',
]);

export const DEFAULT_BRAND_COLORS = Object.freeze({
  primary: '#3B82F6',
  secondary: '#10B981',
  background: '#1F2937',
  accent: '#F59E0B',
});

export const DEFAULT_BRANDING = Object.freeze({
  logo: '',
  logoSize: 120,
  blackBackground: false,
  showBranding: true,
});

export const STAGE_AUTO_POSITION_DELAY_MS = 1000;
export const STAGE_CREATE_READY_DELAY_MS = 500;
export const STAGE_SEND_DATA_DELAY_MS = 800;
export const SEQUENCE_AUTOSTART_DELAY_MS = 100;
export const SEQUENCE_MESSAGE_TTL_MS = 3000;
export const SEQUENCE_COMPLETED_TTL_MS = 5000;
export const TIMER_TICK_INTERVAL_MS = 100;
```

- [ ] **Step 2: Importar constantes en `src/main.jsx`**

Add near existing imports:

```js
import {
  DEFAULT_BRAND_COLORS,
  DEFAULT_BRANDING,
  DEFAULT_COLOR_THRESHOLDS,
  DEFAULT_MESSAGE_OPTIONS,
  DEFAULT_SEQUENCE_TIMER_INPUTS,
  DEFAULT_TIME_CONFIG,
  DEFAULT_TIMER_INPUTS,
  PRESET_MESSAGES,
  SEQUENCE_AUTOSTART_DELAY_MS,
  SEQUENCE_COMPLETED_TTL_MS,
  SEQUENCE_MESSAGE_TTL_MS,
  STAGE_AUTO_POSITION_DELAY_MS,
  STAGE_CREATE_READY_DELAY_MS,
  STAGE_SEND_DATA_DELAY_MS,
  TIMER_TICK_INTERVAL_MS,
} from './dashboard/constants';
```

- [ ] **Step 3: Reemplazar defaults inline en `src/main.jsx`**

Use these replacements:

```js
const [hours, setHours] = useState(DEFAULT_TIMER_INPUTS.hours);
const [minutes, setMinutes] = useState(DEFAULT_TIMER_INPUTS.minutes);
const [seconds, setSeconds] = useState(DEFAULT_TIMER_INPUTS.seconds);
const [warn, setWarn] = useState(DEFAULT_TIMER_INPUTS.warn);
const [neg, setNeg] = useState(DEFAULT_TIMER_INPUTS.negativeMode);
const [colorThresholds, setColorThresholds] = useState(DEFAULT_COLOR_THRESHOLDS);
const [showCurrentTime, setShowCurrentTime] = useState(DEFAULT_TIME_CONFIG.showCurrentTime);
const [timeFormat24h, setTimeFormat24h] = useState(DEFAULT_TIME_CONFIG.timeFormat24h);
const [showSeconds, setShowSeconds] = useState(DEFAULT_TIME_CONFIG.showSeconds);
const [timePosition, setTimePosition] = useState(DEFAULT_TIME_CONFIG.timePosition);
const timeConfigRef = useRef(DEFAULT_TIME_CONFIG);
const [messageTtl, setMessageTtl] = useState(DEFAULT_MESSAGE_OPTIONS.messageTtlSeconds);
const [fontSize, setFontSize] = useState(DEFAULT_MESSAGE_OPTIONS.fontSize);
const [blinking, setBlinking] = useState(DEFAULT_MESSAGE_OPTIONS.blinking);
const [replaceTimer, setReplaceTimer] = useState(DEFAULT_MESSAGE_OPTIONS.replaceTimer);
const [brandColors] = useState(DEFAULT_BRAND_COLORS);
const [logo, setLogo] = useState(DEFAULT_BRANDING.logo);
const [logoSize, setLogoSize] = useState(DEFAULT_BRANDING.logoSize);
const [blackBackground, setBlackBackground] = useState(DEFAULT_BRANDING.blackBackground);
const [showBranding, setShowBranding] = useState(DEFAULT_BRANDING.showBranding);
const [newTimerName, setNewTimerName] = useState(DEFAULT_SEQUENCE_TIMER_INPUTS.name);
const [newTimerHours, setNewTimerHours] = useState(DEFAULT_SEQUENCE_TIMER_INPUTS.hours);
const [newTimerMinutes, setNewTimerMinutes] = useState(DEFAULT_SEQUENCE_TIMER_INPUTS.minutes);
const [newTimerSeconds, setNewTimerSeconds] = useState(DEFAULT_SEQUENCE_TIMER_INPUTS.seconds);
const [presetMessages] = useState(PRESET_MESSAGES);
```

- [ ] **Step 4: Reemplazar delays inline en `src/main.jsx`**

Use constants in existing calls:

```js
setTimeout(autoPositionStage, STAGE_AUTO_POSITION_DELAY_MS);
const id = setInterval(tick, TIMER_TICK_INTERVAL_MS);
setTimeout(callback, SEQUENCE_AUTOSTART_DELAY_MS);
setTimeout(callback, STAGE_CREATE_READY_DELAY_MS);
setTimeout(callback, STAGE_SEND_DATA_DELAY_MS);
sendTimerMessage(`${timer.name}`, SEQUENCE_MESSAGE_TTL_MS);
sendTimerMessage('SECUENCIA COMPLETADA', SEQUENCE_COMPLETED_TTL_MS);
```

Run:

```bash
npm_config_cache=.npm-cache npm run lint
```

Expected: no new lint errors. Existing warnings are acceptable only if they were present before this task.

### Task 3: Extraer helpers puros de tiempo y thresholds con TDD

**Files:**
- Create: `src/dashboard/timeConfig.test.js`
- Create: `src/dashboard/timeConfig.js`
- Modify: `src/main.jsx`

- [ ] **Step 1: Escribir tests RED**

Create `src/dashboard/timeConfig.test.js` with:

```js
import { describe, expect, test } from 'vitest';
import {
  calculateTotalMs,
  createColorThresholds,
  createTimeConfig,
  formatDashboardTime,
} from './timeConfig.js';

const inputs = {
  hours: 1,
  minutes: 2,
  seconds: 3,
  warn: 5,
  neg: false,
  colorThresholds: { critical: 2, warning: 5, caution: 10, good: 25 },
  enableAdvancedColors: true,
};

describe('dashboard time config helpers', () => {
  test('calculates total milliseconds from hour minute second inputs', () => {
    expect(calculateTotalMs({ hours: 1, minutes: 2, seconds: 3 })).toBe(3_723_000);
  });

  test('creates a stable current time config payload', () => {
    expect(
      createTimeConfig({
        showCurrentTime: false,
        timeFormat24h: false,
        showSeconds: false,
        timePosition: 'bottom-left',
      }),
    ).toEqual({
      showCurrentTime: false,
      timeFormat24h: false,
      showSeconds: false,
      timePosition: 'bottom-left',
    });
  });

  test('converts advanced color thresholds to timer units', () => {
    expect(createColorThresholds(inputs)).toEqual({
      critical: 120_000,
      warning: 300_000,
      caution: 600_000,
      good: 0.25,
    });
  });

  test('returns null thresholds when advanced colors are disabled', () => {
    expect(createColorThresholds(Object.assign({}, inputs, { enableAdvancedColors: false }))).toBeNull();
  });

  test('formats dashboard duration with hours minutes and seconds', () => {
    expect(formatDashboardTime(3_723_000)).toBe('01:02:03');
    expect(formatDashboardTime(0)).toBe('00:00:00');
    expect(formatDashboardTime(-1)).toBe('00:00:00');
  });
});
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/timeConfig.test.js
```

Expected: FAIL because `src/dashboard/timeConfig.js` does not exist yet.

- [ ] **Step 2: Implementar helper mínimo**

Create `src/dashboard/timeConfig.js` with:

```js
export function calculateTotalMs({ hours, minutes, seconds }) {
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

export function createTimeConfig({ showCurrentTime, timeFormat24h, showSeconds, timePosition }) {
  return { showCurrentTime, timeFormat24h, showSeconds, timePosition };
}

export function createColorThresholds(inputs) {
  if (!inputs.enableAdvancedColors) {
    return null;
  }

  return {
    critical: inputs.colorThresholds.critical * 60_000,
    warning: inputs.colorThresholds.warning * 60_000,
    caution: inputs.colorThresholds.caution * 60_000,
    good: inputs.colorThresholds.good / 100,
  };
}

export function formatDashboardTime(milliseconds) {
  if (!milliseconds || milliseconds < 0) return '00:00:00';

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/timeConfig.test.js
```

Expected: PASS.

- [ ] **Step 3: Usar helpers en `src/main.jsx`**

Replace local `formatTime` function and local `createColorThresholds` with imports:

```js
import {
  calculateTotalMs,
  createColorThresholds,
  createTimeConfig,
  formatDashboardTime,
} from './dashboard/timeConfig';
```

Use:

```js
const totalMs = calculateTotalMs({ hours, minutes, seconds });
```

Use inside time config effect:

```js
timeConfigRef.current = createTimeConfig({
  showCurrentTime,
  timeFormat24h,
  showSeconds,
  timePosition,
});
```

Replace UI calls to old `formatTime(valueInMilliseconds)` with:

```js
formatDashboardTime(valueInMilliseconds)
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/timeConfig.test.js
npm_config_cache=.npm-cache npm run lint
```

Expected: PASS for tests and no new lint errors.

### Task 4: Extraer branding payload helper con TDD

**Files:**
- Create: `src/dashboard/branding.test.js`
- Create: `src/dashboard/branding.js`
- Modify: `src/main.jsx`

- [ ] **Step 1: Escribir test RED**

Create `src/dashboard/branding.test.js` with:

```js
import { describe, expect, test } from 'vitest';
import { createDashboardBrandingPayload } from './branding.js';

describe('dashboard branding helpers', () => {
  test('creates the exact stage branding payload from dashboard state', () => {
    expect(
      createDashboardBrandingPayload({
        colors: { primary: '#111111' },
        logo: 'data:image/png;base64,abc',
        logoSize: 144,
        blackBackground: true,
        showBranding: false,
      }),
    ).toEqual({
      colors: { primary: '#111111' },
      logo: 'data:image/png;base64,abc',
      logoSize: 144,
      blackBackground: true,
      showBranding: false,
    });
  });
});
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/branding.test.js
```

Expected: FAIL because `src/dashboard/branding.js` does not exist yet.

- [ ] **Step 2: Implementar helper**

Create `src/dashboard/branding.js` with:

```js
import { createStageBrandingPayload } from '../stage-contract/index.js';

export function createDashboardBrandingPayload({
  colors,
  logo,
  logoSize,
  blackBackground,
  showBranding,
}) {
  return createStageBrandingPayload({
    colors,
    logo,
    logoSize,
    blackBackground,
    showBranding,
  });
}
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/branding.test.js
```

Expected: PASS.

- [ ] **Step 3: Reemplazar creación inline de branding en `src/main.jsx`**

Add import:

```js
import { createDashboardBrandingPayload } from './dashboard/branding';
```

Replace both calls to `createStageBrandingPayload({ colors: brandColors, logo, logoSize, blackBackground, showBranding })` with:

```js
const brandingData = createDashboardBrandingPayload({
  colors: brandColors,
  logo,
  logoSize,
  blackBackground,
  showBranding,
});
```

Remove `createStageBrandingPayload` from `src/main.jsx` imports if unused.

### Task 5: Extraer mensajes y TTL con TDD

**Files:**
- Create: `src/dashboard/messages.test.js`
- Create: `src/dashboard/messages.js`
- Modify: `src/main.jsx`

- [ ] **Step 1: Escribir tests RED**

Create `src/dashboard/messages.test.js` with:

```js
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
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/messages.test.js
```

Expected: FAIL because `src/dashboard/messages.js` does not exist yet.

- [ ] **Step 2: Implementar helpers**

Create `src/dashboard/messages.js` with:

```js
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
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/messages.test.js
```

Expected: PASS.

- [ ] **Step 3: Usar helpers en `src/main.jsx`**

Add import:

```js
import {
  createDashboardMessagePayload,
  createSequenceMessagePayload,
  resolveMessageTtlMs,
} from './dashboard/messages';
```

In `sendTimerMessage`, replace message payload creation with:

```js
const messageData = createSequenceMessagePayload({ text, ttlMs });
```

In `sendMessage`, replace TTL and payload creation with:

```js
const ttlMs = resolveMessageTtlMs({ persist: persistMsg, ttlSeconds: messageTtl });
const messageData = createDashboardMessagePayload({
  text: message,
  ttlMs,
  fontSize,
  blinking,
  replaceTimer,
});
```

In `sendPresetMessage`, use:

```js
const ttlMs = resolveMessageTtlMs({ persist: persistMsg, ttlSeconds: messageTtl });
const messageData = createDashboardMessagePayload({
  text: presetText,
  ttlMs,
  fontSize,
  blinking,
  replaceTimer,
});
```

Remove `createStageMessagePayload` from `src/main.jsx` imports if unused.

### Task 6: Extraer payload de estado del Stage con TDD

**Files:**
- Create: `src/dashboard/stageState.test.js`
- Create: `src/dashboard/stageState.js`
- Modify: `src/main.jsx`

- [ ] **Step 1: Escribir test RED**

Create `src/dashboard/stageState.test.js` with:

```js
import { describe, expect, test } from 'vitest';
import { createDashboardStageStatePayload } from './stageState.js';

describe('dashboard stage state helper', () => {
  test('creates the full stage state payload from timer inputs and sequence state', () => {
    const timer = {
      remainingMs: 20_000,
      running: true,
      warnMs: 300_000,
      negativeMode: false,
      color: () => 'warning',
      getColorInfo: () => ({ state: 'warning' }),
    };

    expect(
      createDashboardStageStatePayload({
        timer,
        timerInputs: { hours: 0, minutes: 1, seconds: 0 },
        sequence: {
          sequenceMode: true,
          currentSequenceIndex: 1,
          timerSequence: [{ name: 'Talk 1' }, { name: 'Talk 2' }],
        },
        timeConfig: { showCurrentTime: true, timePosition: 'top-right' },
      }),
    ).toEqual({
      remainingMs: 20_000,
      running: true,
      warnMs: 300_000,
      negativeMode: false,
      color: 'warning',
      colorInfo: { state: 'warning' },
      totalMs: 60_000,
      sequenceMode: true,
      currentSequenceIndex: 1,
      totalSequenceTimers: 2,
      currentTimerName: 'Talk 2',
      timeConfig: { showCurrentTime: true, timePosition: 'top-right' },
    });
  });

  test('uses null current timer name when sequence mode is disabled', () => {
    const timer = {
      remainingMs: 60_000,
      running: false,
      warnMs: 300_000,
      negativeMode: false,
      color: () => 'green',
      getColorInfo: () => ({ state: 'green' }),
    };

    const payload = createDashboardStageStatePayload({
      timer,
      timerInputs: { hours: 0, minutes: 1, seconds: 0 },
      sequence: { sequenceMode: false, currentSequenceIndex: 0, timerSequence: [{ name: 'Talk 1' }] },
      timeConfig: { showCurrentTime: false },
    });

    expect(payload.currentTimerName).toBeNull();
    expect(payload.totalSequenceTimers).toBe(1);
  });
});
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/stageState.test.js
```

Expected: FAIL because `src/dashboard/stageState.js` does not exist yet.

- [ ] **Step 2: Implementar helper**

Create `src/dashboard/stageState.js` with:

```js
import { createStageStatePayload } from '../stage-contract/index.js';
import { calculateTotalMs } from './timeConfig.js';

export function createDashboardStageStatePayload({ timer, timerInputs, sequence, timeConfig }) {
  const totalMs = calculateTotalMs(timerInputs);
  const currentTimer = sequence.sequenceMode
    ? sequence.timerSequence[sequence.currentSequenceIndex]
    : null;

  return createStageStatePayload({
    remainingMs: timer.remainingMs,
    running: timer.running,
    warnMs: timer.warnMs,
    negativeMode: timer.negativeMode,
    color: timer.color(),
    colorInfo: timer.getColorInfo(),
    totalMs,
    sequenceMode: sequence.sequenceMode,
    currentSequenceIndex: sequence.currentSequenceIndex,
    totalSequenceTimers: sequence.timerSequence.length,
    currentTimerName: currentTimer ? currentTimer.name : null,
    timeConfig,
  });
}
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/stageState.test.js
```

Expected: PASS.

- [ ] **Step 3: Usar helper en `pushStageState`**

Add import:

```js
import { createDashboardStageStatePayload } from './dashboard/stageState';
```

Replace the body section that manually builds `payload` in `pushStageState` with:

```js
const payload = createDashboardStageStatePayload({
  timer: timerRef.current,
  timerInputs: inputs,
  sequence,
  timeConfig: timeConfigRef.current,
});
```

Remove `createStageStatePayload` from `src/main.jsx` imports if unused.

### Task 7: Extraer preview helpers con TDD

**Files:**
- Create: `src/dashboard/preview.test.js`
- Create: `src/dashboard/preview.js`
- Modify: `src/main.jsx`

- [ ] **Step 1: Escribir tests RED**

Create `src/dashboard/preview.test.js` with:

```js
import { describe, expect, test } from 'vitest';
import { getPreviewBackgroundColor, getPreviewTextColor } from './preview.js';

describe('dashboard preview helpers', () => {
  test('uses black background when enabled', () => {
    expect(getPreviewBackgroundColor({ blackBackground: true, color: 'green' })).toBe('#000000');
  });

  test('maps timer color states to preview colors', () => {
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'critical' })).toBe('#DC2626');
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'warning' })).toBe('#EF4444');
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'caution' })).toBe('#F59E0B');
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'good' })).toBe('#059669');
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'transition' })).toBe('#10B981');
    expect(getPreviewBackgroundColor({ blackBackground: false, color: 'unknown' })).toBe('#1F2937');
  });

  test('keeps preview text white', () => {
    expect(getPreviewTextColor()).toBe('#FFFFFF');
  });
});
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/preview.test.js
```

Expected: FAIL because `src/dashboard/preview.js` does not exist yet.

- [ ] **Step 2: Implementar helpers**

Create `src/dashboard/preview.js` with:

```js
export function getPreviewBackgroundColor({ blackBackground, color }) {
  if (blackBackground) return '#000000';
  if (color === 'critical') return '#DC2626';
  if (color === 'warning') return '#EF4444';
  if (color === 'caution') return '#F59E0B';
  if (color === 'good' || color === 'green') return '#059669';
  if (color === 'transition') return '#10B981';
  return '#1F2937';
}

export function getPreviewTextColor() {
  return '#FFFFFF';
}
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/preview.test.js
```

Expected: PASS.

- [ ] **Step 3: Usar helpers en `src/main.jsx`**

Add import:

```js
import {
  getPreviewBackgroundColor as resolvePreviewBackgroundColor,
  getPreviewTextColor as resolvePreviewTextColor,
} from './dashboard/preview';
```

Replace local functions with:

```js
const getPreviewBackgroundColor = () =>
  resolvePreviewBackgroundColor({ blackBackground, color: state.color });

const getPreviewTextColor = () => resolvePreviewTextColor();
```

### Task 8: Extraer componente Button sin cambiar estilos

**Files:**
- Create: `src/dashboard/components/Button.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Crear componente extraído**

Create `src/dashboard/components/Button.jsx` with:

```jsx
export function Button({ children, onClick, className = '', variant = 'default' }) {
  const baseClasses = 'px-3 py-2 rounded border shadow-sm hover:opacity-90 transition-all';
  const variants = {
    default:
      'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white',
    primary: 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
    success: 'bg-green-500 text-white border-green-500 hover:bg-green-600',
    warning: 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600',
    danger: 'bg-red-500 text-white border-red-500 hover:bg-red-600',
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Importar y remover definición inline**

Add import in `src/main.jsx`:

```js
import { Button } from './dashboard/components/Button';
```

Remove the inline `function Button({ children, onClick, className, variant })` definition from `src/main.jsx`.

Run:

```bash
npm_config_cache=.npm-cache npm run lint
```

Expected: no new lint errors.

### Task 9: Extraer keyboard shortcuts locales con instalador testeable

**Files:**
- Create: `src/dashboard/listeners/dashboardKeyboardShortcuts.test.js`
- Create: `src/dashboard/listeners/dashboardKeyboardShortcuts.js`
- Create: `src/dashboard/hooks/useDashboardKeyboardShortcuts.js`
- Modify: `src/main.jsx`

- [ ] **Step 1: Escribir tests RED del instalador**

Create `src/dashboard/listeners/dashboardKeyboardShortcuts.test.js` with:

```js
import { describe, expect, test, vi } from 'vitest';
import { registerDashboardKeyboardShortcuts } from './dashboardKeyboardShortcuts.js';

function createTarget() {
  const listeners = new Map();
  return {
    addEventListener: vi.fn((type, listener) => listeners.set(type, listener)),
    removeEventListener: vi.fn((type, listener) => {
      if (listeners.get(type) === listener) listeners.delete(type);
    }),
    dispatch(type, event) {
      listeners.get(type)?.(event);
    },
  };
}

function createHandlers() {
  return {
    isTimerRunning: vi.fn(() => false),
    start: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    addMin: vi.fn(),
    sendMessage: vi.fn(),
    hideMessage: vi.fn(),
  };
}

describe('registerDashboardKeyboardShortcuts', () => {
  test('toggles timer with Space and prevents default', () => {
    const target = createTarget();
    const handlers = createHandlers();
    const preventDefault = vi.fn();

    const cleanup = registerDashboardKeyboardShortcuts({ target, handlers });

    target.dispatch('keydown', { code: 'Space', key: ' ', preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(handlers.start).toHaveBeenCalledTimes(1);
    expect(handlers.pause).not.toHaveBeenCalled();

    cleanup();
    expect(target.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  test('pauses with Space when timer is running', () => {
    const target = createTarget();
    const handlers = Object.assign(createHandlers(), { isTimerRunning: vi.fn(() => true) });

    registerDashboardKeyboardShortcuts({ target, handlers });
    target.dispatch('keydown', { code: 'Space', key: ' ', preventDefault: vi.fn() });

    expect(handlers.pause).toHaveBeenCalledTimes(1);
    expect(handlers.start).not.toHaveBeenCalled();
  });

  test('maps dashboard keys to existing handlers', () => {
    const target = createTarget();
    const handlers = createHandlers();

    registerDashboardKeyboardShortcuts({ target, handlers });
    target.dispatch('keydown', { code: 'KeyS', key: 's', preventDefault: vi.fn() });
    target.dispatch('keydown', { code: 'Equal', key: '+', preventDefault: vi.fn() });
    target.dispatch('keydown', { code: 'Minus', key: '-', preventDefault: vi.fn() });
    target.dispatch('keydown', { code: 'KeyM', key: 'm', preventDefault: vi.fn() });
    target.dispatch('keydown', { code: 'KeyH', key: 'h', preventDefault: vi.fn() });

    expect(handlers.stop).toHaveBeenCalledTimes(1);
    expect(handlers.addMin).toHaveBeenNthCalledWith(1, 1);
    expect(handlers.addMin).toHaveBeenNthCalledWith(2, -1);
    expect(handlers.sendMessage).toHaveBeenCalledTimes(1);
    expect(handlers.hideMessage).toHaveBeenCalledTimes(1);
  });

  test('maps modifier plus and minus to five minute changes', () => {
    const target = createTarget();
    const handlers = createHandlers();

    registerDashboardKeyboardShortcuts({ target, handlers });
    target.dispatch('keydown', { code: 'Equal', key: '+', ctrlKey: true, preventDefault: vi.fn() });
    target.dispatch('keydown', { code: 'Minus', key: '-', metaKey: true, preventDefault: vi.fn() });

    expect(handlers.addMin).toHaveBeenNthCalledWith(1, 1);
    expect(handlers.addMin).toHaveBeenNthCalledWith(2, 5);
    expect(handlers.addMin).toHaveBeenNthCalledWith(3, -1);
    expect(handlers.addMin).toHaveBeenNthCalledWith(4, -5);
  });
});
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/listeners/dashboardKeyboardShortcuts.test.js
```

Expected: FAIL because listener module does not exist yet.

- [ ] **Step 2: Implementar instalador**

Create `src/dashboard/listeners/dashboardKeyboardShortcuts.js` with:

```js
export function registerDashboardKeyboardShortcuts({ target = window, handlers }) {
  const onKeydown = (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      if (handlers.isTimerRunning()) {
        handlers.pause();
      } else {
        handlers.start();
      }
    }

    if (event.key === 's' || event.key === 'S') handlers.stop();
    if (event.key === '+') handlers.addMin(1);
    if (event.key === '-') handlers.addMin(-1);
    if ((event.ctrlKey || event.metaKey) && event.key === '+') handlers.addMin(5);
    if ((event.ctrlKey || event.metaKey) && event.key === '-') handlers.addMin(-5);
    if (event.key === 'm' || event.key === 'M') handlers.sendMessage();
    if (event.key === 'h' || event.key === 'H') handlers.hideMessage();
  };

  target.addEventListener('keydown', onKeydown);
  return () => target.removeEventListener('keydown', onKeydown);
}
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/listeners/dashboardKeyboardShortcuts.test.js
```

Expected: PASS. The modifier test documents the current behavior where `Ctrl/Cmd + +` also triggers the plain `+` branch; do not “fix” that in this phase because it would change behavior.

- [ ] **Step 3: Crear hook wrapper**

Create `src/dashboard/hooks/useDashboardKeyboardShortcuts.js` with:

```js
import { useEffect } from 'react';
import { registerDashboardKeyboardShortcuts } from '../listeners/dashboardKeyboardShortcuts.js';

export function useDashboardKeyboardShortcuts(handlers) {
  useEffect(() => registerDashboardKeyboardShortcuts({ handlers }), [handlers]);
}
```

- [ ] **Step 4: Usar hook en `src/main.jsx`**

Add imports:

```js
import { useDashboardKeyboardShortcuts } from './dashboard/hooks/useDashboardKeyboardShortcuts';
```

Create stable handlers object:

```js
const dashboardKeyboardHandlers = useMemo(
  () => ({
    isTimerRunning: () => Boolean(timerRef.current?.running),
    start,
    pause,
    stop,
    addMin,
    sendMessage,
    hideMessage,
  }),
  [start, pause, stop, addMin, sendMessage, hideMessage],
);

useDashboardKeyboardShortcuts(dashboardKeyboardHandlers);
```

Remove local `handleLocalKeydown` and its `useEffect`. Keep behavior identical, including plain plus/minus and modifier plus/minus double-call behavior.

### Task 10: Extraer atajos globales Tauri con instalador testeable

**Files:**
- Create: `src/dashboard/listeners/globalShortcuts.test.js`
- Create: `src/dashboard/listeners/globalShortcuts.js`
- Create: `src/dashboard/hooks/useGlobalShortcuts.js`
- Modify: `src/main.jsx`

- [ ] **Step 1: Escribir tests RED**

Create `src/dashboard/listeners/globalShortcuts.test.js` with:

```js
import { describe, expect, test, vi } from 'vitest';
import { GLOBAL_SHORTCUT_EVENT } from '../../stage-contract/index.js';
import { registerGlobalShortcuts } from './globalShortcuts.js';

describe('registerGlobalShortcuts', () => {
  test('registers global shortcut listener and routes known actions', async () => {
    const unlisten = vi.fn();
    let callback;
    const listenEvent = vi.fn(async (_eventName, cb) => {
      callback = cb;
      return unlisten;
    });
    const handlers = {
      toggleTimer: vi.fn(),
      resetTimer: vi.fn(),
      toggleStageFullscreen: vi.fn(),
    };

    const cleanup = await registerGlobalShortcuts({ listenEvent, handlers, logger: console });

    expect(listenEvent).toHaveBeenCalledWith(GLOBAL_SHORTCUT_EVENT, expect.any(Function));
    callback({ payload: 'toggle-timer' });
    callback({ payload: 'reset-timer' });
    callback({ payload: 'toggle-stage-fullscreen' });

    expect(handlers.toggleTimer).toHaveBeenCalledTimes(1);
    expect(handlers.resetTimer).toHaveBeenCalledTimes(1);
    expect(handlers.toggleStageFullscreen).toHaveBeenCalledTimes(1);

    cleanup();
    expect(unlisten).toHaveBeenCalledTimes(1);
  });

  test('returns inert cleanup when listener setup fails', async () => {
    const listenEvent = vi.fn(async () => {
      throw new Error('tauri unavailable');
    });
    const logger = { log: vi.fn(), error: vi.fn() };

    const cleanup = await registerGlobalShortcuts({
      listenEvent,
      handlers: { toggleTimer: vi.fn(), resetTimer: vi.fn(), toggleStageFullscreen: vi.fn() },
      logger,
    });

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/listeners/globalShortcuts.test.js
```

Expected: FAIL because module does not exist yet.

- [ ] **Step 2: Implementar instalador**

Create `src/dashboard/listeners/globalShortcuts.js` with:

```js
import { GLOBAL_SHORTCUT_EVENT } from '../../stage-contract/index.js';

export async function registerGlobalShortcuts({ listenEvent, handlers, logger = console }) {
  try {
    const unlisten = await listenEvent(GLOBAL_SHORTCUT_EVENT, (event) => {
      const action = event.payload;
      logger.log('🔥 Atajo global activado:', action);

      switch (action) {
        case 'toggle-timer':
          handlers.toggleTimer();
          break;
        case 'reset-timer':
          handlers.resetTimer();
          break;
        case 'toggle-stage-fullscreen':
          handlers.toggleStageFullscreen();
          break;
        default:
          logger.log('Acción de atajo global no reconocida:', action);
      }
    });

    logger.log('✅ Atajos globales configurados');
    return () => unlisten();
  } catch (error) {
    logger.error('❌ Error configurando atajos globales:', error);
    return () => {};
  }
}
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/listeners/globalShortcuts.test.js
```

Expected: PASS.

- [ ] **Step 3: Crear hook wrapper**

Create `src/dashboard/hooks/useGlobalShortcuts.js` with:

```js
import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { registerGlobalShortcuts } from '../listeners/globalShortcuts.js';

export function useGlobalShortcuts(handlers) {
  useEffect(() => {
    let cleanup = () => {};
    let disposed = false;

    registerGlobalShortcuts({ listenEvent: listen, handlers }).then((unlisten) => {
      if (disposed) {
        unlisten();
        return;
      }
      cleanup = unlisten;
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [handlers]);
}
```

- [ ] **Step 4: Usar hook en `src/main.jsx`**

Remove `listen` and `GLOBAL_SHORTCUT_EVENT` imports from `src/main.jsx` if no longer used.

Add import:

```js
import { useGlobalShortcuts } from './dashboard/hooks/useGlobalShortcuts';
```

Add stable handlers object:

```js
const globalShortcutHandlers = useMemo(
  () => ({
    toggleTimer: handleStartStop,
    resetTimer: handleReset,
    toggleStageFullscreen: handleToggleStageFullscreen,
  }),
  [handleStartStop, handleReset, handleToggleStageFullscreen],
);

useGlobalShortcuts(globalShortcutHandlers);
```

Remove the existing global shortcuts `useEffect` block. Behavior and log messages must remain identical.

### Task 11: Extraer listener de request inicial del Stage

**Files:**
- Create: `src/dashboard/listeners/stageInitialData.test.js`
- Create: `src/dashboard/listeners/stageInitialData.js`
- Create: `src/dashboard/hooks/useStageInitialDataRequest.js`
- Modify: `src/main.jsx`

- [ ] **Step 1: Escribir tests RED**

Create `src/dashboard/listeners/stageInitialData.test.js` with:

```js
import { describe, expect, test, vi } from 'vitest';
import { STAGE_EVENTS } from '../../stage-contract/index.js';
import { registerStageInitialDataRequest } from './stageInitialData.js';

describe('registerStageInitialDataRequest', () => {
  test('listens for stage initial data requests', async () => {
    const unlisten = vi.fn();
    let callback;
    const listenEvent = vi.fn(async (_eventName, cb) => {
      callback = cb;
      return unlisten;
    });
    const onRequest = vi.fn();

    const cleanup = await registerStageInitialDataRequest({ listenEvent, onRequest, logger: console });

    expect(listenEvent).toHaveBeenCalledWith(STAGE_EVENTS.REQUEST_INITIAL_DATA, expect.any(Function));
    await callback();
    expect(onRequest).toHaveBeenCalledTimes(1);

    cleanup();
    expect(unlisten).toHaveBeenCalledTimes(1);
  });

  test('returns inert cleanup when setup fails', async () => {
    const logger = { log: vi.fn() };
    const cleanup = await registerStageInitialDataRequest({
      listenEvent: vi.fn(async () => {
        throw new Error('listener failed');
      }),
      onRequest: vi.fn(),
      logger,
    });

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
    expect(logger.log).toHaveBeenCalledWith('Could not setup stage listener:', expect.any(Error));
  });
});
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/listeners/stageInitialData.test.js
```

Expected: FAIL because module does not exist yet.

- [ ] **Step 2: Implementar instalador**

Create `src/dashboard/listeners/stageInitialData.js` with:

```js
import { STAGE_EVENTS } from '../../stage-contract/index.js';

export async function registerStageInitialDataRequest({ listenEvent, onRequest, logger = console }) {
  try {
    const unlisten = await listenEvent(STAGE_EVENTS.REQUEST_INITIAL_DATA, onRequest);
    return () => unlisten();
  } catch (error) {
    logger.log('Could not setup stage listener:', error);
    return () => {};
  }
}
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/listeners/stageInitialData.test.js
```

Expected: PASS.

- [ ] **Step 3: Crear hook wrapper**

Create `src/dashboard/hooks/useStageInitialDataRequest.js` with:

```js
import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { registerStageInitialDataRequest } from '../listeners/stageInitialData.js';

export function useStageInitialDataRequest(onRequest) {
  useEffect(() => {
    let cleanup = () => {};
    let disposed = false;

    registerStageInitialDataRequest({ listenEvent: listen, onRequest }).then((unlisten) => {
      if (disposed) {
        unlisten();
        return;
      }
      cleanup = unlisten;
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [onRequest]);
}
```

- [ ] **Step 4: Usar hook en `src/main.jsx`**

Add import:

```js
import { useStageInitialDataRequest } from './dashboard/hooks/useStageInitialDataRequest';
```

Replace existing listener effect with:

```js
useStageInitialDataRequest(handleStageRequestInitialData);
```

Keep `handleStageRequestInitialData` implemented with `useStableCallback`.

### Task 12: Extraer cierre del stage al cerrar dashboard

**Files:**
- Create: `src/dashboard/listeners/stageWindowClose.test.js`
- Create: `src/dashboard/listeners/stageWindowClose.js`
- Create: `src/dashboard/hooks/useCloseStageOnExit.js`
- Modify: `src/main.jsx`

- [ ] **Step 1: Escribir tests RED**

Create `src/dashboard/listeners/stageWindowClose.test.js` with:

```js
import { describe, expect, test, vi } from 'vitest';
import { registerStageWindowCloseOnExit } from './stageWindowClose.js';

describe('registerStageWindowCloseOnExit', () => {
  test('closes stage window when app window close is requested', async () => {
    const unlisten = vi.fn();
    let callback;
    const appWindow = {
      onCloseRequested: vi.fn(async (cb) => {
        callback = cb;
        return unlisten;
      }),
    };
    const stageClient = { close: vi.fn(async () => undefined) };

    const cleanup = await registerStageWindowCloseOnExit({ appWindow, stageClient, logger: console });

    await callback({});
    expect(stageClient.close).toHaveBeenCalledTimes(1);

    cleanup();
    expect(unlisten).toHaveBeenCalledTimes(1);
  });

  test('returns inert cleanup when setup fails', async () => {
    const logger = { log: vi.fn() };
    const cleanup = await registerStageWindowCloseOnExit({
      appWindow: {
        onCloseRequested: vi.fn(async () => {
          throw new Error('close listener failed');
        }),
      },
      stageClient: { close: vi.fn() },
      logger,
    });

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
    expect(logger.log).toHaveBeenCalledWith('Could not setup close listener:', expect.any(Error));
  });

  test('logs close errors without throwing from close callback', async () => {
    let callback;
    const logger = { log: vi.fn() };
    const appWindow = {
      onCloseRequested: vi.fn(async (cb) => {
        callback = cb;
        return vi.fn();
      }),
    };
    const stageClient = {
      close: vi.fn(async () => {
        throw new Error('close failed');
      }),
    };

    await registerStageWindowCloseOnExit({ appWindow, stageClient, logger });
    await expect(callback({})).resolves.toBeUndefined();
    expect(logger.log).toHaveBeenCalledWith('Could not close stage window:', expect.any(Error));
  });
});
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/listeners/stageWindowClose.test.js
```

Expected: FAIL because module does not exist yet.

- [ ] **Step 2: Implementar instalador**

Create `src/dashboard/listeners/stageWindowClose.js` with:

```js
export async function registerStageWindowCloseOnExit({ appWindow, stageClient, logger = console }) {
  try {
    const unlisten = await appWindow.onCloseRequested(async (_event) => {
      try {
        await stageClient.close();
      } catch (error) {
        logger.log('Could not close stage window:', error);
      }
    });

    return () => unlisten();
  } catch (error) {
    logger.log('Could not setup close listener:', error);
    return () => {};
  }
}
```

Run:

```bash
npm_config_cache=.npm-cache npm run test -- src/dashboard/listeners/stageWindowClose.test.js
```

Expected: PASS.

- [ ] **Step 3: Crear hook wrapper**

Create `src/dashboard/hooks/useCloseStageOnExit.js` with:

```js
import { useEffect } from 'react';
import { registerStageWindowCloseOnExit } from '../listeners/stageWindowClose.js';

async function getDefaultAppWindow() {
  const { appWindow } = await import('@tauri-apps/api/window');
  return appWindow;
}

export function useCloseStageOnExit(stageClient) {
  useEffect(() => {
    let cleanup = () => {};
    let disposed = false;

    getDefaultAppWindow()
      .then((appWindow) => registerStageWindowCloseOnExit({ appWindow, stageClient }))
      .then((unlisten) => {
        if (disposed) {
          unlisten();
          return;
        }
        cleanup = unlisten;
      });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [stageClient]);
}
```

- [ ] **Step 4: Usar hook en `src/main.jsx`**

Add import:

```js
import { useCloseStageOnExit } from './dashboard/hooks/useCloseStageOnExit';
```

Replace close-stage `useEffect` with:

```js
useCloseStageOnExit(stageWindowClient);
```

### Task 13: Reducir `src/main.jsx` como orquestador sin rediseño visual

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Limpiar imports no usados**

`src/main.jsx` should keep imports shaped like:

```js
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Countdown, formatMs } from './timer';
import { invoke } from '@tauri-apps/api';
import { stageWindowClient } from './infrastructure/tauri/stageWindowClient';
import { useLatest } from './shared/hooks/useLatest';
import { useStableCallback } from './shared/hooks/useStableCallback';
import { Button } from './dashboard/components/Button';
import { createDashboardBrandingPayload } from './dashboard/branding';
import {
  DEFAULT_BRAND_COLORS,
  DEFAULT_BRANDING,
  DEFAULT_COLOR_THRESHOLDS,
  DEFAULT_MESSAGE_OPTIONS,
  DEFAULT_SEQUENCE_TIMER_INPUTS,
  DEFAULT_TIME_CONFIG,
  DEFAULT_TIMER_INPUTS,
  PRESET_MESSAGES,
  SEQUENCE_AUTOSTART_DELAY_MS,
  SEQUENCE_COMPLETED_TTL_MS,
  SEQUENCE_MESSAGE_TTL_MS,
  STAGE_AUTO_POSITION_DELAY_MS,
  STAGE_CREATE_READY_DELAY_MS,
  STAGE_SEND_DATA_DELAY_MS,
  TIMER_TICK_INTERVAL_MS,
} from './dashboard/constants';
import { useCloseStageOnExit } from './dashboard/hooks/useCloseStageOnExit';
import { useDashboardKeyboardShortcuts } from './dashboard/hooks/useDashboardKeyboardShortcuts';
import { useGlobalShortcuts } from './dashboard/hooks/useGlobalShortcuts';
import { useStageInitialDataRequest } from './dashboard/hooks/useStageInitialDataRequest';
import {
  createDashboardMessagePayload,
  createSequenceMessagePayload,
  resolveMessageTtlMs,
} from './dashboard/messages';
import {
  getPreviewBackgroundColor as resolvePreviewBackgroundColor,
  getPreviewTextColor as resolvePreviewTextColor,
} from './dashboard/preview';
import { createDashboardStageStatePayload } from './dashboard/stageState';
import {
  calculateTotalMs,
  createColorThresholds,
  createTimeConfig,
  formatDashboardTime,
} from './dashboard/timeConfig';
```

Run:

```bash
npm_config_cache=.npm-cache npm run lint
```

Expected: no unused import warnings introduced by this task.

- [ ] **Step 2: Mantener orden conceptual dentro de `App`**

Reorder only if it does not change behavior:

1. State declarations.
2. Refs derived from state.
3. Pure derived values.
4. Stable callbacks that mutate timer or stage.
5. Hooks for subscriptions.
6. JSX.

Do not move JSX into new panel components in this phase. Esa tentación de querer “hacerlo lindo” ahora es deuda nueva disfrazada de limpieza.

- [ ] **Step 3: Conservar comportamiento de secuencia y timeouts**

Ensure these snippets still exist semantically:

```js
setTimeout(() => {
  if (timerRef.current) {
    timerRef.current.start();
    pushStageState();
  }
}, SEQUENCE_AUTOSTART_DELAY_MS);
```

```js
if (!persistMsg) {
  setTimeout(() => {
    setCurrentGlobalMessage(null);
    pushStageState();
  }, ttlMs);
}
```

```js
useEffect(() => {
  const id = setInterval(tick, TIMER_TICK_INTERVAL_MS);
  return () => clearInterval(id);
}, [tick]);
```

Expected: interval uses stable callback and cleanup remains intact.

### Task 14: Ejecutar verificaciones permitidas

**Files:**
- All files touched in this phase.

- [ ] **Step 1: Tests focalizados de módulos nuevos**

Run:

```bash
npm_config_cache=.npm-cache npm run test -- \
  src/dashboard/timeConfig.test.js \
  src/dashboard/branding.test.js \
  src/dashboard/messages.test.js \
  src/dashboard/stageState.test.js \
  src/dashboard/preview.test.js \
  src/dashboard/listeners/dashboardKeyboardShortcuts.test.js \
  src/dashboard/listeners/globalShortcuts.test.js \
  src/dashboard/listeners/stageInitialData.test.js \
  src/dashboard/listeners/stageWindowClose.test.js
```

Expected: PASS.

- [ ] **Step 2: Suite existente de unidades**

Run:

```bash
npm_config_cache=.npm-cache npm run test
```

Expected: PASS.

- [ ] **Step 3: Lint**

Run:

```bash
npm_config_cache=.npm-cache npm run lint
```

Expected: no new errors. Warnings sólo aceptables si existían antes y se documentan con path exacto.

- [ ] **Step 4: Prettier check**

Run:

```bash
npm_config_cache=.npm-cache npm run format:check
```

Expected: PASS. If it fails only for files touched in this phase, run:

```bash
npm_config_cache=.npm-cache npm run format -- \
  src/dashboard/constants.js \
  src/dashboard/timeConfig.js \
  src/dashboard/timeConfig.test.js \
  src/dashboard/branding.js \
  src/dashboard/branding.test.js \
  src/dashboard/messages.js \
  src/dashboard/messages.test.js \
  src/dashboard/stageState.js \
  src/dashboard/stageState.test.js \
  src/dashboard/preview.js \
  src/dashboard/preview.test.js \
  src/dashboard/components/Button.jsx \
  src/dashboard/listeners/dashboardKeyboardShortcuts.js \
  src/dashboard/listeners/dashboardKeyboardShortcuts.test.js \
  src/dashboard/listeners/globalShortcuts.js \
  src/dashboard/listeners/globalShortcuts.test.js \
  src/dashboard/listeners/stageInitialData.js \
  src/dashboard/listeners/stageInitialData.test.js \
  src/dashboard/listeners/stageWindowClose.js \
  src/dashboard/listeners/stageWindowClose.test.js \
  src/dashboard/hooks/useDashboardKeyboardShortcuts.js \
  src/dashboard/hooks/useGlobalShortcuts.js \
  src/dashboard/hooks/useStageInitialDataRequest.js \
  src/dashboard/hooks/useCloseStageOnExit.js \
  src/main.jsx
```

Then rerun:

```bash
npm_config_cache=.npm-cache npm run format:check
```

Expected: PASS.

- [ ] **Step 5: Full non-build check con cautela**

Run:

```bash
npm_config_cache=.npm-cache npm run check
```

Expected: PASS. If it fails at `npm audit --audit-level=high` due network or registry, document the exact audit error and still report results from `lint`, `test` and `format:check`. No instalar paquetes para resolver audit en esta fase.

- [ ] **Step 6: Confirmar que no se ejecutó build**

Run:

```bash
git status --short
```

Expected: only source, test and plan files from this phase are modified or added. No `dist/`, `src-tauri/target/` or build artifacts.

## Riesgos

1. **Hotkeys con doble disparo en `Ctrl/Cmd + +` y `Ctrl/Cmd + -`:** el código actual ejecuta la rama simple y la rama con modificador. El plan lo preserva porque corregirlo sería cambio de comportamiento.
2. **Hooks con setup asíncrono:** listeners Tauri devuelven `unlisten` por promesa. Los hooks propuestos manejan cleanup antes y después de resolver la promesa para evitar listeners colgados.
3. **`src/main.jsx` tiene mucho JSX mezclado con lógica:** extraer paneles visuales ahora aumentaría el riesgo de rediseño accidental. La fase se limita a servicios, listeners, hooks y `Button`.
4. **`npm run check` incluye audit:** puede fallar por red, registry o vulnerabilidades preexistentes. No resolver con installs en esta fase.
5. **Imports ESM con extensión:** el repo mezcla imports sin extensión en React app y con `.js` en tests/módulos. En archivos bajo `src/dashboard/` usar `.js` para imports internos de servicios y mantener imports sin extensión desde `src/main.jsx`, consistente con Vite actual.
6. **Estado global `setCurrentGlobalMessage` y `setCurrentGlobalBranding`:** aunque el valor no se lee en JSX, no removerlo en esta fase porque puede ser parte de sincronización futura o comportamiento implícito.

## Criterios de aceptación

- `src/main.jsx` ya no define inline `Button`, `formatTime`, `createColorThresholds`, builders de payload del stage, mapeo de preview ni lógica directa de instalación de listeners.
- `src/main.jsx` conserva la UI, clases Tailwind, textos visibles y orden visual del dashboard.
- `src/stage.jsx` no cambia.
- `src/stage-contract/*` no cambia salvo test adicional justificado.
- Cada helper puro nuevo tiene tests Vitest al lado del módulo.
- Cada listener extraído tiene instalador testeable sin depender de Tauri real.
- `npm_config_cache=.npm-cache npm run test` pasa.
- `npm_config_cache=.npm-cache npm run lint` no introduce errores nuevos.
- `npm_config_cache=.npm-cache npm run format:check` pasa después de formatear sólo archivos tocados si hizo falta.
- No se ejecuta build.
- No se hacen commits ni push.

## Self-review del plan

- Cobertura: constants/defaults, servicios puros de branding/time/message/stage state/preview, hooks de keyboard shortcuts y listeners de stage, tests y verificaciones están cubiertos por tareas concretas.
- Sin placeholders: cada archivo nuevo tiene contenido inicial explícito y cada comando tiene expected result.
- Consistencia: los nombres `createDashboardBrandingPayload`, `createDashboardMessagePayload`, `createSequenceMessagePayload`, `createDashboardStageStatePayload`, `registerDashboardKeyboardShortcuts`, `registerGlobalShortcuts`, `registerStageInitialDataRequest` y `registerStageWindowCloseOnExit` se mantienen iguales entre tests, implementación e imports.
