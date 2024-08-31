import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  // Close modal on 'Escape' key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      role='dialog'
      aria-modal='true'
    >
      <div className='bg-white rounded-lg shadow-xl max-w-[950px] w-full relative'>
        <button
          onClick={onClose}
          className='absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl'
          aria-label='Close modal'
        >
          &times;
        </button>
        <div className='p-4'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
