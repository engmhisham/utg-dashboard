function PermissionModal({
    show,
    message,
    onClose,
  }: {
    show: boolean;
    message: string;
    onClose: () => void;
  }) {
    if (!show) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-semibold text-red-600 mb-4">{message}</h2>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default PermissionModal;
  