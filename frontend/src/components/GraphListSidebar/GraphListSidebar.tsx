import React, { useState } from 'react';
import { useGraph } from '@/contexts/GraphContext';
import { Trash2, Plus } from 'lucide-react';
import { Modal } from '@/components/Modal/Modal';
import { useModal } from '@/hooks/useModal';

export const GraphListSidebar: React.FC = () => {
  const { graphs, activeGraphId, setActiveGraphId, deleteGraph, createGraph, loadExampleGraph, loading } = useGraph();
  const { modalState, showConfirm, showAlert, showError, closeModal } = useModal();
  const [showNameInput, setShowNameInput] = useState(false);
  const [showExamplesMenu, setShowExamplesMenu] = useState(false);
  const [graphName, setGraphName] = useState('');
  const [graphType, setGraphType] = useState<'undirected' | 'directed' | 'tree' | 'mixed'>('undirected');

  const handleCreateGraph = () => {
    setShowNameInput(true);
    setGraphName('');
    setGraphType('undirected');
  };

  const confirmCreateGraph = async () => {
    if (!graphName.trim()) {
      showAlert('Помилка', 'Будь ласка, введіть назву графа');
      return;
    }

    try {
      await createGraph(graphName, graphType);
      setShowNameInput(false);
      setGraphName('');
      setGraphType('undirected');
    } catch (error) {
      console.error('Failed to create graph:', error);
      showError('Помилка', 'Не вдалося створити граф. Спробуйте ще раз.');
    }
  };

  const handleLoadExample = async (exampleName: string) => {
    try {
      await loadExampleGraph(exampleName);
      setShowExamplesMenu(false);
    } catch (error) {
      console.error('Failed to load example:', error);
      showError('Помилка', 'Не вдалося завантажити приклад графа.');
    }
  };

  const handleDelete = (graphId: string, graphName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm(
      'Видалення графа',
      `Ви впевнені, що хочете видалити граф "${graphName}"?`,
      async () => {
        try {
          await deleteGraph(graphId);
        } catch (error) {
          console.error('Failed to delete graph:', error);
          showError('Помилка', 'Не вдалося видалити граф.');
        }
      }
    );
  };

  const examples = [
    { id: 'undirected', name: 'Неорієнтований граф', description: '35 вершин, 5 гілок' },
    { id: 'directed', name: 'Орієнтований граф', description: '35 вершин, 5 гілок' },
    { id: 'tree', name: 'Дерево', description: '31 вершина, бінарне дерево' },
    { id: 'mixed', name: 'Змішаний граф', description: '35 вершин, ребра + дуги' },
  ];

  return (
    <>
      <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Графи</h2>
          <button
            onClick={handleCreateGraph}
            disabled={loading}
            className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="relative mb-4">
          <button
            onClick={() => setShowExamplesMenu(!showExamplesMenu)}
            disabled={loading}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 text-sm transition-colors disabled:opacity-50"
          >
            Завантажити приклад
          </button>

          {showExamplesMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg z-10 overflow-hidden">
              {examples.map(example => (
                <button
                  key={example.id}
                  onClick={() => handleLoadExample(example.id)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {example.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {example.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {Array.from(graphs.values()).map(graph => (
            <div
              key={graph.id}
              onClick={() => setActiveGraphId(graph.id)}
              className={`p-3 rounded-md cursor-pointer transition-colors ${
                activeGraphId === graph.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                  : 'bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700 border-2 border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                    {graph.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Object.keys(graph.nodes).length} вершин, {Object.keys(graph.edges).length} ребер
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">
                    {graph.graph_type}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(graph.id, graph.name, e)}
                  className="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {graphs.size === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              Ще немає графів. Створіть новий або завантажте приклад.
            </div>
          )}
        </div>
      </div>

      {showNameInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Створити новий граф
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Назва графа
                </label>
                <input
                  type="text"
                  value={graphName}
                  onChange={(e) => setGraphName(e.target.value)}
                  placeholder="Введіть назву..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && confirmCreateGraph()}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Тип графа
                </label>
                <select
                  value={graphType}
                  onChange={(e) => setGraphType(e.target.value as 'undirected' | 'directed' | 'tree' | 'mixed')}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="undirected">Неорієнтований</option>
                  <option value="directed">Орієнтований</option>
                  <option value="tree">Дерево</option>
                  <option value="mixed">Змішаний</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {graphType === 'undirected' && 'Всі з\'єднання без напрямку (ребра)'}
                  {graphType === 'directed' && 'Всі з\'єднання з напрямком (дуги)'}
                  {graphType === 'tree' && 'Ієрархічна структура без циклів'}
                  {graphType === 'mixed' && 'Можна створювати як ребра, так і дуги'}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowNameInput(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={confirmCreateGraph}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
              >
                Створити
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </>
  );
};
