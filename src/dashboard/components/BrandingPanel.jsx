export function BrandingPanel({
  logo,
  setLogo,
  logoSize,
  setLogoSize,
  showBranding,
  setShowBranding,
  blackBackground,
  setBlackBackground,
}) {
  return (
    <>
      {/* Branding del Evento */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🎨</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Branding del Evento</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              URL del Logo
            </label>
            <input
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <span>💡</span> Recomendado: 200×80px, PNG/JPG
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Tamaño del Logo (px)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="24"
                max="120"
                value={logoSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  console.log('🎛️ SLIDER CHANGED TO:', newSize);
                  setLogoSize(newSize);
                }}
                className="flex-1"
              />
              <input
                type="number"
                min="24"
                max="120"
                value={logoSize}
                onChange={(e) => {
                  const newSize = Math.max(24, Math.min(120, Number(e.target.value)));
                  console.log('🔢 INPUT CHANGED TO:', newSize);
                  setLogoSize(newSize);
                }}
                className="w-16 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-white"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showBranding}
                onChange={(e) => setShowBranding(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-gray-600 dark:text-gray-300">Mostrar logo</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={blackBackground}
                onChange={(e) => setBlackBackground(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-gray-600 dark:text-gray-300">Fondo negro</span>
            </label>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium text-purple-600 dark:text-purple-400">
                ℹ️ Información:
              </span>{' '}
              Los colores del stage se configuran automáticamente según el estado del timer (verde,
              amarillo, rojo).
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
