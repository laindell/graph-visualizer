import { useState, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'error' | 'success';
  onConfirm?: () => void;
}

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
  });

  const showAlert = useCallback((title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'alert',
    });
  }, []);

  const showError = useCallback((title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'error',
    });
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'success',
    });
  }, []);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modalState,
    showAlert,
    showError,
    showSuccess,
    showConfirm,
    closeModal,
  };
};
