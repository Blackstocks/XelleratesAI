import React from "react";

const SeriesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">Series Wise Documents</h3>
        <div className="mb-6">
          <label htmlFor="series" className="block text-sm font-medium text-gray-700 mb-2">
            Select Series
          </label>
          <select
            id="series"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
            <option value="Series C">Series C</option>
            <option value="Series D">Series D</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeriesModal;
