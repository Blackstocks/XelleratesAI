import React from 'react';

const UpdateProfileModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-3/4 lg:w-1/2 h-auto max-w-lg">
        <div className="p-4 pb-2 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-xl font-semibold text-center">Update Startup Profile</h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 ease-in-out focus:outline-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            To access these features, please update your startup profile.
          </p>
          <div className="text-left">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
