import React from 'react';
import { X, Info } from 'lucide-react';

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotkeysModal: React.FC<HotkeysModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const hotkeys = [
    {
      category: 'Редагування графа',
      keys: [
        { key: 'ПКМ на полотні', description: 'Створити нову вершину' },
        { key: '2 кліки на вершини', description: 'Створити ребро/дугу між вершинами (тип залежить від типу графа)' },
        { key: 'ПКМ на вершині', description: 'Видалити вершину' },
        { key: 'ПКМ на ребрі/дузі', description: 'Видалити ребро/дугу' },
        { key: 'Подвійний клік на ребрі/дузі', description: 'Змінити directed (тільки для змішаного типу графа)' },
        { key: 'Shift + Подвійний клік на дузі', description: 'Змінити напрямок дуги (source ↔ target) - тільки для орієнтованих графів' },
        { key: 'Перетягування вершини', description: 'Змінити позицію вершини' },
      ],
    },
    {
      category: 'Навігація та масштабування',
      keys: [
        { key: 'Колесо миші', description: 'Масштабувати граф' },
        { key: 'Перетягування полотна', description: 'Панорамувати граф' },
        { key: 'Повзунок зума', description: 'Точне регулювання масштабу (0.3x - 3x)' },
        { key: 'Кнопки + / -', description: 'Збільшити/зменшити масштаб' },
        { key: 'Кнопка 100%', description: 'Скинути масштаб до 100%' },
      ],
    },
    {
      category: 'Керування анімацією',
      keys: [
        { key: 'Пробіл', description: 'Пауза/Продовжити (коли BFS запущений)' },
        { key: '←', description: 'Крок назад' },
        { key: '→', description: 'Крок вперед' },
        { key: 'Home', description: 'На початок анімації' },
        { key: 'End', description: 'В кінець анімації' },
        { key: 'Повзунок кроків', description: 'Перемотка до конкретного кроку' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center gap-3 p-6 border-b border-gray-200 dark:border-slate-700">
          <Info className="text-primary-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
            Гарячі клавіші та керування
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {hotkeys.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {section.category}
              </h4>
              <div className="space-y-2">
                {section.keys.map((item, keyIdx) => (
                  <div
                    key={keyIdx}
                    className="flex items-start justify-between py-2 px-3 bg-gray-50 dark:bg-slate-900 rounded-md"
                  >
                    <kbd className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {item.key}
                    </kbd>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-4 flex-1 text-right">
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Додаткова інформація
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Назви вершин:</strong> Нові вершини автоматично нумеруються (n0, n1, n2...)
              </p>
              <p>
                <strong>Типи графів:</strong> Можна перемикати між неорієнтованим, орієнтованим, деревом та змішаним типами
              </p>
              <p>
                <strong>Порядок обходу:</strong> Різний порядок обходу сусідніх вершин впливає на кількість кроків алгоритму
              </p>
              <p>
                <strong>Швидкість анімації:</strong> Регулюється від 0.25x до 4x
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
