import React, { useState, useEffect } from 'react';
import { GraphProvider } from '@/contexts/GraphContext';
import { BFSProvider, useBFS } from '@/contexts/BFSContext';
import { GraphListSidebar } from '@/components/GraphListSidebar/GraphListSidebar';
import { GraphCanvas } from '@/components/GraphCanvas/GraphCanvas';
import { ControlPanel } from '@/components/ControlPanel/ControlPanel';
import { MetricsPanel } from '@/components/MetricsPanel/MetricsPanel';
import { ComparisonTable } from '@/components/MetricsPanel/ComparisonTable';
import { ExportModal } from '@/components/ExportModal/ExportModal';
import { HotkeysModal } from '@/components/HotkeysModal/HotkeysModal';
import { Download, Upload, Sun, Moon, Keyboard } from 'lucide-react';
import { BFSResult } from '@/types/graph.types';
import { useGraph } from '@/contexts/GraphContext';
import { Modal } from '@/components/Modal/Modal';
import { useModal } from '@/hooks/useModal';

const AppContent: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });
  const [selectedStartNode, setSelectedStartNode] = useState<string | null>(null);
  const [selectedGoalNode, setSelectedGoalNode] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHotkeysModalOpen, setIsHotkeysModalOpen] = useState(false);
  const [forwardResult, setForwardResult] = useState<BFSResult | null>(null);
  const [backwardResult, setBackwardResult] = useState<BFSResult | null>(null);

  const { importGraph } = useGraph();
  const { result } = useBFS();
  const { modalState, showError, closeModal } = useModal();

  // Застосовуємо збережену тему при завантаженні
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNodeSelect = (nodeId: string) => {
    if (!selectedStartNode) {
      setSelectedStartNode(nodeId);
    } else if (!selectedGoalNode && nodeId !== selectedStartNode) {
      setSelectedGoalNode(nodeId);
    } else {
      setSelectedStartNode(nodeId);
      setSelectedGoalNode(null);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml,.graphml';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importGraph(file);
        } catch (error) {
          console.error('Import failed:', error);
          showError('Помилка імпорту', 'Не вдалося імпортувати граф. Перевірте формат файлу.');
        }
      }
    };
    input.click();
  };

  React.useEffect(() => {
    if (result) {
      if (!forwardResult) {
        setForwardResult(result);
      } else if (!backwardResult && result.start_node !== forwardResult.start_node) {
        setBackwardResult(result);
      }
    }
  }, [result]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Візуалізатор обходу графа
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Інтерактивна візуалізація алгоритмів BFS та DFS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHotkeysModalOpen(true)}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <Keyboard size={18} />
              Гарячі клавіші
            </button>

            <button
              onClick={handleImport}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <Upload size={18} />
              Імпорт
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Експорт
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <GraphListSidebar />

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Керування:</strong> Клік на вершину - вибрати початок і ціль | ПКМ на полотні - створити вершину |
                  Ctrl+клік на 2 вершини - створити ребро/дугу | ПКМ на вершині/ребрі - видалити |
                  Shift+подвійний клік на дузі - змінити напрямок (тільки орієнтовані графи)
                </div>
              </div>

              <GraphCanvas
                startNode={selectedStartNode}
                goalNode={selectedGoalNode}
                onNodeSelect={handleNodeSelect}
              />

              <ComparisonTable
                forwardResult={forwardResult}
                backwardResult={backwardResult}
              />
            </div>
          </div>

          <aside className="w-96 p-6 overflow-auto space-y-6 bg-gray-50 dark:bg-slate-900">
            <ControlPanel
              startNode={selectedStartNode}
              goalNode={selectedGoalNode}
              onStartNodeChange={setSelectedStartNode}
              onGoalNodeChange={setSelectedGoalNode}
            />
            <MetricsPanel />
          </aside>
        </main>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        forwardResult={forwardResult}
        backwardResult={backwardResult}
      />

      <HotkeysModal
        isOpen={isHotkeysModalOpen}
        onClose={() => setIsHotkeysModalOpen(false)}
      />

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};

function App() {
  return (
    <GraphProvider>
      <BFSProvider>
        <AppContent />
      </BFSProvider>
    </GraphProvider>
  );
}

export default App;
