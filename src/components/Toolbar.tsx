import React from 'react';
import { 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, 
  Plus, Trash2, Copy, Scissors, Clipboard, Undo, Redo,
  Save, Upload, BarChart, Search, FileSpreadsheet
} from 'lucide-react';
import { useSheetStore } from '../store/sheetStore';

const Toolbar: React.FC = () => {
  const { 
    activeCell, 
    selection,
    data,
    setCellStyle,
    copySelection,
    cutSelection,
    pasteSelection,
    undo,
    redo,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn
  } = useSheetStore();

  const handleBold = () => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    const cell = data[row]?.[col];
    const isBold = cell?.style?.bold;
    setCellStyle(row, col, { bold: !isBold });
  };

  const handleItalic = () => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    const cell = data[row]?.[col];
    const isItalic = cell?.style?.italic;
    setCellStyle(row, col, { italic: !isItalic });
  };

  const handleAlign = (align: 'left' | 'center' | 'right') => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    setCellStyle(row, col, { textAlign: align });
  };

  const handleAddRow = () => {
    if (!activeCell) return;
    addRow(activeCell.row);
  };

  const handleDeleteRow = () => {
    if (!activeCell) return;
    deleteRow(activeCell.row);
  };

  const handleAddColumn = () => {
    if (!activeCell) return;
    addColumn(activeCell.col);
  };

  const handleDeleteColumn = () => {
    if (!activeCell) return;
    deleteColumn(activeCell.col);
  };

  return (
    <div className="flex items-center p-1 bg-gray-100 border-b border-gray-300">
      <div className="flex items-center space-x-1 mr-4">
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Bold"
          onClick={handleBold}
        >
          <Bold size={16} />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Italic"
          onClick={handleItalic}
        >
          <Italic size={16} />
        </button>
      </div>

      <div className="flex items-center space-x-1 mr-4">
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Align Left"
          onClick={() => handleAlign('left')}
        >
          <AlignLeft size={16} />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Align Center"
          onClick={() => handleAlign('center')}
        >
          <AlignCenter size={16} />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Align Right"
          onClick={() => handleAlign('right')}
        >
          <AlignRight size={16} />
        </button>
      </div>

      <div className="h-5 w-px bg-gray-300 mx-2"></div>

      <div className="flex items-center space-x-1 mr-4">
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Add Row"
          onClick={handleAddRow}
        >
          <Plus size={16} />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Delete Row"
          onClick={handleDeleteRow}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-center space-x-1 mr-4">
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Add Column"
          onClick={handleAddColumn}
        >
          <Plus size={16} className="rotate-90" />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Delete Column"
          onClick={handleDeleteColumn}
        >
          <Trash2 size={16} className="rotate-90" />
        </button>
      </div>

      <div className="h-5 w-px bg-gray-300 mx-2"></div>

      <div className="flex items-center space-x-1 mr-4">
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Copy"
          onClick={copySelection}
        >
          <Copy size={16} />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Cut"
          onClick={cutSelection}
        >
          <Scissors size={16} />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Paste"
          onClick={pasteSelection}
        >
          <Clipboard size={16} />
        </button>
      </div>

      <div className="h-5 w-px bg-gray-300 mx-2"></div>

      <div className="flex items-center space-x-1 mr-4">
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Undo"
          onClick={undo}
        >
          <Undo size={16} />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Redo"
          onClick={redo}
        >
          <Redo size={16} />
        </button>
      </div>

      <div className="h-5 w-px bg-gray-300 mx-2"></div>

      <div className="flex items-center space-x-1">
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Save Spreadsheet"
        >
          <Save size={16} />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Load Spreadsheet"
        >
          <Upload size={16} />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Charts"
        >
          <BarChart size={16} />
        </button>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          title="Find and Replace"
        >
          <Search size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;