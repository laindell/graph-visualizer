import React from 'react';
import { useBFS } from '@/contexts/BFSContext';

export const MetricsPanel: React.FC = () => {
  const { metrics, result, currentStepData } = useBFS();

  if (!metrics && !result) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Метрики в реальному часі
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Запустіть BFS для перегляду метрик
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Метрики в реальному часі
      </h3>

      <div className="space-y-4">
        {metrics && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Поточний крок</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.current_step + 1} / {metrics.total_steps}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Відвідано вершин</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics.visited_count}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Розмір черги</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {metrics.queue_size}
              </div>
            </div>

            {currentStepData && (
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Поточна черга</div>
                <div className="flex flex-wrap gap-2">
                  {currentStepData.queue.length > 0 ? (
                    currentStepData.queue.map((nodeId, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm font-mono"
                      >
                        {nodeId}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">Порожня</span>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {result && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Фінальні результати
            </h4>

            <div className="space-y-3">
              {result.path.length > 0 ? (
                <>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-sm text-green-700 dark:text-green-300 mb-2">Шлях знайдено</div>
                    <div className="flex flex-wrap gap-2">
                      {result.path.map((nodeId, idx) => (
                        <React.Fragment key={idx}>
                          <span className="px-2 py-1 bg-green-600 text-white rounded font-mono text-sm">
                            {nodeId}
                          </span>
                          {idx < result.path.length - 1 && (
                            <span className="text-gray-400 self-center">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Довжина шляху</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {result.path_length}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Кроків алгоритму</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {result.steps_count}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Відвідано вершин</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {result.visited_nodes}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Час виконання</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {result.execution_time_ms.toFixed(3)} мс
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                    Шлях не знайдено між {result.start_node} та {result.goal_node}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
