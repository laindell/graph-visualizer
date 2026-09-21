import React, { useState } from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useBFS } from '@/contexts/BFSContext';
import { useGraph } from '@/contexts/GraphContext';
import { GraphType, OrderType } from '@/types/graph.types';
import { Modal } from '@/components/Modal/Modal';
import { useModal } from '@/hooks/useModal';
import { SearchableSelect } from '@/components/SearchableSelect/SearchableSelect';

export const ControlPanel: React.FC = () => {
  const { activeGraph } = useGraph();
  const {
    isRunning,
    isPaused,
    currentStep,
    totalSteps,
    startBFS,
    pauseBFS,
    resumeBFS,
    stopBFS,
    stepForward,
    stepBackward,
    seekToStep,
  } = useBFS();

  const [startNode, setStartNode] = useState<string>('');
  const [goalNode, setGoalNode] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('id_asc');
  const [speed, setSpeed] = useState<number>(1);

  const { modalState, showAlert, closeModal } = useModal();

  const nodes = activeGraph ? Object.keys(activeGraph.nodes) : [];

  const handleStart = () => {
    if (!activeGraph || !startNode || !goalNode) {
      showAlert('Помилка', 'Будь ласка, оберіть початкову та цільову вершини');
      return;
    }

    startBFS(activeGraph.id, startNode, goalNode, orderType, speed);
  };

  const handleSwapNodes = () => {
    const temp = startNode;
    setStartNode(goalNode);
    setGoalNode(temp);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const step = parseInt(e.target.value, 10);
    seekToStep(step);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <SearchableSelect
            label="Початок"
            value={startNode}
            onChange={setStartNode}
            options={nodes}
            placeholder="Оберіть початок"
            disabled={isRunning}
          />

          <SearchableSelect
            label="Ціль"
            value={goalNode}
            onChange={setGoalNode}
            options={nodes}
            placeholder="Оберіть ціль"
            disabled={isRunning}
          />
        </div>

        <button
          onClick={handleSwapNodes}
          disabled={isRunning || !startNode || !goalNode}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Поміняти місцями
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Порядок обходу
          </label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            disabled={isRunning}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="id_asc">ID за зростанням</option>
            <option value="id_desc">ID за спаданням</option>
            <option value="x_asc">X координата за зростанням</option>
            <option value="x_desc">X координата за спаданням</option>
            <option value="y_asc">Y координата за зростанням</option>
            <option value="y_desc">Y координата за спаданням</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Швидкість анімації: {speed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            disabled={isRunning && !isPaused}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Play size={18} />
              Запустити BFS
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeBFS}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Play size={18} />
                  Продовжити
                </button>
              ) : (
                <button
                  onClick={pauseBFS}
                  className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Pause size={18} />
                  Пауза
                </button>
              )}
              <button
                onClick={stopBFS}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Square size={18} />
                Стоп
              </button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => seekToStep(0)}
            disabled={!isRunning && totalSteps === 0}
            className="px-3 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={stepBackward}
            disabled={!isRunning && totalSteps === 0}
            className="px-3 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={stepForward}
            disabled={!isRunning && totalSteps === 0}
            className="px-3 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward size={18} />
          </button>
          <button
            onClick={() => seekToStep(totalSteps - 1)}
            disabled={!isRunning && totalSteps === 0}
            className="px-3 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight size={18} />
          </button>
        </div>

        {totalSteps > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Крок: {currentStep + 1} / {totalSteps}
            </label>
            <input
              type="range"
              min="0"
              max={totalSteps - 1}
              value={currentStep}
              onChange={handleSeek}
              className="w-full"
            />
          </div>
        )}
      </div>
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
