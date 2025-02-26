export type CellValue = string | number | null;

export type CellStyle = {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
};

export type Cell = {
  value: CellValue;
  formula?: string;
  style?: CellStyle;
  isEditing?: boolean;
};

export type SheetData = {
  [rowIndex: number]: {
    [colIndex: number]: Cell;
  };
};

export type Selection = {
  start: { row: number; col: number };
  end: { row: number; col: number };
  active?: { row: number; col: number };
};

export type SheetDimensions = {
  rowCount: number;
  colCount: number;
  rowHeights: { [key: number]: number };
  colWidths: { [key: number]: number };
};

export type SheetState = {
  data: SheetData;
  selection: Selection | null;
  dimensions: SheetDimensions;
  activeCell: { row: number; col: number } | null;
  editingCell: { row: number; col: number } | null;
  formulaBarValue: string;
  history: {
    past: SheetData[];
    future: SheetData[];
  };
  clipboard: {
    data: SheetData | null;
    operation: 'copy' | 'cut' | null;
    selection: Selection | null;
  };
  
  // Cell operations
  getCell: (row: number, col: number) => Cell;
  setCellValue: (row: number, col: number, value: CellValue, formula?: string) => void;
  setCellStyle: (row: number, col: number, style: Partial<CellStyle>) => void;
  
  // Selection operations
  setSelection: (selection: Selection | null) => void;
  setActiveCell: (row: number, col: number) => void;
  setEditingCell: (row: number | null, col: number | null) => void;
  
  // Formula bar operations
  setFormulaBarValue: (value: string) => void;
  
  // Dimension operations
  setRowHeight: (row: number, height: number) => void;
  setColWidth: (col: number, width: number) => void;
  addRow: (afterRow: number) => void;
  deleteRow: (row: number) => void;
  addColumn: (afterCol: number) => void;
  deleteColumn: (col: number) => void;
  
  // Clipboard operations
  copySelection: () => void;
  cutSelection: () => void;
  pasteSelection: () => void;
  
  // History operations
  undo: () => void;
  redo: () => void;
};