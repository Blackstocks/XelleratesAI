// components/ui/LoadingOverlay.jsx

import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );
};

export default LoadingOverlay;
