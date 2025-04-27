function ConfirmModal({
    show,
    message,
    onConfirm,
    onCancel,
  }: {
    show: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
          <h2 className="text-lg font-semibold mb-4">{message}</h2>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  export default ConfirmModal;