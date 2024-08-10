const MessageModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Success</h2>
          <p className="mb-4">Our investment banker will reach out to you shortly.</p>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-blue-500 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  