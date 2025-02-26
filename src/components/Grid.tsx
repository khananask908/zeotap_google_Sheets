import React, { useRef, useEffect, useState } from 'react';
import { useSheetStore } from '../store/sheetStore';
import Cell from './Cell';
import { getColumnLetter } from '../utils/formulas';

const Grid: React.FC = () => {
  const { 
    dimensions, 
    selection, 
    setSelection, 
    activeCell, 
    setActiveCell,
    editingCell,
    setRowHeight,
    setColWidth
  } = useSheetStore();
  
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  
  // Handle cell selection
  const handleMouseDown = (e: React.MouseEvent, row: number, col: number) => {
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    setActiveCell(row, col);
    setSelection({
      start: { row, col },
      end: { row, col },
      active: { row, col }
    });
    
    setIsDragging(true);
    setDragStart({ row, col });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !gridRef.current || !dragStart) return;
    
    // Calculate the cell under the mouse
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Get row and column from coordinates
    const headerHeight = 25; // Height of the header row
    const headerWidth = 50; // Width of the header column
    const cellHeight = 25; // Default cell height
    const cellWidth = 100; // Default cell width
    
    let row = Math.floor((y - headerHeight) / cellHeight);
    let col = Math.floor((x - headerWidth) / cellWidth);
    
    // Ensure row and col are within bounds
    row = Math.max(0, Math.min(row, dimensions.rowCount - 1));
    col = Math.max(0, Math.min(col, dimensions.colCount - 1));
    
    if (row !== selection?.end.row || col !== selection?.end.col) {
      setSelection({
        start: dragStart,
        end: { row, col },
        active: dragStart
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };
  
  // Handle row/column resizing
  const handleRowResizeStart = (e: React.MouseEvent, row: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingRow(row);
  };
  
  const handleColResizeStart = (e: React.MouseEvent, col: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(col);
  };
  
  const handleResizeMove = (e: React.MouseEvent) => {
    if (resizingRow !== null && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const headerHeight = 25; // Height of the header row
      const rowTop = headerHeight + resizingRow * 25; // Default row height is 25px
      const newHeight = Math.max(25, y - rowTop); // Minimum height of 25px
      setRowHeight(resizingRow, newHeight);
    } else if (resizingCol !== null && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const headerWidth = 50; // Width of the header column
      const colLeft = headerWidth + resizingCol * 100; // Default column width is 100px
      const newWidth = Math.max(50, x - colLeft); // Minimum width of 50px
      setColWidth(resizingCol, newWidth);
    }
  };
  
  const handleResizeEnd = () => {
    setResizingRow(null);
    setResizingCol(null);
  };
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseup', handleResizeEnd);
    document.addEventListener('mousemove', handleResizeMove as any);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.removeEventListener('mousemove', handleResizeMove as any);
    };
  }, [isDragging, dragStart, resizingRow, resizingCol]);
  
  // Render column headers (A, B, C, ...)
  const renderColumnHeaders = () => {
    const headers = [];
    
    // Empty corner cell
    headers.push(
      <div 
        key="corner" 
        className="sticky top-0 left-0 z-20 w-12 h-8 bg-gray-200 border-r border-b border-gray-300 flex items-center justify-center"
      />
    );
    
    // Column headers
    for (let col = 0; col < dimensions.colCount; col++) {
      const width = dimensions.colWidths[col] || 100; // Default width
      
      headers.push(
        <div 
          key={`col-${col}`} 
          className="sticky top-0 z-10 h-8 bg-gray-200 border-r border-b border-gray-300 flex items-center justify-center select-none"
          style={{ width: `${width}px` }}
        >
          {getColumnLetter(col)}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize"
            onMouseDown={(e) => handleColResizeStart(e, col)}
          />
        </div>
      );
    }
    
    return (
      <div className="sticky top-0 z-10 flex">
        {headers}
      </div>
    );
  };
  
  // Render row headers (1, 2, 3, ...)
  const renderRowHeaders = () => {
    const headers = [];
    
    for (let row = 0; row < dimensions.rowCount; row++) {
      const height = dimensions.rowHeights[row] || 25; // Default height
      
      headers.push(
        <div 
          key={`row-${row}`} 
          className="sticky left-0 z-10 w-12 bg-gray-200 border-r border-b border-gray-300 flex items-center justify-center select-none"
          style={{ height: `${height}px` }}
        >
          {row + 1}
          <div 
            className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize"
            onMouseDown={(e) => handleRowResizeStart(e, row)}
          />
        </div>
      );
    }
    
    return (
      <div className="sticky left-0 z-10">
        {headers}
      </div>
    );
  };
  
  // Render the grid cells
  const renderCells = () => {
    const rows = [];
    
    for (let row = 0; row < dimensions.rowCount; row++) {
      const height = dimensions.rowHeights[row] || 25; // Default height
      const cells = [];
      
      for (let col = 0; col < dimensions.colCount; col++) {
        const width = dimensions.colWidths[col] || 100; // Default width
        
        cells.push(
          <div 
            key={`cell-${row}-${col}`} 
            className="relative"
            style={{ width: `${width}px`, height: `${height}px` }}
            onMouseDown={(e) => handleMouseDown(e, row, col)}
          >
            <Cell row={row} col={col} />
          </div>
        );
      }
      
      rows.push(
        <div key={`row-${row}`} className="flex">
          {cells}
        </div>
      );
    }
    
    return rows;
  };
  
  return (
    <div 
      ref={gridRef}
      className="flex flex-col overflow-auto h-full"
      onMouseMove={handleMouseMove}
    >
      {renderColumnHeaders()}
      
      <div className="flex">
        {renderRowHeaders()}
        
        <div className="flex flex-col">
          {renderCells()}
        </div>
      </div>
    </div>
  );
};

export default Grid;