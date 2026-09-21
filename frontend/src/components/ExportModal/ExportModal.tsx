import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { useGraph } from '@/contexts/GraphContext';
import { graphApi } from '@/services/api';
import { BFSResult } from '@/types/graph.types';
import { Modal } from '@/components/Modal/Modal';
import { useModal } from '@/hooks/useModal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  forwardResult: BFSResult | null;
  backwardResult: BFSResult | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  forwardResult,
  backwardResult,
}) => {
  const { activeGraph } = useGraph();
  const [loading, setLoading] = useState(false);
  const { modalState, showAlert, showError, closeModal } = useModal();

  if (!isOpen || !activeGraph) return null;

  const handleExport = async (format: string) => {
    setLoading(true);
    try {
      let blob: Blob;
      let filename: string;

      switch (format) {
        case 'xml':
          blob = await graphApi.exportXML(activeGraph.id);
          filename = `${activeGraph.name}.graphml`;
          break;
        case 'json':
          blob = await graphApi.exportJSON(activeGraph.id);
          filename = `${activeGraph.name}.json`;
          break;
        case 'report':
          if (!forwardResult) {
            showAlert('Помилка', 'Спочатку запустіть BFS для генерації звіту');
            return;
          }
          blob = await graphApi.exportReport(activeGraph.id, forwardResult, backwardResult || undefined);
          filename = `${activeGraph.name}_report.md`;
          break;
        default:
          return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      showError('Помилка експорту', 'Не вдалося експортувати граф. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Експорт графа</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-3">
            <button
              onClick={() => handleExport('xml')}
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-between"
            >
              <span>Експорт як GraphML (XML)</span>
              <Download size={18} />
            </button>

            <button
              onClick={() => handleExport('json')}
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-between"
            >
              <span>Експорт як JSON</span>
              <Download size={18} />
            </button>

            <button
              onClick={() => handleExport('report')}
              disabled={loading || !forwardResult}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-between"
            >
              <span>Експорт Markdown звіту</span>
              <Download size={18} />
            </button>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Примітка: Markdown звіт потребує принаймні один результат BFS
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Закрити
            </button>
          </div>
        </div>
      </div>

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
