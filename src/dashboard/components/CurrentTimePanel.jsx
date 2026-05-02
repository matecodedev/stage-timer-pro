export function CurrentTimePanel({
  showCurrentTime,
  setShowCurrentTime,
  timeFormat24h,
  setTimeFormat24h,
  showSeconds,
  setShowSeconds,
  timePosition,
  setTimePosition,
  brandColors,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">🕒 Display de Hora Actual</h3>
        <div className="flex items-center gap-2">
          <input
            id="showCurrentTime"
            type="checkbox"
            checked={showCurrentTime}
            onChange={(e) => setShowCurrentTime(e.target.checked)}
            className="text-blue-500"
          />
          <label htmlFor="showCurrentTime" className="text-xs text-gray-600 dark:text-gray-300">
            Mostrar hora actual
          </label>
        </div>
      </div>

      {showCurrentTime && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                🕐 Formato de Hora
              </label>
              <select
                value={timeFormat24h ? '24h' : '12h'}
                onChange={(e) => setTimeFormat24h(e.target.value === '24h')}
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="24h">24 horas (14:30)</option>
                <option value="12h">12 horas (2:30 PM)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                ⏰ Mostrar Segundos
              </label>
              <select
                value={showSeconds ? 'yes' : 'no'}
                onChange={(e) => setShowSeconds(e.target.value === 'yes')}
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="yes">Sí (14:30:45)</option>
                <option value="no">No (14:30)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                📍 Posición en Stage
              </label>
              <select
                value={timePosition}
                onChange={(e) => setTimePosition(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="top-left">↖️ Superior Izquierda</option>
                <option value="top-right">↗️ Superior Derecha</option>
                <option value="bottom-left">↙️ Inferior Izquierda</option>
                <option value="bottom-right">↘️ Inferior Derecha</option>
              </select>
            </div>
          </div>

          {/* Vista previa de hora */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
              Vista previa de hora:
            </div>
            <div className="flex items-center gap-2">
              <div
                className="px-3 py-1 rounded font-mono text-lg"
                style={{ backgroundColor: brandColors.background, color: brandColors.primary }}
              >
                {(() => {
                  const now = new Date();
                  if (timeFormat24h) {
                    return showSeconds
                      ? now.toLocaleTimeString('es-ES', { hour12: false })
                      : now.toLocaleTimeString('es-ES', { hour12: false, second: undefined });
                  } else {
                    return showSeconds
                      ? now.toLocaleTimeString('es-ES', { hour12: true })
                      : now.toLocaleTimeString('es-ES', { hour12: true, second: undefined });
                  }
                })()}
              </div>
              <span className="text-xs text-gray-500">
                Se mostrará en{' '}
                {timePosition === 'top-left'
                  ? 'superior izquierda'
                  : timePosition === 'top-right'
                    ? 'superior derecha'
                    : timePosition === 'bottom-left'
                      ? 'inferior izquierda'
                      : 'inferior derecha'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
