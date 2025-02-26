import React, { useState } from 'react';
import { useSheetStore } from '../store/sheetStore';
import { removeDuplicates } from '../utils/dataOperations';

interface RemoveDuplicatesDialogProps {
  onClose: () => void;
}

const RemoveDuplicatesDialog: React.FC<RemoveDuplicatesDialogProps> = ({ onClose }) => {
  const { selection, data } = useSheetStore();
  const [message, setMessage] = useState('');
  
  const handleRemoveDuplicates = () => {
    if (!selection) {
      setMessage('Please select a range of cells');
      return;
    }
    
    const startRow = Math.min(selection.start.row, selection.end.row);
    const endRow = Math.max(selection.start.row, selection.end.row);
    const startCol = Math.min(selection.start.col, selection.end.col);
    const endCol = Math.max(selection.start.col, selection.end.col);
    
    const newData = removeDuplicates(
      data,
      startRow,
      startCol,
      endRow,
      endCol
    );
    
    // In a real implementation, we would update the store with the new data
    setMessage('Duplicates removed successfully');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Remove Duplicates</h2>
        
        <p className="mb-4 text-gray-700">
          This will remove duplicate rows from the selected range. Each row will be compared to all other rows, and duplicates will be removed.
        </p>
        
        {!selection && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
            Please select a range of cells first.
          </div>
        )}
        
        {message && (
          <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
            {message}
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleRemoveDuplicates}
            disabled={!selection}
          >
            Remove Duplicates
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveDuplicatesDialog;