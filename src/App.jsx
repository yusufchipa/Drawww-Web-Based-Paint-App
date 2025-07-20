import React, { useState, useRef } from 'react';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('pencil');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const canvasRef = useRef(null);

  const handleExport = () => {
    // This will be handled by the Canvas component
    if (canvasRef.current) {
      canvasRef.current.exportToPNG();
    }
  };

  const handleClear = () => {
    // This will be handled by the Canvas component
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
      updateUndoRedoState();
    }
  };

  const handleRedo = () => {
    if (canvasRef.current) {
      canvasRef.current.redo();
      updateUndoRedoState();
    }
  };

  const updateUndoRedoState = () => {
    if (canvasRef.current) {
      setCanUndo(canvasRef.current.canUndo);
      setCanRedo(canvasRef.current.canRedo);
    }
  };

  const handleCanvasChange = () => {
    // Update undo/redo state when canvas changes
    updateUndoRedoState();
  };

  return (
    <div className="app">
      <div className="fun-decoration">🎨</div>
      <div className="fun-decoration">🌈</div>
      <div className="fun-decoration">✨</div>
      <div className="fun-decoration">🎭</div>

      <header className="app-header">
        <img
          src="/src/assets/logo.png"
          alt="E-Paint Logo"
          className="app-logo"
        />
        <div className="header-content">
          <h1>Drawww</h1>
          <p>🎨 Unleash Your Creativity! 🌟</p>
        </div>
      </header>

      <div className="app-content">
        <Sidebar
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onExport={handleExport}
          onClear={handleClear}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <main className="canvas-area">
          <Canvas
            ref={canvasRef}
            currentTool={currentTool}
            currentColor={currentColor}
            brushSize={brushSize}
            onCanvasChange={handleCanvasChange}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
