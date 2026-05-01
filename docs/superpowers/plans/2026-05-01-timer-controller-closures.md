# Fase 3 — Timer controller closures estables

## Objetivo

Estabilizar callbacks y lecturas de estado del controlador principal del timer para reducir closures obsoletas en listeners, intervalos, timeouts y handlers de control, sin rediseñar la UI ni cambiar el contrato visual del Stage.

## Alcance

- Crear hooks compartidos para acceder a la implementación más reciente desde callbacks con identidad estable.
- Migrar el controlador en `src/main.jsx` para que listeners de larga vida y loops periódicos llamen callbacks estables.
- Incorporar refs de valores actuales para evitar lecturas obsoletas en payloads, secuencias, fullscreen y entradas del timer.
- Mantener `timeConfigRef` existente y no duplicarlo.
- No ejecutar build, no instalar dependencias, no commitear y no pushear.

## Fuera de alcance

- Rediseño de UI.
- Cambios de arquitectura grandes fuera del controlador principal.
- Cambios al contrato de eventos del Stage.
- Instalación de dependencias nuevas.
- Build de producción.

## Tareas

1. Crear este plan en `docs/superpowers/plans/2026-05-01-timer-controller-closures.md`.
2. Escribir primero `src/shared/hooks/useStableCallback.test.jsx`.
   - Validar que el callback conserve identidad entre renders.
   - Validar que el callback ejecute la implementación más reciente después de un rerender.
3. Ejecutar el test del hook para verificar RED cuando todavía no existan los hooks.
4. Crear `src/shared/hooks/useLatest.js`.
   - Debe devolver una ref estable.
   - Debe mantener `ref.current` sincronizado con el valor más reciente.
5. Crear `src/shared/hooks/useStableCallback.js`.
   - Debe devolver una función con identidad estable.
   - Debe delegar en la implementación actual guardada por `useLatest`.
6. Ejecutar el test del hook para verificar GREEN.
7. Migrar `src/main.jsx`.
   - Importar `useLatest` y `useStableCallback`.
   - Agregar `stateRef`, `timerInputsRef`, `sequenceRef` y `fullscreenRef`.
   - Conservar `timeConfigRef` como única fuente para configuración de hora actual.
   - Estabilizar `pushStageState`.
   - Estabilizar controles `start`, `pause`, `stop`, `addMin`, `setWarnMin` y `toggleNeg`.
   - Estabilizar fullscreen toggle.
   - Estabilizar `handleStartStop` y `handleReset`.
   - Estabilizar `loadTimerFromSequence`, `advanceToNextTimer` y `tick`.
   - Actualizar keydown local para llamar callbacks estables.
   - Actualizar listener de request inicial del Stage para llamar callback estable.
   - Mantener el loop `setInterval(tick, 100)` apuntando a callback estable.
8. Ejecutar verificaciones permitidas.
   - `npm_config_cache=.npm-cache npm run format`
   - `npm_config_cache=.npm-cache npm run check`
   - Revisión con grep de listeners e intervalos para confirmar que llaman callbacks estables.

## Verificaciones esperadas

- El test del hook falla en RED por módulo inexistente o comportamiento faltante antes de crear los hooks.
- El test del hook pasa en GREEN después de crear los hooks.
- `npm run format` completa sin errores.
- `npm run check` completa sin errores o reporta únicamente problemas externos no introducidos por esta fase.
- Los listeners de larga vida y el intervalo invocan callbacks creados con `useStableCallback` o callbacks que delegan en ellos.

## Riesgos

- `npm audit --audit-level=high` forma parte de `npm run check`; puede requerir red o fallar por condiciones del registry/cache, no por el cambio de código.
- `src/main.jsx` concentra mucha lógica del dashboard; el cambio debe ser quirúrgico para no convertir esta fase en un rediseño.
- Los timeouts que autoarrancan secuencias deben leer refs actuales para evitar iniciar un timer viejo después de cambios rápidos.
