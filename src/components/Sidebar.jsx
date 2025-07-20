import React, { useState } from 'react';
import {
  Pencil,
  Paintbrush,
  Eraser,
  Type,
  PaintBucket,
  Download,
  Trash2,
  Minus,
  Plus,
  Highlighter,
  Undo,
  Redo
} from 'lucide-react';
import ColorWheel from './ColorWheel';

const Sidebar = ({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
  onExport,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const [showColorWheel, setShowColorWheel] = useState(false);

  const tools = [
    { id: 'pencil', icon: Pencil, name: 'Pencil', description: 'Draw precise lines' },
    { id: 'brush', icon: Paintbrush, name: 'Brush', description: 'Paint with smooth strokes' },
    { id: 'marker', icon: Highlighter, name: 'Marker', description: 'Draw with semi-transparent marker' },
    { id: 'eraser', icon: Eraser, name: 'Eraser', description: 'Erase parts of your drawing' },
    { id: 'fill', icon: PaintBucket, name: 'Fill', description: 'Fill enclosed areas with color' },
    { id: 'text', icon: Type, name: 'Text', description: 'Add text to your drawing' }
  ];

  const handleBrushSizeChange = (delta) => {
    setBrushSize(prev => Math.max(1, Math.min(50, prev + delta)));
  };

  const getBrushPreviewSize = () => {
    switch (currentTool) {
      case 'pencil': return Math.max(2, brushSize * 0.4); // Much thinner
      case 'brush': return brushSize * 1.2;
      case 'marker': return brushSize * 2.5; // Much thicker
      case 'eraser': return brushSize * 1.3;
      default: return brushSize;
    }
  };

  const getBrushOpacity = () => {
    switch (currentTool) {
      case 'pencil': return 1.0;
      case 'brush': return 0.9;
      case 'marker': return 0.25; // Much more faded
      case 'eraser': return 0.8;
      default: return 1.0;
    }
  };

  const getToolDescription = () => {
    switch (currentTool) {
      case 'pencil': return 'Very thin, sharp lines';
      case 'brush': return 'Thick, smooth strokes';
      case 'marker': return 'Very wide, faded & light';
      case 'eraser': return 'Remove drawing areas';
      case 'fill': return 'Fill enclosed areas';
      case 'text': return 'Add text to canvas';
      default: return '';
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="section-title">Tools</h3>
        <div className="tools-grid">
          {tools.map(tool => {
            const IconComponent = tool.icon;
            return (
              <button
                key={tool.id}
                className={`tool-button ${currentTool === tool.id ? 'active' : ''}`}
                onClick={() => setCurrentTool(tool.id)}
                title={tool.description}
              >
                <IconComponent size={20} />
                <span className="tool-name">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">Brush Size</h3>
        <div className="tool-description">
          {getToolDescription()}
        </div>
        <div className="brush-size-controls">
          <button 
            className="size-button"
            onClick={() => handleBrushSizeChange(-2)}
            disabled={brushSize <= 1}
          >
            <Minus size={16} />
          </button>
          <div className="brush-size-display">
            <div
              className="brush-preview"
              style={{
                width: `${Math.min(getBrushPreviewSize(), 30)}px`,
                height: `${Math.min(getBrushPreviewSize(), 30)}px`,
                backgroundColor: currentTool === 'eraser' ? '#ff6b6b' : currentColor,
                borderRadius: currentTool === 'marker' ? '2px' : '50%',
                opacity: getBrushOpacity()
              }}
            />
            <span className="size-text">{brushSize}px</span>
          </div>
          <button 
            className="size-button"
            onClick={() => handleBrushSizeChange(2)}
            disabled={brushSize >= 50}
          >
            <Plus size={16} />
          </button>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="brush-slider"
        />
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">Colors</h3>
        <div className="color-section">
          <div 
            className="current-color"
            style={{ backgroundColor: currentColor }}
            onClick={() => setShowColorWheel(!showColorWheel)}
            title="Click to open color wheel"
          />
          {showColorWheel && (
            <div className="color-wheel-container">
              <ColorWheel 
                currentColor={currentColor}
                onColorChange={setCurrentColor}
              />
            </div>
          )}
          <div className="quick-colors">
            {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(color => (
              <div
                key={color}
                className={`quick-color ${currentColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">Actions</h3>
        <div className="actions-grid">
          <div className="undo-redo-buttons">
            <button
              className={`action-button undo ${!canUndo ? 'disabled' : ''}`}
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo size={18} />
              <span>Undo</span>
            </button>
            <button
              className={`action-button redo ${!canRedo ? 'disabled' : ''}`}
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo size={18} />
              <span>Redo</span>
            </button>
          </div>
          <button className="action-button export" onClick={onExport}>
            <Download size={18} />
            <span>Export PNG</span>
          </button>
          <button className="action-button clear" onClick={onClear}>
            <Trash2 size={18} />
            <span>Clear Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
