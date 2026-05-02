import { Button } from './Button';

export function SequenceTimerFormPanel({
  newTimerName,
  setNewTimerName,
  newTimerHours,
  setNewTimerHours,
  newTimerMinutes,
  setNewTimerMinutes,
  newTimerSeconds,
  setNewTimerSeconds,
  addTimerToSequence,
}) {
  return (
    <>
      {/* Agregar Timer a Secuencia */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          ➕ Agregar Timer a Secuencia
        </h3>
        <div className="grid grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-300">Nombre del Timer</label>
            <input
              type="text"
              value={newTimerName}
              onChange={(e) => setNewTimerName(e.target.value)}
              placeholder="ej: Introducción"
              className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-300">Horas</label>
            <input
              type="number"
              value={newTimerHours}
              onChange={(e) => setNewTimerHours(Math.max(0, +e.target.value || 0))}
              className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-300">Minutos</label>
            <input
              type="number"
              value={newTimerMinutes}
              onChange={(e) => setNewTimerMinutes(Math.max(0, Math.min(59, +e.target.value || 0)))}
              className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
              max="59"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-300">Segundos</label>
            <input
              type="number"
              value={newTimerSeconds}
              onChange={(e) => setNewTimerSeconds(Math.max(0, Math.min(59, +e.target.value || 0)))}
              className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
              max="59"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={addTimerToSequence}
              variant="success"
              className="w-full"
              disabled={!newTimerName.trim()}
            >
              ➕ Agregar
            </Button>
          </div>
        </div>

        {/* Plantillas rápidas */}
        <div className="mt-3 pt-3 border-t dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            🎯 Plantillas Rápidas:
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => {
                setNewTimerName('Introducción');
                setNewTimerMinutes(5);
                setNewTimerSeconds(0);
              }}
              variant="default"
              className="text-xs"
            >
              📢 Introducción (5m)
            </Button>
            <Button
              onClick={() => {
                setNewTimerName('Presentación');
                setNewTimerMinutes(15);
                setNewTimerSeconds(0);
              }}
              variant="default"
              className="text-xs"
            >
              🎤 Presentación (15m)
            </Button>
            <Button
              onClick={() => {
                setNewTimerName('Q&A');
                setNewTimerMinutes(10);
                setNewTimerSeconds(0);
              }}
              variant="default"
              className="text-xs"
            >
              ❓ Q&A (10m)
            </Button>
            <Button
              onClick={() => {
                setNewTimerName('Descanso');
                setNewTimerMinutes(15);
                setNewTimerSeconds(0);
              }}
              variant="default"
              className="text-xs"
            >
              ☕ Descanso (15m)
            </Button>
            <Button
              onClick={() => {
                setNewTimerName('Cierre');
                setNewTimerMinutes(5);
                setNewTimerSeconds(0);
              }}
              variant="default"
              className="text-xs"
            >
              🎯 Cierre (5m)
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
