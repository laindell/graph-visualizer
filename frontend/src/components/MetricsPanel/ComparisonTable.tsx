import React, { useState } from 'react';
import { BFSResult } from '@/types/graph.types';

interface ComparisonTableProps {
  forwardResult: BFSResult | null;
  backwardResult: BFSResult | null;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ forwardResult, backwardResult }) => {
  if (!forwardResult && !backwardResult) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Порівняння дзеркальних напрямків
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Запустіть BFS в обох напрямках для порівняння результатів
        </p>
      </div>
    );
  }

  const forward = forwardResult;
  const backward = backwardResult;

  const getDifference = (a: number | undefined, b: number | undefined): string => {
    if (a === undefined || b === undefined) return '-';
    const diff = a - b;
    if (diff === 0) return '0';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getDifferenceClass = (a: number | undefined, b: number | undefined): string => {
    if (a === undefined || b === undefined) return 'text-gray-500';
    const diff = a - b;
    if (diff === 0) return 'text-gray-500';
    return diff > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Порівняння дзеркальних напрямків
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                Метрика
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                Прямий
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                Зворотний
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                Різниця
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            <tr>
              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Напрямок</td>
              <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-mono text-xs">
                {forward ? `${forward.start_node} → ${forward.goal_node}` : '-'}
              </td>
              <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-mono text-xs">
                {backward ? `${backward.start_node} → ${backward.goal_node}` : '-'}
              </td>
              <td className="py-3 px-4 text-center text-gray-500">-</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Довжина шляху</td>
              <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                {forward?.path_length ?? '-'}
              </td>
              <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                {backward?.path_length ?? '-'}
              </td>
              <td className={`py-3 px-4 text-center font-semibold ${getDifferenceClass(forward?.path_length, backward?.path_length)}`}>
                {getDifference(forward?.path_length, backward?.path_length)}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Кроків алгоритму</td>
              <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                {forward?.steps_count ?? '-'}
              </td>
              <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                {backward?.steps_count ?? '-'}
              </td>
              <td className={`py-3 px-4 text-center font-semibold ${getDifferenceClass(forward?.steps_count, backward?.steps_count)}`}>
                {getDifference(forward?.steps_count, backward?.steps_count)}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Відвідано вершин</td>
              <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                {forward?.visited_nodes ?? '-'}
              </td>
              <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                {backward?.visited_nodes ?? '-'}
              </td>
              <td className={`py-3 px-4 text-center font-semibold ${getDifferenceClass(forward?.visited_nodes, backward?.visited_nodes)}`}>
                {getDifference(forward?.visited_nodes, backward?.visited_nodes)}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Час виконання (мс)</td>
              <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                {forward?.execution_time_ms.toFixed(3) ?? '-'}
              </td>
              <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                {backward?.execution_time_ms.toFixed(3) ?? '-'}
              </td>
              <td className={`py-3 px-4 text-center font-semibold ${getDifferenceClass(forward?.execution_time_ms, backward?.execution_time_ms)}`}>
                {forward && backward ? (forward.execution_time_ms - backward.execution_time_ms).toFixed(3) : '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {forward && backward && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Аналіз:</strong> {forward.steps_count === backward.steps_count ?
              'Обидва напрямки виконали однакову кількість кроків.' :
              forward.steps_count < backward.steps_count ?
              `Прямий напрямок був ефективнішим, потребував на ${backward.steps_count - forward.steps_count} кроків менше.` :
              `Зворотний напрямок був ефективнішим, потребував на ${forward.steps_count - backward.steps_count} кроків менше.`
            }
          </p>
        </div>
      )}
    </div>
  );
};
