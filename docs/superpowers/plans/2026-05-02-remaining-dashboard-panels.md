# Fase 5.5 — Remaining Dashboard Panels Extraction Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reducir `src/main.jsx` extrayendo paneles visuales restantes a componentes presentacionales, sin cambiar lógica de negocio ni comportamiento observable.

**Architecture:** `src/main.jsx` conserva estado, callbacks y wiring. Los nuevos componentes bajo `src/dashboard/components/` reciben datos y callbacks por props, reutilizan `Button`, mantienen clases Tailwind y textos existentes. Cada extracción se verifica con lint, tests y format check antes de continuar.

**Tech Stack:** React 18, Vite, JavaScript ESM, Tailwind CSS, Vitest.

---

## Contexto

- Base actual: `07a0e6d fix: clarify native stage availability in web preview`.
- Working tree tiene `src-tauri/Cargo.lock` modificado por trabajo Rust/Tauri separado. Esta fase no lo toca ni lo commitea.
- `src/main.jsx` mide aproximadamente 1795 líneas.
- Ya existen paneles extraídos: `HeaderPanel`, `InitialTimePanel`, `SettingsPanel`, `ControlsPanel`, `StageDisplayPanel`, `CurrentTimePanel`.

## Fuera de alcance

- Cambios de diseño premium.
- Cambios de lógica del timer/secuencia/mensajes.
- Cambios en `src-tauri/**`.
- Cambios en `src/stage.jsx`.
- Build.
- Instalación de dependencias.

## Paneles a extraer en esta fase

1. `SequenceTimerFormPanel.jsx` — formulario para agregar timers y plantillas rápidas.
2. `AdvancedColorsPanel.jsx` — configuración avanzada de colores, preview y presets.
3. `TimerDisplayPanel.jsx` — display grande del tiempo restante y estado/color actual.
4. `MessagePanels.jsx` — mensaje personalizado y mensajes predefinidos.

## Verificación obligatoria después de cada extracción

Run:

```bash
npm_config_cache=.npm-cache npm run lint && npm_config_cache=.npm-cache npm run test && npm_config_cache=.npm-cache npm run format:check
```

Expected:

```text
lint PASS
tests PASS
format:check PASS
```

## Tareas

### Task 1: SequenceTimerFormPanel

- [ ] Crear `src/dashboard/components/SequenceTimerFormPanel.jsx`.
- [ ] Mover el bloque `Agregar Timer a Secuencia` sin cambiar clases, textos ni clamps.
- [ ] Pasar por props `newTimerName`, `setNewTimerName`, `newTimerHours`, `setNewTimerHours`, `newTimerMinutes`, `setNewTimerMinutes`, `newTimerSeconds`, `setNewTimerSeconds`, `addTimerToSequence`.
- [ ] Reemplazar el bloque en `src/main.jsx`.
- [ ] Ejecutar verificación obligatoria.

### Task 2: AdvancedColorsPanel

- [ ] Crear `src/dashboard/components/AdvancedColorsPanel.jsx`.
- [ ] Mover `Configuración Avanzada de Colores` sin cambiar clases, textos, presets ni límites.
- [ ] Pasar por props `enableAdvancedColors`, `setEnableAdvancedColors`, `colorThresholds`, `setColorThresholds`.
- [ ] Reemplazar el bloque en `src/main.jsx`.
- [ ] Ejecutar verificación obligatoria.

### Task 3: TimerDisplayPanel

- [ ] Crear `src/dashboard/components/TimerDisplayPanel.jsx`.
- [ ] Mover `Display del reloj` sin cambiar clases ni render de `state.colorInfo`.
- [ ] Pasar por props `display`, `state`.
- [ ] Reemplazar el bloque en `src/main.jsx`.
- [ ] Ejecutar verificación obligatoria.

### Task 4: MessagePanels

- [ ] Crear `src/dashboard/components/MessagePanels.jsx`.
- [ ] Mover `Mensajes y Comunicación` sin cambiar clases, textos ni callbacks.
- [ ] Pasar por props `message`, `setMessage`, `messageTtl`, `setMessageTtl`, `fontSize`, `setFontSize`, `blinking`, `setBlinking`, `replaceTimer`, `setReplaceTimer`, `persistMsg`, `setPersistMsg`, `sendMessage`, `hideMessage`, `presetMessages`, `sendPresetMessage`.
- [ ] Reemplazar el bloque en `src/main.jsx`.
- [ ] Ejecutar verificación obligatoria.

## Criterios de aceptación

- `src/main.jsx` queda más chico y sigue orquestando estado/callbacks.
- Nuevos componentes son presentacionales.
- `src-tauri/Cargo.lock` queda sin commitear y sin tocar por esta fase.
- Lint/tests/format pasan después de cada extracción.
- No se ejecuta build.
