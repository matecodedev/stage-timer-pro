import { Button } from './Button';

export function InitialTimePanel({
  hours,
  setHours,
  minutes,
  setMinutes,
  seconds,
  setSeconds,
  applyInitial,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">⏰ Tiempo Inicial</h3>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-300">Horas</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(Math.max(0, +e.target.value || 0))}
            className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="0"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-300">Min</label>
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(Math.max(0, Math.min(59, +e.target.value || 0)))}
            className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="0"
            max="59"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-300">Seg</label>
          <input
            type="number"
            value={seconds}
            onChange={(e) => setSeconds(Math.max(0, Math.min(59, +e.target.value || 0)))}
            className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="0"
            max="59"
          />
        </div>
      </div>
      <Button onClick={applyInitial} variant="primary" className="w-full">
        Aplicar Tiempo
      </Button>
    </div>
  );
}
