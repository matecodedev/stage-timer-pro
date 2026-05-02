export function GlobalShortcutsPanel() {
  return (
    <>
      {/* Atajos Globales */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">⚡</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Atajos Globales</h3>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600">
              ⌘+Shift+Space
            </code>
            <span className="text-xs text-gray-600 dark:text-gray-300">Start/Pause</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600">
              ⌘+Shift+R
            </code>
            <span className="text-xs text-gray-600 dark:text-gray-300">Reset Timer</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600">
              ⌘+Shift+F
            </code>
            <span className="text-xs text-gray-600 dark:text-gray-300">Toggle Fullscreen</span>
          </div>
        </div>

        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
            <span>✅</span> Activos desde cualquier aplicación
          </div>
        </div>
      </div>
    </>
  );
}
