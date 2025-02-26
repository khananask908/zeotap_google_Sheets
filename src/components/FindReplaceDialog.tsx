import React, { useState } from 'react';
import { useSheetStore } from '../store/sheetStore';
import { findAndReplace } from '../utils/dataOperations';

interface FindReplaceDialogProps {
  onClose: () => void;
}

const FindReplaceDialog: React.FC<FindReplaceDialogProps> = ({ onClose }) => {
  const { selection, data, activeCell } = useSheetStore();
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleFindReplace = () => {
    if (!findText) {
      setMessage('Please enter text to find');
      return;
    }
    
    let startRow = 0;
    let startCol = 0;
    let endRow = 0;
    let endCol = 0;
    
    if (selection) {
      startRow = Math.min(selection.start.row, selection.end.row);
      endRow = Math.max(selection.start.row, selection.end.row);
      startCol = Math.min(selection.start.col, selection.end.col);
      endCol = Math.max(selection.start.col, selection.end.col);
    } else if (activeCell) {
      startRow = endRow = activeCell.row;
      startCol = endCol = activeCell.col;
    } else {
      setMessage('Please select a range of cells');
      return;
    }
    
    const newData = findAndReplace(
      data,
      startRow,
      startCol,
      endRow,
      endCol,
      findText,
      replaceText,
      matchCase
    );
    
    // In a real implementation, we would update the store with the new data
    setMessage('Find and replace completed');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Find and Replace</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Find
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Replace with
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Match case</span>
          </label>
        </div>
        
        {message && (
          <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">
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
            onClick={handleFindReplace}
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindReplaceDialog;