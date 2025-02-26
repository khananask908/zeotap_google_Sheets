import { SheetData, CellValue } from '../types';

// Helper to parse cell references like A1, B2, etc.
export const parseCellReference = (ref: string): { row: number; col: number } | null => {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  const colStr = match[1];
  const rowStr = match[2];

  // Convert column letters to number (A=0, B=1, ..., Z=25, AA=26, etc.)
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 'A'.charCodeAt(0));
  }

  const row = parseInt(rowStr) - 1; // 0-based index
  return { row, col };
};

// Helper to get column letter from index
export const getColumnLetter = (col: number): string => {
  let letter = '';
  while (col >= 0) {
    letter = String.fromCharCode((col % 26) + 'A'.charCodeAt(0)) + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
};

// Helper to get cell value from reference
export const getCellValue = (ref: string, data: SheetData): CellValue => {
  const cell = parseCellReference(ref);
  if (!cell) return '#REF!';

  const { row, col } = cell;
  return data[row]?.[col]?.value ?? null;
};

// Helper to get range of cells
export const getCellRange = (start: string, end: string, data: SheetData): CellValue[] => {
  const startCell = parseCellReference(start);
  const endCell = parseCellReference(end);

  if (!startCell || !endCell) return [];

  const minRow = Math.min(startCell.row, endCell.row);
  const maxRow = Math.max(startCell.row, endCell.row);
  const minCol = Math.min(startCell.col, endCell.col);
  const maxCol = Math.max(startCell.col, endCell.col);

  const values: CellValue[] = [];

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const value = data[row]?.[col]?.value;
      if (value !== undefined) {
        values.push(value);
      }
    }
  }

  return values;
};

// Mathematical functions
export const mathFunctions = {
  SUM: (args: string[], data: SheetData): number => {
    let sum = 0;
    args.forEach(arg => {
      if (arg.includes(':')) {
        // Range of cells
        const [start, end] = arg.split(':');
        const values = getCellRange(start, end, data);
        values.forEach(value => {
          if (typeof value === 'number') {
            sum += value;
          } else if (typeof value === 'string') {
            const num = parseFloat(value);
            if (!isNaN(num)) sum += num;
          }
        });
      } else {
        // Single cell
        const value = getCellValue(arg, data);
        if (typeof value === 'number') {
          sum += value;
        } else if (typeof value === 'string') {
          const num = parseFloat(value);
          if (!isNaN(num)) sum += num;
        }
      }
    });
    return sum;
  },

  AVERAGE: (args: string[], data: SheetData): number => {
    let sum = 0;
    let count = 0;

    args.forEach(arg => {
      if (arg.includes(':')) {
        // Range of cells
        const [start, end] = arg.split(':');
        const values = getCellRange(start, end, data);
        values.forEach(value => {
          if (typeof value === 'number') {
            sum += value;
            count++;
          } else if (typeof value === 'string') {
            const num = parseFloat(value);
            if (!isNaN(num)) {
              sum += num;
              count++;
            }
          }
        });
      } else {
        // Single cell
        const value = getCellValue(arg, data);
        if (typeof value === 'number') {
          sum += value;
          count++;
        } else if (typeof value === 'string') {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            sum += num;
            count++;
          }
        }
      }
    });

    return count > 0 ? sum / count : 0;
  },

  MAX: (args: string[], data: SheetData): number => {
    let max = Number.NEGATIVE_INFINITY;
    let hasValue = false;

    args.forEach(arg => {
      if (arg.includes(':')) {
        // Range of cells
        const [start, end] = arg.split(':');
        const values = getCellRange(start, end, data);
        values.forEach(value => {
          if (typeof value === 'number') {
            max = Math.max(max, value);
            hasValue = true;
          } else if (typeof value === 'string') {
            const num = parseFloat(value);
            if (!isNaN(num)) {
              max = Math.max(max, num);
              hasValue = true;
            }
          }
        });
      } else {
        // Single cell
        const value = getCellValue(arg, data);
        if (typeof value === 'number') {
          max = Math.max(max, value);
          hasValue = true;
        } else if (typeof value === 'string') {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            max = Math.max(max, num);
            hasValue = true;
          }
        }
      }
    });

    return hasValue ? max : 0;
  },

  MIN: (args: string[], data: SheetData): number => {
    let min = Number.POSITIVE_INFINITY;
    let hasValue = false;

    args.forEach(arg => {
      if (arg.includes(':')) {
        // Range of cells
        const [start, end] = arg.split(':');
        const values = getCellRange(start, end, data);
        values.forEach(value => {
          if (typeof value === 'number') {
            min = Math.min(min, value);
            hasValue = true;
          } else if (typeof value === 'string') {
            const num = parseFloat(value);
            if (!isNaN(num)) {
              min = Math.min(min, num);
              hasValue = true;
            }
          }
        });
      } else {
        // Single cell
        const value = getCellValue(arg, data);
        if (typeof value === 'number') {
          min = Math.min(min, value);
          hasValue = true;
        } else if (typeof value === 'string') {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            min = Math.min(min, num);
            hasValue = true;
          }
        }
      }
    });

    return hasValue ? min : 0;
  },

  COUNT: (args: string[], data: SheetData): number => {
    let count = 0;

    args.forEach(arg => {
      if (arg.includes(':')) {
        // Range of cells
        const [start, end] = arg.split(':');
        const values = getCellRange(start, end, data);
        values.forEach(value => {
          if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
            count++;
          }
        });
      } else {
        // Single cell
        const value = getCellValue(arg, data);
        if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
          count++;
        }
      }
    });

    return count;
  },
};

// Data quality functions
export const dataQualityFunctions = {
  TRIM: (args: string[], data: SheetData): string => {
    if (args.length === 0) return '';
    
    const value = args[0].includes(':') 
      ? String(getCellRange(args[0].split(':')[0], args[0].split(':')[1], data)[0] || '')
      : String(getCellValue(args[0], data) || '');
    
    return typeof value === 'string' ? value.trim() : String(value);
  },

  UPPER: (args: string[], data: SheetData): string => {
    if (args.length === 0) return '';
    
    const value = args[0].includes(':') 
      ? String(getCellRange(args[0].split(':')[0], args[0].split(':')[1], data)[0] || '')
      : String(getCellValue(args[0], data) || '');
    
    return typeof value === 'string' ? value.toUpperCase() : String(value).toUpperCase();
  },

  LOWER: (args: string[], data: SheetData): string => {
    if (args.length === 0) return '';
    
    const value = args[0].includes(':') 
      ? String(getCellRange(args[0].split(':')[0], args[0].split(':')[1], data)[0] || '')
      : String(getCellValue(args[0], data) || '');
    
    return typeof value === 'string' ? value.toLowerCase() : String(value).toLowerCase();
  },
};

// Main formula evaluation function
export const evaluateFormula = (formula: string, data: SheetData): CellValue => {
  try {
    // Check if it's a function call
    const functionMatch = formula.match(/^(\w+)\((.*)\)$/);
    if (functionMatch) {
      const functionName = functionMatch[1].toUpperCase();
      const argsString = functionMatch[2];
      
      // Parse arguments, handling commas inside quotes
      const args: string[] = [];
      let currentArg = '';
      let insideQuotes = false;
      
      for (let i = 0; i < argsString.length; i++) {
        const char = argsString[i];
        
        if (char === '"' && (i === 0 || argsString[i - 1] !== '\\')) {
          insideQuotes = !insideQuotes;
          currentArg += char;
        } else if (char === ',' && !insideQuotes) {
          args.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        args.push(currentArg.trim());
      }
      
      // Process arguments - remove quotes from string literals
      const processedArgs = args.map(arg => {
        if (arg.startsWith('"') && arg.endsWith('"')) {
          return arg.substring(1, arg.length - 1);
        }
        return arg;
      });

      // Execute the function
      if (functionName in mathFunctions) {
        return mathFunctions[functionName as keyof typeof mathFunctions](processedArgs, data);
      } else if (functionName in dataQualityFunctions) {
        return dataQualityFunctions[functionName as keyof typeof dataQualityFunctions](processedArgs, data);
      } else {
        return `#NAME? (Unknown function: ${functionName})`;
      }
    }
    
    // Check if it's a cell reference
    const cellRef = parseCellReference(formula);
    if (cellRef) {
      return data[cellRef.row]?.[cellRef.col]?.value ?? null;
    }
    
    // Otherwise, treat as a literal value
    const numValue = parseFloat(formula);
    if (!isNaN(numValue)) {
      return numValue;
    }
    
    return formula;
  } catch (error) {
    console.error('Error evaluating formula:', error);
    return '#ERROR!';
  }
};