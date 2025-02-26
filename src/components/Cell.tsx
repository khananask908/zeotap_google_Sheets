import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useSheetStore } from '../store/sheetStore';
import { Cell as CellType } from '../types';

interface CellProps {
  row: number;
  col: number;
}

const Cell: React.FC<CellProps> = ({ row, col }) => {
  const { 
    getCell, 
    setCellValue, 
    activeCell, 
    setActiveCell, 
    editingCell, 
    setEditingCell,
    selection
  } = useSheetStore();
  
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const cell = getCell(row, col);
  
  const isActive = activeCell?.row === row && activeCell?.col === col;
  const isEditing = editingCell?.row === row && editingCell?.col === col;
  
  const isSelected = selection && (
    row >= Math.min(selection.start.row, selection.end.row) &&
    row <= Math.max(selection.start.row, selection.end.row) &&
    col >= Math.min(selection.start.col, selection.end.col) &&
    col <= Math.max(selection.start.col, selection.end.col)
  );
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleClick = (e: React.MouseEvent) => {
    setActiveCell(row, col);
    
    // Double click to edit
    if (e.detail === 2) {
      setEditingCell(row, col);
      setEditValue(cell.formula || String(cell.value ?? ''));
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setEditingCell(null, null);
    }
  };
  
  const finishEditing = () => {
    if (editValue.startsWith('=')) {
      // It's a formula
      setCellValue(row, col, null, editValue);
    } else {
      // It's a regular value
      const numValue = parseFloat(editValue);
      if (!isNaN(numValue) && String(numValue) === editValue) {
        setCellValue(row, col, numValue);
      } else {
        setCellValue(row, col, editValue);
      }
    }
    
    setEditingCell(null, null);
  };
  
  const handleBlur = () => {
    finishEditing();
  };
  
  const renderCellContent = () => {
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          className="w-full h-full outline-none border-none p-0"
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      );
    }
    
    return (
      <div 
        className={classNames(
          'w-full h-full px-1 overflow-hidden whitespace-nowrap text-ellipsis',
          {
            'font-bold': cell.style?.bold,
            'italic': cell.style?.italic,
            'text-left': cell.style?.textAlign === 'left' || !cell.style?.textAlign,
            'text-center': cell.style?.textAlign === 'center',
            'text-right': cell.style?.textAlign === 'right',
          }
        )}
        style={{
          color: cell.style?.color || 'inherit',
          backgroundColor: cell.style?.backgroundColor || 'inherit',
          fontSize: cell.style?.fontSize ? `${cell.style.fontSize}px` : 'inherit',
        }}
      >
        {cell.value !== null ? String(cell.value) : ''}
      </div>
    );
  };
  
  return (
    <div
      className={classNames(
        'border-r border-b border-gray-300 select-none',
        {
          'bg-blue-100': isSelected && !isActive,
          'bg-blue-200 ring-2 ring-blue-500': isActive,
          'z-10': isActive || isEditing,
        }
      )}
      onClick={handleClick}
    >
      {renderCellContent()}
    </div>
  );
};

export default React.memo(Cell);