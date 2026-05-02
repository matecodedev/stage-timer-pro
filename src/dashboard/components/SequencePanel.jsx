import { Button } from './Button';

export function SequencePanel({
  sequenceMode,
  timerSequence,
  currentSequenceIndex,
  jumpToSequenceTimer,
  removeTimerFromSequence,
  startSequence,
  stopSequence,
  autoAdvance,
  setAutoAdvance,
}) {
  return (
    <>
      {/* Timers Secuenciales */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">📋 Secuencia</h3>

        {/* Estado actual de la secuencia */}
        {sequenceMode && timerSequence.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              Activo: {timerSequence[currentSequenceIndex]?.name}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {currentSequenceIndex + 1} de {timerSequence.length}
            </div>
          </div>
        )}

        {/* Lista de timers en la secuencia */}
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {timerSequence.map((timer, index) => (
            <div
              key={timer.id}
              className={`flex items-center justify-between p-1.5 rounded text-xs ${
                sequenceMode && index === currentSequenceIndex
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex-1 truncate">
                <div className="font-medium text-gray-900 dark:text-white">{timer.name}</div>
                <div className="text-gray-500 dark:text-gray-400">
                  {String(timer.hours).padStart(2, '0')}:{String(timer.minutes).padStart(2, '0')}:
                  {String(timer.seconds).padStart(2, '0')}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => jumpToSequenceTimer(index)}
                  className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                  disabled={!sequenceMode}
                  title="Saltar a este timer"
                >
                  ▶️
                </button>
                <button
                  onClick={() => removeTimerFromSequence(timer.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Controles de secuencia */}
        <div className="space-y-2">
          <div className="flex gap-1">
            <Button
              onClick={startSequence}
              variant="success"
              className="flex-1 text-xs"
              disabled={timerSequence.length === 0 || sequenceMode}
            >
              🎬 Iniciar Secuencia
            </Button>
            <Button
              onClick={stopSequence}
              variant="danger"
              className="flex-1 text-xs"
              disabled={!sequenceMode}
            >
              ⏹️ Detener
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="autoAdvance"
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="text-blue-500"
            />
            <label htmlFor="autoAdvance" className="text-xs text-gray-600 dark:text-gray-300">
              Avance automático
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
