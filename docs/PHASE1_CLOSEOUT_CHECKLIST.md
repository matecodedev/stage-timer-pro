# Phase 1 — Closeout Checklist

## Objetivo
Cerrar la Fase 1 con criterios claros de calidad técnica + QA funcional antes de pasar a la siguiente fase.

## Estado técnico (automático)

- [x] `npm run lint` en verde
- [x] `npm run test` en verde
- [x] `npm run format:check` en verde
- [x] Refactor de secuencia centralizado (helpers + actions + side effects)
- [x] Hardening Stage open flow (retry + guard de concurrencia)
- [x] Feedback de estado Stage en UI (`opening`, `ready`, `error`, `busy`)
- [x] Persistencia de settings robusta (read/write guard + normalización + clamping)

## QA funcional (web preview)

- [x] Agregar timers de secuencia desde presets
- [x] Iniciar secuencia y ver progreso en panel + preview
- [x] Saltar entre timers de secuencia
- [x] Enviar/ocultar mensajes y validar preview
- [x] Verificar que el botón de Stage se deshabilita en preview web

## QA funcional (Tauri real) — pendiente para cierre total

- [ ] Abrir Stage en app Tauri
- [ ] Posicionar Stage en monitor secundario
- [ ] Reintentar apertura tras fallo inicial
- [ ] Verificar fullscreen real
- [ ] Verificar atajos globales desde otra app
- [ ] Cerrar/reabrir Stage y confirmar estabilidad
- [ ] Confirmar persistencia de settings entre reinicios de app

## Criterio de “Fase 1 cerrada”

La Fase 1 se considera cerrada cuando:
1. Todo el bloque automático sigue en verde.
2. El bloque de QA Tauri real queda completo sin regresiones.
3. Se registra un resumen final de fase en memoria + nota de release interna.

## Próximo paso recomendado (Fase 2)

Foco en robustez de runtime y UX fina:
- tratamiento de errores de comandos nativos en UI
- validaciones de inputs y mensajes de recuperación
- hardening de edge cases restantes
