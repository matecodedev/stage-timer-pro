import { formatDashboardTime } from '../timeConfig.js';

export function StagePreviewPanel({
  state,
  timerSequence,
  logo,
  logoSize,
  showBranding,
  getPreviewBackgroundColor,
  getPreviewTextColor,
}) {
  return (
    <>
      {/* Vista Previa del Stage */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">👁️</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Vista Previa del Stage</h3>
        </div>

        <div className="space-y-3">
          {/* Simulación del Stage en miniatura */}
          <div
            className="relative border border-gray-300 dark:border-gray-600 rounded-lg aspect-video flex flex-col items-center justify-center text-center overflow-hidden"
            style={{
              minHeight: '200px',
              backgroundColor: getPreviewBackgroundColor(),
            }}
          >
            {/* Timer Principal */}
            <div
              className="text-4xl font-mono font-bold mb-2"
              style={{
                color: getPreviewTextColor(),
              }}
            >
              {formatDashboardTime(state.remainingMs)}
            </div>

            {/* Nombre del Timer */}
            {state.currentTimerName && (
              <div
                className="text-lg font-medium mb-2 opacity-80"
                style={{
                  color: getPreviewTextColor(),
                }}
              >
                {state.currentTimerName}
              </div>
            )}

            {/* Mensaje si existe */}
            {state.messageShown && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div
                  className="text-xl font-bold text-center px-4 text-white"
                  style={{
                    fontSize: Math.min(24, (state.messageFontSize || 200) * 0.1) + 'px',
                  }}
                >
                  {state.messageText}
                </div>
              </div>
            )}

            {/* Logo si está configurado - centrado como en el stage */}
            {logo && showBranding && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-auto object-contain opacity-80"
                  style={{ height: logoSize * 0.67 + 'px' }} // Escalado para vista previa
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Branding matecode - SIEMPRE VISIBLE */}
            <div
              className="absolute bottom-2 right-2 text-xs opacity-60"
              style={{
                color: getPreviewTextColor(),
              }}
            >
              Hecho con ♥ por MateCode
            </div>

            {/* Barra de progreso */}
            <div className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-30 w-full">
              <div
                className="h-full transition-all duration-1000"
                style={{
                  width: `${Math.max(0, Math.min(100, ((state.totalMs - state.remainingMs) / state.totalMs) * 100))}%`,
                  backgroundColor: getPreviewTextColor(),
                }}
              ></div>
            </div>
          </div>

          {/* Información del estado actual */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="font-medium text-gray-600 dark:text-gray-300">Estado</div>
              <div className="text-gray-800 dark:text-gray-200 capitalize">
                {state.color || 'Detenido'}
              </div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="font-medium text-gray-600 dark:text-gray-300">Progreso</div>
              <div className="text-gray-800 dark:text-gray-200">
                {Math.round(((state.totalMs - state.remainingMs) / state.totalMs) * 100 || 0)}%
              </div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="font-medium text-gray-600 dark:text-gray-300">Secuencia</div>
              <div className="text-gray-800 dark:text-gray-200">
                {state.currentSequenceIndex !== null
                  ? `${state.currentSequenceIndex + 1}/${timerSequence.length}`
                  : 'Individual'}
              </div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="font-medium text-gray-600 dark:text-gray-300">Mensaje</div>
              <div className="text-gray-800 dark:text-gray-200">
                {state.messageShown ? 'Visible' : 'Oculto'}
              </div>
            </div>
          </div>

          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">🔄 Actualización en tiempo real:</span> Esta vista
              previa refleja exactamente lo que se muestra en el Stage.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
