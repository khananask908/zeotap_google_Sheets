import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SheetState, Cell, SheetData, Selection, CellValue } from '../types';
import { evaluateFormula } from '../utils/formulas';

const DEFAULT_ROW_COUNT = 100;
const DEFAULT_COL_COUNT = 26;
const DEFAULT_ROW_HEIGHT = 25;
const DEFAULT_COL_WIDTH = 100;

const initialDimensions = {
  rowCount: DEFAULT_ROW_COUNT,
  colCount: DEFAULT_COL_COUNT,
  rowHeights: {},
  colWidths: {},
};

const initialState: SheetState = {
  data: {},
  selection: null,
  dimensions: initialDimensions,
  activeCell: null,
  editingCell: null,
  formulaBarValue: '',
  history: {
    past: [],
    future: [],
  },
  clipboard: {
    data: null,
    operation: null,
    selection: null,
  },
};

// Helper function to update cells that depend on changed cells
const updateDependentCells = (data: SheetData) => {
  // In a real implementation, we would track dependencies and update accordingly
  // For simplicity, we'll just re-evaluate all formulas
  Object.keys(data).forEach((rowKey) => {
    const row = parseInt(rowKey);
    Object.keys(data[row] || {}).forEach((colKey) => {
      const col = parseInt(colKey);
      const cell = data[row][col];
      if (cell?.formula && cell.formula.startsWith('=')) {
        try {
          cell.value = evaluateFormula(cell.formula.substring(1), data);
        } catch (error) {
          cell.value = '#ERROR';
        }
      }
    });
  });
};

export const useSheetStore = create(
  immer<SheetState>((set, get) => ({
    ...initialState,

    // Cell operations
    getCell: (row: number, col: number): Cell => {
      const state = get();
      return state.data[row]?.[col] || { value: null };
    },

    setCellValue: (row: number, col: number, value: CellValue, formula?: string) => {
      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));
        state.history.future = [];

        // Ensure row and column objects exist
        if (!state.data[row]) {
          state.data[row] = {};
        }

        // Set the cell value
        state.data[row][col] = {
          ...state.data[row][col],
          value,
          formula: formula || undefined,
        };

        // Update dependent cells
        updateDependentCells(state.data);
      });
    },

    setCellStyle: (row: number, col: number, style: Partial<Cell['style']>) => {
      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));
        state.history.future = [];

        // Ensure row and column objects exist
        if (!state.data[row]) {
          state.data[row] = {};
        }
        if (!state.data[row][col]) {
          state.data[row][col] = { value: null };
        }
        if (!state.data[row][col].style) {
          state.data[row][col].style = {};
        }

        // Update the style
        state.data[row][col].style = {
          ...state.data[row][col].style,
          ...style,
        };
      });
    },

    // Selection operations
    setSelection: (selection: Selection | null) => {
      set((state) => {
        state.selection = selection;
        if (selection) {
          state.activeCell = { row: selection.active?.row || selection.start.row, col: selection.active?.col || selection.start.col };
        }
      });
    },

    setActiveCell: (row: number, col: number) => {
      set((state) => {
        state.activeCell = { row, col };
        state.selection = {
          start: { row, col },
          end: { row, col },
          active: { row, col },
        };
        
        const cell = state.data[row]?.[col];
        state.formulaBarValue = cell?.formula || String(cell?.value || '');
      });
    },

    setEditingCell: (row: number | null, col: number | null) => {
      set((state) => {
        state.editingCell = row !== null && col !== null ? { row, col } : null;
      });
    },

    // Formula bar operations
    setFormulaBarValue: (value: string) => {
      set((state) => {
        state.formulaBarValue = value;
      });
    },

    // Dimension operations
    setRowHeight: (row: number, height: number) => {
      set((state) => {
        state.dimensions.rowHeights[row] = height;
      });
    },

    setColWidth: (col: number, width: number) => {
      set((state) => {
        state.dimensions.colWidths[col] = width;
      });
    },

    addRow: (afterRow: number) => {
      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));
        state.history.future = [];

        // Shift all rows down
        for (let row = state.dimensions.rowCount; row > afterRow; row--) {
          if (state.data[row - 1]) {
            state.data[row] = { ...state.data[row - 1] };
          }
        }

        // Clear the new row
        state.data[afterRow + 1] = {};

        // Increment row count
        state.dimensions.rowCount++;
      });
    },

    deleteRow: (row: number) => {
      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));
        state.history.future = [];

        // Shift all rows up
        for (let r = row; r < state.dimensions.rowCount - 1; r++) {
          state.data[r] = state.data[r + 1] || {};
        }

        // Delete the last row
        delete state.data[state.dimensions.rowCount - 1];

        // Decrement row count
        state.dimensions.rowCount--;
      });
    },

    addColumn: (afterCol: number) => {
      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));
        state.history.future = [];

        // For each row, shift all columns to the right
        Object.keys(state.data).forEach((rowKey) => {
          const row = parseInt(rowKey);
          for (let col = state.dimensions.colCount; col > afterCol; col--) {
            if (state.data[row]?.[col - 1]) {
              if (!state.data[row]) state.data[row] = {};
              state.data[row][col] = { ...state.data[row][col - 1] };
            }
          }
          // Clear the new column
          if (state.data[row]) {
            state.data[row][afterCol + 1] = { value: null };
          }
        });

        // Increment column count
        state.dimensions.colCount++;
      });
    },

    deleteColumn: (col: number) => {
      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));
        state.history.future = [];

        // For each row, shift all columns to the left
        Object.keys(state.data).forEach((rowKey) => {
          const row = parseInt(rowKey);
          for (let c = col; c < state.dimensions.colCount - 1; c++) {
            if (state.data[row]) {
              state.data[row][c] = state.data[row][c + 1] || { value: null };
            }
          }
          // Delete the last column
          if (state.data[row]) {
            delete state.data[row][state.dimensions.colCount - 1];
          }
        });

        // Decrement column count
        state.dimensions.colCount--;
      });
    },

    // Clipboard operations
    copySelection: () => {
      const state = get();
      if (!state.selection) return;

      const { start, end } = state.selection;
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);

      const clipboardData: SheetData = {};

      for (let row = minRow; row <= maxRow; row++) {
        clipboardData[row - minRow] = {};
        for (let col = minCol; col <= maxCol; col++) {
          const cell = state.data[row]?.[col] || { value: null };
          clipboardData[row - minRow][col - minCol] = { ...cell };
        }
      }

      set((state) => {
        state.clipboard = {
          data: clipboardData,
          operation: 'copy',
          selection: state.selection,
        };
      });
    },

    cutSelection: () => {
      const state = get();
      if (!state.selection) return;

      // First copy the selection
      get().copySelection();

      // Then clear the cells
      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));
        state.history.future = [];

        const { start, end } = state.selection!;
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);

        for (let row = minRow; row <= maxRow; row++) {
          if (!state.data[row]) continue;
          for (let col = minCol; col <= maxCol; col++) {
            if (state.data[row][col]) {
              state.data[row][col] = { value: null };
            }
          }
        }

        state.clipboard.operation = 'cut';
      });
    },

    pasteSelection: () => {
      const state = get();
      if (!state.clipboard.data || !state.activeCell) return;

      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));
        state.history.future = [];

        const { row: startRow, col: startCol } = state.activeCell!;
        const clipboardData = state.clipboard.data!;

        // Paste the data
        Object.keys(clipboardData).forEach((rowOffset) => {
          const row = startRow + parseInt(rowOffset);
          if (!state.data[row]) state.data[row] = {};

          Object.keys(clipboardData[parseInt(rowOffset)]).forEach((colOffset) => {
            const col = startCol + parseInt(colOffset);
            const cell = clipboardData[parseInt(rowOffset)][parseInt(colOffset)];
            state.data[row][col] = { ...cell };
          });
        });

        // Update dependent cells
        updateDependentCells(state.data);
      });
    },

    // History operations
    undo: () => {
      set((state) => {
        if (state.history.past.length === 0) return;

        // Save current state to future
        state.history.future.unshift(JSON.parse(JSON.stringify(state.data)));

        // Restore previous state
        state.data = state.history.past.pop()!;
      });
    },

    redo: () => {
      set((state) => {
        if (state.history.future.length === 0) return;

        // Save current state to past
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));

        // Restore next state
        state.data = state.history.future.shift()!;
      });
    },
  }))
);