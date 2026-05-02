import { Button } from './Button';

export function AdvancedColorsPanel({
  enableAdvancedColors,
  setEnableAdvancedColors,
  colorThresholds,
  setColorThresholds,
}) {
  return (
    <>
      {/* Configuración Avanzada de Colores */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            🎨 Colores Avanzados del Timer
          </h3>
          <div className="flex items-center gap-2">
            <input
              id="enableAdvancedColors"
              type="checkbox"
              checked={enableAdvancedColors}
              onChange={(e) => setEnableAdvancedColors(e.target.checked)}
              className="text-blue-500"
            />
            <label
              htmlFor="enableAdvancedColors"
              className="text-xs text-gray-600 dark:text-gray-300"
            >
              Activar colores avanzados
            </label>
          </div>
        </div>

        {enableAdvancedColors && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  🔴 Crítico (min)
                </label>
                <input
                  type="number"
                  value={colorThresholds.critical}
                  onChange={(e) =>
                    setColorThresholds((prev) => ({
                      ...prev,
                      critical: Math.max(0, +e.target.value || 0),
                    }))
                  }
                  className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                />
                <div className="text-xs text-gray-400 mt-1">Últimos minutos</div>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  🟠 Alerta (min)
                </label>
                <input
                  type="number"
                  value={colorThresholds.warning}
                  onChange={(e) =>
                    setColorThresholds((prev) => ({
                      ...prev,
                      warning: Math.max(0, +e.target.value || 0),
                    }))
                  }
                  className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                />
                <div className="text-xs text-gray-400 mt-1">Tiempo de alerta</div>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  🟡 Precaución (min)
                </label>
                <input
                  type="number"
                  value={colorThresholds.caution}
                  onChange={(e) =>
                    setColorThresholds((prev) => ({
                      ...prev,
                      caution: Math.max(0, +e.target.value || 0),
                    }))
                  }
                  className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                />
                <div className="text-xs text-gray-400 mt-1">Tiempo de atención</div>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  🟢 Bueno (%)
                </label>
                <input
                  type="number"
                  value={colorThresholds.good}
                  onChange={(e) =>
                    setColorThresholds((prev) => ({
                      ...prev,
                      good: Math.max(0, Math.min(100, +e.target.value || 0)),
                    }))
                  }
                  className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  max="100"
                />
                <div className="text-xs text-gray-400 mt-1">% tiempo restante</div>
              </div>
            </div>

            {/* Vista previa de colores */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                Vista previa de estados:
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#059669' }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    Bueno (&gt;{colorThresholds.good}%)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Transición</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    Precaución ({colorThresholds.caution}m)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    Alerta ({colorThresholds.warning}m)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    Crítico ({colorThresholds.critical}m)
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de presets */}
            <div className="mt-3 pt-3 border-t dark:border-gray-600">
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">Presets rápidos:</div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() =>
                    setColorThresholds({ critical: 1, warning: 3, caution: 5, good: 50 })
                  }
                  variant="default"
                  className="text-xs"
                >
                  🚀 Presentación Rápida
                </Button>
                <Button
                  onClick={() =>
                    setColorThresholds({ critical: 2, warning: 5, caution: 10, good: 25 })
                  }
                  variant="default"
                  className="text-xs"
                >
                  📋 Conferencia Estándar
                </Button>
                <Button
                  onClick={() =>
                    setColorThresholds({ critical: 5, warning: 15, caution: 30, good: 20 })
                  }
                  variant="default"
                  className="text-xs"
                >
                  🎓 Evento Largo
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
