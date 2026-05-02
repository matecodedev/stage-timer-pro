# Fase 5 — Dashboard UI Extraction Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reducir el tamaño de `src/main.jsx` extrayendo bloques visuales ya existentes a componentes pequeños bajo `src/dashboard/components/`, sin cambiar lógica de negocio ni comportamiento observable.

**Architecture:** Esta fase mueve JSX y handlers por props. No cambia servicios, hooks de integración, contrato Stage, timer, Tauri ni estilos globales. `src/main.jsx` sigue siendo el orquestador de estado y callbacks; los componentes extraídos son presentacionales y reciben todo por props.

**Tech Stack:** React 18, Vite, JavaScript ESM, Tailwind CSS, Vitest existente para regresión general.

---

## Contexto verificado

- Base previa: `97ce87f refactor: modularize dashboard architecture`.
- Fase 4 ya creó `src/dashboard/` para servicios, hooks, listeners y `Button`.
- Esta fase continúa la reducción de `src/main.jsx`, pero sólo en la capa visual.
- No se ejecuta build.
- No se instalan dependencias.
- No se modifica `src/stage.jsx`.
- No se mezclan cambios Rust/Tauri como `src-tauri/Cargo.lock` con esta fase.

## Componentes extraídos

### `src/dashboard/components/HeaderPanel.jsx`

Responsabilidad: renderizar el título principal y subtítulo del dashboard.

Props: ninguna.

### `src/dashboard/components/InitialTimePanel.jsx`

Responsabilidad: renderizar inputs de horas, minutos, segundos y botón `Aplicar Tiempo`.

Props:

- `hours`
- `setHours`
- `minutes`
- `setMinutes`
- `seconds`
- `setSeconds`
- `applyInitial`

### `src/dashboard/components/SettingsPanel.jsx`

Responsabilidad: renderizar warning en minutos y toggle de modo negativo.

Props:

- `warn`
- `setWarnMin`
- `neg`
- `toggleNeg`

### `src/dashboard/components/ControlsPanel.jsx`

Responsabilidad: renderizar controles `Start`, `Pause`, `Stop` y botones de suma/resta de minutos.

Props:

- `start`
- `pause`
- `stop`
- `addMin`

### `src/dashboard/components/StageDisplayPanel.jsx`

Responsabilidad: renderizar botón para abrir Stage fullscreen y ayuda de atajos.

Props:

- `openFullscreen`

### `src/dashboard/components/CurrentTimePanel.jsx`

Responsabilidad: renderizar configuración de hora actual y su preview.

Props:

- `showCurrentTime`
- `setShowCurrentTime`
- `timeFormat24h`
- `setTimeFormat24h`
- `showSeconds`
- `setShowSeconds`
- `timePosition`
- `setTimePosition`
- `brandColors`

## Archivos modificados

- `src/main.jsx` — reemplaza bloques JSX por componentes presentacionales.

## Archivos creados

- `src/dashboard/components/HeaderPanel.jsx`
- `src/dashboard/components/InitialTimePanel.jsx`
- `src/dashboard/components/SettingsPanel.jsx`
- `src/dashboard/components/ControlsPanel.jsx`
- `src/dashboard/components/StageDisplayPanel.jsx`
- `src/dashboard/components/CurrentTimePanel.jsx`

## Fuera de alcance

- Rediseño visual premium.
- Cambios de clases Tailwind.
- Cambios en textos visibles.
- Cambios de lógica del timer.
- Cambios en Stage contract.
- Cambios en Tauri/Rust.
- Cambios en `src-tauri/Cargo.lock`.
- Migración a TypeScript.
- Tests DOM nuevos con dependencias adicionales.
- Build.

## Tareas

### Task 1: Header

- [x] Crear `HeaderPanel.jsx` con el título y subtítulo existentes.
- [x] Importar `HeaderPanel` en `src/main.jsx`.
- [x] Reemplazar el bloque JSX del header por `<HeaderPanel />`.

### Task 2: Initial Time

- [x] Crear `InitialTimePanel.jsx`.
- [x] Mover JSX de horas/minutos/segundos sin cambiar labels, clases ni clamps.
- [x] Pasar setters y `applyInitial` desde `src/main.jsx`.
- [x] Reemplazar el bloque original por `<InitialTimePanel />`.

### Task 3: Settings

- [x] Crear `SettingsPanel.jsx`.
- [x] Mover warning y checkbox de negativo sin cambiar clases ni IDs.
- [x] Pasar `warn`, `setWarnMin`, `neg`, `toggleNeg` desde `src/main.jsx`.
- [x] Reemplazar el bloque original por `<SettingsPanel />`.

### Task 4: Controls

- [x] Crear `ControlsPanel.jsx`.
- [x] Mover botones Start/Pause/Stop y ajustes de minutos sin cambiar textos ni variantes.
- [x] Pasar `start`, `pause`, `stop`, `addMin` desde `src/main.jsx`.
- [x] Reemplazar el bloque original por `<ControlsPanel />`.

### Task 5: Stage Display

- [x] Crear `StageDisplayPanel.jsx`.
- [x] Mover botón de fullscreen y ayuda de atajos sin cambiar copy.
- [x] Pasar `openFullscreen` desde `src/main.jsx`.
- [x] Reemplazar el bloque original por `<StageDisplayPanel />`.

### Task 6: Current Time

- [x] Crear `CurrentTimePanel.jsx`.
- [x] Mover configuración de display de hora actual y preview.
- [x] Pasar estado, setters y `brandColors` desde `src/main.jsx`.
- [x] Reemplazar el bloque original por `<CurrentTimePanel />`.

### Task 7: Verificación

- [x] Ejecutar lint.
- [x] Ejecutar tests.
- [x] Ejecutar format check.
- [ ] Ejecutar `npm run check` completo cuando el entorno Codex pueda resolver `registry.npmjs.org` para `npm audit`.

## Criterios de aceptación

- `src/main.jsx` importa los seis componentes extraídos.
- Los componentes son presentacionales y no importan servicios Tauri ni mutan estado global por su cuenta.
- `src/stage.jsx` no cambia.
- `src-tauri/Cargo.lock` no forma parte de esta fase.
- `npm_config_cache=.npm-cache npm run lint` pasa.
- `npm_config_cache=.npm-cache npm run test` pasa.
- `npm_config_cache=.npm-cache npm run format:check` pasa.
- No se ejecuta build.

## Riesgos

- Sin tests DOM dedicados, la equivalencia visual queda cubierta por revisión de diff y verificaciones estáticas, no por snapshots de UI.
- `CurrentTimePanel` calcula `new Date()` durante render igual que el JSX original; se preserva comportamiento, no se optimiza en esta fase.
- Si `Cargo.lock` queda modificado en working tree, debe revisarse como cambio separado de Rust/Tauri y no mezclarse con este commit.
