export function SettingsPanel({ warn, setWarnMin, neg, toggleNeg }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">⚙️ Configuración</h3>
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-300">Warning (min)</label>
        <input
          type="number"
          value={warn}
          onChange={(e) => setWarnMin(+e.target.value || 0)}
          className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="neg"
          type="checkbox"
          checked={neg}
          onChange={toggleNeg}
          className="text-blue-500"
        />
        <label htmlFor="neg" className="text-xs text-gray-600 dark:text-gray-300">
          Contar en negativo
        </label>
      </div>
    </div>
  );
}
