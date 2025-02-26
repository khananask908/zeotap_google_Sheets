import React, { useState } from 'react';
import { FileSpreadsheet, Save, Upload, Settings, HelpCircle } from 'lucide-react';
import FindReplaceDialog from './FindReplaceDialog';
import RemoveDuplicatesDialog from './RemoveDuplicatesDialog';

const Header: React.FC = () => {
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showRemoveDuplicates, setShowRemoveDuplicates] = useState(false);
  
  const handleSave = () => {
    // In a real implementation, this would save the spreadsheet data
    const spreadsheetData = JSON.stringify(localStorage.getItem('spreadsheetData') || '{}');
    const blob = new Blob([spreadsheetData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleLoad = () => {
    // In a real implementation, this would load the spreadsheet data
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          localStorage.setItem('spreadsheetData', JSON.stringify(data));
          // In a real implementation, we would update the store with the loaded data
          window.location.reload();
        } catch (error) {
          console.error('Error loading spreadsheet:', error);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  return (
    <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-300">
      <div className="flex items-center">
        <FileSpreadsheet className="h-6 w-6 text-green-600 mr-2" />
        <h1 className="text-lg font-semibold">Sheets Clone</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </button>
        
        <button 
          className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={handleLoad}
        >
          <Upload className="h-4 w-4 mr-1" />
          Load
        </button>
        
        <div className="relative group">
          <button className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
            <Settings className="h-4 w-4 mr-1" />
            Tools
          </button>
          
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg hidden group-hover:block z-50">
            <button 
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => setShowFindReplace(true)}
            >
              Find and Replace
            </button>
            <button 
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => setShowRemoveDuplicates(true)}
            >
              Remove Duplicates
            </button>
          </div>
        </div>
        
        <button className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
          <HelpCircle className="h-4 w-4 mr-1" />
          Help
        </button>
      </div>
      
      {showFindReplace && (
        <FindReplaceDialog onClose={() => setShowFindReplace(false)} />
      )}
      
      {showRemoveDuplicates && (
        <RemoveDuplicatesDialog onClose={() => setShowRemoveDuplicates(false)} />
      )}
    </div>
  );
};

export default Header;