import { SheetData, Cell } from '../types';

// Function to remove duplicates from a range of cells
export const removeDuplicates = (
  data: SheetData,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
): SheetData => {
  const newData = { ...data };
  
  // Create a map to track unique rows
  const uniqueRows = new Map<string, number>();
  const rowsToRemove: number[] = [];
  
  // Identify duplicate rows
  for (let row = startRow; row <= endRow; row++) {
    if (!newData[row]) continue;
    
    // Create a string representation of the row for comparison
    const rowValues: string[] = [];
    for (let col = startCol; col <= endCol; col++) {
      const cellValue = newData[row][col]?.value;
      rowValues.push(String(cellValue ?? ''));
    }
    
    const rowKey = rowValues.join('|');
    
    if (uniqueRows.has(rowKey)) {
      // This is a duplicate row
      rowsToRemove.push(row);
    } else {
      uniqueRows.set(rowKey, row);
    }
  }
  
  // Remove duplicate rows (from bottom to top to avoid index shifting issues)
  rowsToRemove.sort((a, b) => b - a);
  
  for (const row of rowsToRemove) {
    // Shift all rows up
    for (let r = row; r < endRow; r++) {
      newData[r] = { ...newData[r + 1] };
    }
    
    // Delete the last row in the range
    delete newData[endRow];
    endRow--;
  }
  
  return newData;
};

// Function to find and replace text in a range of cells
export const findAndReplace = (
  data: SheetData,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  findText: string,
  replaceText: string,
  matchCase: boolean = false
): SheetData => {
  const newData = JSON.parse(JSON.stringify(data)) as SheetData;
  
  for (let row = startRow; row <= endRow; row++) {
    if (!newData[row]) continue;
    
    for (let col = startCol; col <= endCol; col++) {
      const cell = newData[row][col];
      if (!cell) continue;
      
      if (typeof cell.value === 'string') {
        if (matchCase) {
          cell.value = cell.value.replace(new RegExp(findText, 'g'), replaceText);
        } else {
          cell.value = cell.value.replace(new RegExp(findText, 'gi'), replaceText);
        }
      }
    }
  }
  
  return newData;
};

// Function to validate if a cell contains a number
export const isNumeric = (value: any): boolean => {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
};

// Function to validate if a cell contains a date
export const isDate = (value: any): boolean => {
  if (value instanceof Date) return true;
  if (typeof value !== 'string') return false;
  
  const date = new Date(value);
  return !isNaN(date.getTime());
};

// Function to format a cell value based on its type
export const formatCellValue = (cell: Cell): string => {
  if (cell.value === null || cell.value === undefined) return '';
  
  if (typeof cell.value === 'number') {
    return cell.value.toString();
  }
  
  return String(cell.value);
};