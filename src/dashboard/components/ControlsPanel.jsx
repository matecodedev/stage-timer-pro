import { Button } from './Button';

export function ControlsPanel({ start, pause, stop, addMin }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">🎮 Controles</h3>
      <div className="flex gap-2">
        <Button onClick={start} variant="success" className="flex-1 text-xs">
          ▶️ Start
        </Button>
        <Button onClick={pause} variant="warning" className="flex-1 text-xs">
          ⏸️ Pause
        </Button>
        <Button onClick={stop} variant="danger" className="flex-1 text-xs">
          ⏹️ Stop
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <Button onClick={() => addMin(1)} className="text-xs">
          +1m
        </Button>
        <Button onClick={() => addMin(5)} className="text-xs">
          +5m
        </Button>
        <Button onClick={() => addMin(10)} className="text-xs">
          +10m
        </Button>
        <Button onClick={() => addMin(-1)} className="text-xs">
          -1m
        </Button>
        <Button onClick={() => addMin(-5)} className="text-xs">
          -5m
        </Button>
        <Button onClick={() => addMin(-10)} className="text-xs">
          -10m
        </Button>
      </div>
    </div>
  );
}
