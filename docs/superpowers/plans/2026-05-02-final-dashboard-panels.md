# Fase 5.6 — Final Dashboard Panels Extraction Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar la extracción visual pendiente de `src/main.jsx` moviendo branding, preview, atajos globales e integración de video a componentes presentacionales.

**Architecture:** `src/main.jsx` conserva estado y callbacks; los paneles nuevos reciben datos y acciones por props. No se cambia diseño, copy, clases Tailwind ni comportamiento. Cada extracción se verifica antes de continuar.

**Tech Stack:** React 18, Vite, JavaScript ESM, Tailwind CSS, Vitest.

---

## Contexto

- Base actual: `ef155df refactor: extract remaining dashboard panels`.
- `src/main.jsx` mide aproximadamente 1354 líneas.
- `src-tauri/Cargo.lock` está modificado por una investigación Rust/Tauri separada y queda fuera de esta fase.

## Fuera de alcance

- Rediseño premium.
- Cambios de lógica Tauri/Rust.
- Cambios en `src-tauri/Cargo.lock`.
- Cambios en `src/stage.jsx`.
- Build.
- Instalación de dependencias.

## Paneles a extraer

1. `BrandingPanel.jsx` — configuración de logo, tamaño, mostrar logo y fondo negro.
2. `StagePreviewPanel.jsx` — vista previa del Stage y estado actual.
3. `GlobalShortcutsPanel.jsx` — documentación visual de atajos globales.
4. `VideoIntegrationPanel.jsx` — integración con OBS/NDI/captura.

## Verificación obligatoria después de cada extracción

```bash
npm_config_cache=.npm-cache npm run lint && npm_config_cache=.npm-cache npm run test && npm_config_cache=.npm-cache npm run format:check
```

Expected: lint, tests and format check pass.

## Tareas

### Task 1: BrandingPanel

- [ ] Crear `src/dashboard/components/BrandingPanel.jsx`.
- [ ] Mover JSX de `Branding del Evento` sin cambiar copy/clases.
- [ ] Pasar `logo`, `setLogo`, `logoSize`, `setLogoSize`, `showBranding`, `setShowBranding`, `blackBackground`, `setBlackBackground`.
- [ ] Reemplazar bloque en `src/main.jsx`.
- [ ] Ejecutar verificación obligatoria.

### Task 2: StagePreviewPanel

- [ ] Crear `src/dashboard/components/StagePreviewPanel.jsx`.
- [ ] Mover JSX de `Vista Previa del Stage` sin cambiar copy/clases.
- [ ] Pasar `state`, `timerSequence`, `logo`, `logoSize`, `showBranding`, `getPreviewBackgroundColor`, `getPreviewTextColor`.
- [ ] Importar `formatDashboardTime` dentro del componente.
- [ ] Reemplazar bloque en `src/main.jsx`.
- [ ] Ejecutar verificación obligatoria.

### Task 3: GlobalShortcutsPanel

- [ ] Crear `src/dashboard/components/GlobalShortcutsPanel.jsx`.
- [ ] Mover JSX de `Atajos Globales` sin props.
- [ ] Reemplazar bloque en `src/main.jsx`.
- [ ] Ejecutar verificación obligatoria.

### Task 4: VideoIntegrationPanel

- [ ] Crear `src/dashboard/components/VideoIntegrationPanel.jsx`.
- [ ] Mover JSX de `Integración con Software de Video` sin cambiar copy/clases.
- [ ] Pasar `setStageForCapture`, `resetStageWindow`.
- [ ] Reemplazar bloque en `src/main.jsx`.
- [ ] Ejecutar verificación obligatoria.

## Criterios de aceptación

- `src/main.jsx` queda por debajo de 1000 líneas si no aparece un bloque imprevisto.
- Nuevos componentes no importan Tauri ni mutan estado por fuera de props.
- `src-tauri/Cargo.lock` no se commitea.
- Verificación pasa después de cada extracción.
- No se ejecuta build.
