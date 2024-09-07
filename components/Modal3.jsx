const Modal3 = ({ onClose, children }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
        {/* Container with transform to shift modal towards the right */}
        <div className="bg-white p-6 rounded-lg w-full max-w-5xl relative overflow-y-auto max-h-[70vh] border border-black transform translate-x-10">
          {/* Added `transform translate-x-10` to shift right */}
          <button className="absolute top-4 right-4 text-gray-500" onClick={onClose}>
            &times;
          </button>
          {children}
        </div>
      </div>
    );
  };
  
  export default Modal3;
  