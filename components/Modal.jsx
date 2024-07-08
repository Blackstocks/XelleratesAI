import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-4xl w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl">
          &times;
        </button>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
