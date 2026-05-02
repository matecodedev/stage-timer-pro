export function TimerDisplayPanel({ display, state }) {
  return (
    <>
      {/* Display del reloj */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              ⏱️ Tiempo Restante
            </div>
            <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white">
              {display}
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-lg text-sm font-semibold border flex items-center gap-2 ${
              state.color === 'green' &&
              'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
            } ${
              state.color === 'yellow' &&
              'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
            } ${
              state.color === 'red' &&
              'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
            } ${
              (state.color === 'critical' || state.color === 'warning') &&
              'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
            } ${
              state.color === 'caution' &&
              'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
            } ${
              (state.color === 'transition' || state.color === 'good') &&
              'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
            }`}
          >
            {state.colorInfo ? (
              <>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: state.colorInfo.bgColor }}
                />
                <div>
                  <div>{state.colorInfo.name}</div>
                  <div className="text-xs opacity-70">{state.colorInfo.remainingPercent}%</div>
                </div>
              </>
            ) : (
              state.color.toUpperCase()
            )}
          </span>
        </div>
      </div>
    </>
  );
}
