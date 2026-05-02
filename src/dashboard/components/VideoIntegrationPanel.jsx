import { Button } from './Button';

export function VideoIntegrationPanel({ setStageForCapture, resetStageWindow }) {
  return (
    <>
      {/* Integración con Software de Video */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🎥</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Integración con Software de Video
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Configuración de Captura */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              Configurar Stage para Captura
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setStageForCapture(1920, 1080)}
                variant="primary"
                className="text-xs py-2"
              >
                📺 1920×1080
              </Button>
              <Button
                onClick={() => setStageForCapture(1280, 720)}
                variant="primary"
                className="text-xs py-2"
              >
                📺 1280×720
              </Button>
              <Button
                onClick={() => setStageForCapture(1024, 768)}
                variant="primary"
                className="text-xs py-2"
              >
                📺 1024×768
              </Button>
              <Button onClick={() => resetStageWindow()} variant="warning" className="text-xs py-2">
                🔄 Reset
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => window.open('https://obsproject.com/', '_blank')}
                variant="default"
                className="text-xs flex-1 py-2"
              >
                📥 OBS Studio
              </Button>
              <Button
                onClick={() => window.open('https://ndi.video/tools/', '_blank')}
                variant="default"
                className="text-xs flex-1 py-2"
              >
                📥 NDI Tools
              </Button>
            </div>
          </div>

          {/* Métodos de Integración */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Métodos de Integración
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                  🥇 NDI (Recomendado)
                </div>
                <div className="text-blue-700 dark:text-blue-400">
                  Calidad profesional • Sin lag • Fácil setup
                </div>
              </div>

              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <div className="font-medium text-green-800 dark:text-green-300 mb-1">
                  🥈 OBS Virtual Camera
                </div>
                <div className="text-green-700 dark:text-green-400">
                  Gratis • Compatible con todo • Fácil
                </div>
              </div>

              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                <div className="font-medium text-orange-800 dark:text-orange-300 mb-1">
                  🥉 Captura Directa
                </div>
                <div className="text-orange-700 dark:text-orange-400">
                  Básico • Mayor uso de CPU
                </div>
              </div>
            </div>

            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
              <div className="text-xs text-purple-700 dark:text-purple-300">
                💡 <strong>Tip:</strong> Usa fondo negro para mejor chromakey
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
