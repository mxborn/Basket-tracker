
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-secondary rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-3">
          <h2 className="text-2xl font-bold text-accent">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-3xl font-light"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;