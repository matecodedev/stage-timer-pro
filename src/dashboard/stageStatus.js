export function getStageStatusViewModel(stageOpenStatus) {
  const isOpening = stageOpenStatus === 'opening';

  const statusTextMap = {
    opening: 'Abriendo y posicionando Stage...',
    ready: 'Stage listo',
    error: 'No se pudo abrir Stage. Reintentá.',
    busy: 'Apertura en progreso. Esperá un momento.',
    idle: null,
  };

  const statusText = statusTextMap[stageOpenStatus] ?? null;
  const statusClassName =
    stageOpenStatus === 'error'
      ? 'text-xs text-red-500 dark:text-red-400'
      : 'text-xs text-emerald-500 dark:text-emerald-400';

  const openButtonLabel = isOpening ? '⏳ Abriendo Stage...' : '🖥️ Abrir Stage Fullscreen';

  return {
    isOpening,
    statusText,
    statusClassName,
    openButtonLabel,
  };
}
