import React, { useState, useEffect } from 'react';
import { useSheetStore } from '../store/sheetStore';
import { getColumnLetter } from '../utils/formulas';

const FormulaBar: React.FC = () => {
  const { 
    activeCell, 
    data, 
    formulaBarValue, 
    setFormulaBarValue, 
    setCellValue 
  } = useSheetStore();
  
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    if (activeCell) {
      const { row, col } = activeCell;
      const cell = data[row]?.[col];
      const value = cell?.formula || String(cell?.value ?? '');
      setInputValue(value);
      setFormulaBarValue(value);
    } else {
      setInputValue('');
      setFormulaBarValue('');
    }
  }, [activeCell, data, setFormulaBarValue]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setFormulaBarValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activeCell) {
      const { row, col } = activeCell;
      const value = inputValue;
      
      if (value.startsWith('=')) {
        // It's a formula
        setCellValue(row, col, null, value);
      } else {
        // It's a regular value
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && String(numValue) === value) {
          setCellValue(row, col, numValue);
        } else {
          setCellValue(row, col, value);
        }
      }
    }
  };
  
  return (
    <div className="flex items-center p-1 bg-white border-b border-gray-300">
      <div className="flex items-center mr-2">
        <span className="text-sm font-medium text-gray-600 w-8">fx</span>
      </div>
      
      <div className="flex items-center mr-2">
        {activeCell && (
          <span className="text-sm font-medium text-gray-600 w-12">
            {getColumnLetter(activeCell.col)}{activeCell.row + 1}
          </span>
        )}
      </div>
      
      <div className="flex-1">
        <input
          type="text"
          className="w-full px-2 py-1 border border-gray-300 rounded"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter a value or formula (start with =)"
        />
      </div>
    </div>
  );
};

export default FormulaBar;