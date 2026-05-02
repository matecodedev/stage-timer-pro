import { Button } from './Button';

export function StageDisplayPanel({ openFullscreen }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">🎬 Stage Display</h3>
      <Button onClick={openFullscreen} variant="primary" className="w-full">
        🖥️ Abrir Stage Fullscreen
      </Button>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        ⌨️ Atajos: Space (▶️/⏸️), S (⏹️), +/− (±1m), D (🌙/☀️)
      </div>
    </div>
  );
}
