import React, { useState } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import Grid from './components/Grid';

function App() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <Toolbar />
      <FormulaBar />
      <div className="flex-1 overflow-hidden">
        <Grid />
      </div>
    </div>
  );
}

export default App;