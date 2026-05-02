import { Button } from './Button';

export function MessagePanels({
  message,
  setMessage,
  messageTtl,
  setMessageTtl,
  fontSize,
  setFontSize,
  blinking,
  setBlinking,
  replaceTimer,
  setReplaceTimer,
  persistMsg,
  setPersistMsg,
  sendMessage,
  hideMessage,
  presetMessages,
  sendPresetMessage,
}) {
  return (
    <>
      {/* Mensajes y Comunicación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mensaje personalizado */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">💬</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Mensaje Personalizado</h3>
          </div>

          <div className="space-y-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Tamaño
                </label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.max(12, +e.target.value || 200))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white"
                  min="12"
                  placeholder="200px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Duración
                </label>
                <input
                  type="number"
                  value={messageTtl}
                  onChange={(e) => setMessageTtl(+e.target.value || 0)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="5s"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Opciones
                </label>
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={blinking}
                      onChange={(e) => setBlinking(e.target.checked)}
                      className="w-3 h-3 text-blue-600 rounded"
                    />
                    <span className="text-gray-600 dark:text-gray-300">Titila</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={replaceTimer}
                      onChange={(e) => setReplaceTimer(e.target.checked)}
                      className="w-3 h-3 text-blue-600 rounded"
                    />
                    <span className="text-gray-600 dark:text-gray-300">Reemplaza timer</span>
                  </label>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={persistMsg}
                onChange={(e) => setPersistMsg(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-600 dark:text-gray-300">
                Mantener hasta ocultar manualmente
              </span>
            </label>

            <div className="flex gap-2">
              <Button onClick={sendMessage} variant="primary" className="flex-1 text-sm py-2">
                📤 Enviar
              </Button>
              <Button onClick={hideMessage} variant="danger" className="flex-1 text-sm py-2">
                🚫 Ocultar
              </Button>
            </div>
          </div>
        </div>

        {/* Mensajes predefinidos */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Mensajes Predefinidos</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {presetMessages.map((preset, index) => (
              <Button
                key={index}
                onClick={() => sendPresetMessage(preset)}
                variant="default"
                className="text-xs py-2 px-3 hover:scale-105 transition-transform"
              >
                {preset}
              </Button>
            ))}
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                💡 Configuración:
              </span>{' '}
              Los mensajes usan el tamaño, titilación y duración actuales.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
