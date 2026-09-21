import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'alert' | 'confirm' | 'error' | 'success';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'alert',
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="text-red-500" size={24} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn">
        <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-slate-700">
          {getIcon()}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3 justify-end">
          {type === 'confirm' ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Підтвердити
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
            >
              Зрозуміло
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
