import { Button } from './Button';

export function StageDisplayPanel({ openFullscreen, canOpenNativeStage = true }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">🎬 Stage Display</h3>
      <Button
        onClick={openFullscreen}
        variant="primary"
        className="w-full"
        disabled={!canOpenNativeStage}
      >
        🖥️ Abrir Stage Fullscreen
      </Button>
      {!canOpenNativeStage && (
        <div className="text-xs text-amber-500 dark:text-amber-400">
          Disponible sólo dentro de la app Tauri. En preview web no se pueden abrir ventanas en
          pantalla secundaria.
        </div>
      )}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        ⌨️ Atajos: Space (▶️/⏸️), S (⏹️), +/− (±1m), D (🌙/☀️)
      </div>
    </div>
  );
}
