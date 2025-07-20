import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

const Canvas = forwardRef(({
  currentTool,
  currentColor,
  brushSize,
  onCanvasChange
}, ref) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState({ show: false, x: 0, y: 0, text: '' });

  // Define consistent white color
  const CANVAS_WHITE = '#FFFFFF';

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;

    // Set initial canvas background to white
    context.fillStyle = CANVAS_WHITE;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Configure drawing settings
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.imageSmoothingEnabled = true;

    contextRef.current = context;
  }, []);

  // Update drawing settings when props change
  useEffect(() => {
    if (contextRef.current) {
      // Reset to default composite operation first
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.strokeStyle = currentColor;
      contextRef.current.lineWidth = brushSize;

      // Set different brush characteristics
      switch (currentTool) {
        case 'pencil':
          contextRef.current.lineCap = 'round';
          contextRef.current.lineJoin = 'round';
          contextRef.current.globalAlpha = 1.0;
          contextRef.current.lineWidth = Math.max(1, brushSize * 0.4); // Much thinner and sharper
          break;
        case 'brush':
          contextRef.current.lineCap = 'round';
          contextRef.current.lineJoin = 'round';
          contextRef.current.globalAlpha = 0.9;
          contextRef.current.lineWidth = brushSize * 1.2; // Thicker for brush
          break;
        case 'marker':
          contextRef.current.lineCap = 'square';
          contextRef.current.lineJoin = 'miter';
          contextRef.current.globalAlpha = 0.25; // Much more transparent and faded
          contextRef.current.lineWidth = brushSize * 2.5; // Much thicker for marker
          break;
        case 'eraser':
          contextRef.current.lineCap = 'round';
          contextRef.current.lineJoin = 'round';
          contextRef.current.globalAlpha = 1.0;
          contextRef.current.globalCompositeOperation = 'destination-out';
          contextRef.current.lineWidth = brushSize * 1.3; // Slightly thicker for eraser
          break;
        default:
          contextRef.current.lineCap = 'round';
          contextRef.current.lineJoin = 'round';
          contextRef.current.globalAlpha = 1.0;
      }
    }
  }, [currentColor, brushSize, currentTool]);

  // Get mouse/touch position relative to canvas
  const getPosition = useCallback((event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (event.touches) {
      // Touch event
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    }
  }, []);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Flood fill algorithm
  const floodFill = useCallback((startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const startPos = (startY * canvas.width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // Convert fill color to RGB
    const fillRgb = hexToRgb(fillColor);
    if (!fillRgb) return;

    // If the start color is the same as fill color, don't fill
    if (startR === fillRgb.r && startG === fillRgb.g && startB === fillRgb.b) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;

      if (visited.has(key) || x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      visited.add(key);

      const pos = (y * canvas.width + x) * 4;
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      const a = data[pos + 3];

      // If this pixel matches the start color, fill it
      if (r === startR && g === startG && b === startB && a === startA) {
        data[pos] = fillRgb.r;
        data[pos + 1] = fillRgb.g;
        data[pos + 2] = fillRgb.b;
        data[pos + 3] = 255;

        // Add neighboring pixels to stack
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }

    context.putImageData(imageData, 0, 0);
  }, []);

  // Start drawing
  const startDrawing = useCallback((event) => {
    event.preventDefault();
    const position = getPosition(event);
    setLastPosition(position);

    if (currentTool === 'fill') {
      floodFill(Math.floor(position.x), Math.floor(position.y), currentColor);
      if (onCanvasChange) {
        onCanvasChange();
      }
      return;
    }

    if (currentTool === 'text') {
      setTextInput({ show: true, x: position.x, y: position.y, text: '' });
      return;
    }

    setIsDrawing(true);

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'marker' || currentTool === 'eraser') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(position.x, position.y);
    }
  }, [getPosition, currentTool, floodFill, currentColor, onCanvasChange]);

  // Handle text input
  const handleTextSubmit = useCallback((text) => {
    if (text.trim()) {
      const context = contextRef.current;
      context.font = `${brushSize * 3}px Arial`;
      context.fillStyle = currentColor;
      context.textBaseline = 'top';
      context.fillText(text, textInput.x, textInput.y);

      if (onCanvasChange) {
        onCanvasChange();
      }
    }
    setTextInput({ show: false, x: 0, y: 0, text: '' });
  }, [textInput, brushSize, currentColor, onCanvasChange]);

  const handleTextCancel = useCallback(() => {
    setTextInput({ show: false, x: 0, y: 0, text: '' });
  }, []);

  // Draw
  const draw = useCallback((event) => {
    if (!isDrawing) return;
    event.preventDefault();

    const position = getPosition(event);
    const context = contextRef.current;

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'marker' || currentTool === 'eraser') {
      context.lineTo(position.x, position.y);
      context.stroke();
    }

    setLastPosition(position);
  }, [isDrawing, getPosition, currentTool]);

  // Stop drawing
  const stopDrawing = useCallback((event) => {
    if (!isDrawing) return;
    event.preventDefault();
    
    setIsDrawing(false);
    contextRef.current.beginPath();
    
    // Notify parent component of canvas change
    if (onCanvasChange) {
      onCanvasChange();
    }
  }, [isDrawing, onCanvasChange]);

  // Export canvas as PNG
  const exportToPNG = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas');
    const exportContext = exportCanvas.getContext('2d');

    // Set the same dimensions
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;

    // Fill with the same white background as the canvas
    exportContext.fillStyle = CANVAS_WHITE;
    exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw the original canvas content on top
    exportContext.drawImage(canvas, 0, 0);

    // Create download link
    const link = document.createElement('a');
    link.download = 'e-paint-drawing.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    // Clear the entire canvas completely
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Reset composite operation to default
    context.globalCompositeOperation = 'source-over';

    // Fill with fresh white background using the same white as initialization
    context.fillStyle = CANVAS_WHITE;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Reset drawing settings
    context.strokeStyle = currentColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalAlpha = 1.0;

    if (onCanvasChange) {
      onCanvasChange();
    }
  }, [onCanvasChange, currentColor, brushSize]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    exportToPNG,
    clearCanvas
  }));

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          cursor: currentTool === 'eraser' ? 'crosshair' : 'crosshair',
          touchAction: 'none'
        }}
      />
      {textInput.show && (
        <div
          className="text-input-overlay"
          style={{
            position: 'absolute',
            left: textInput.x,
            top: textInput.y,
            zIndex: 1000
          }}
        >
          <input
            type="text"
            value={textInput.text}
            onChange={(e) => setTextInput(prev => ({ ...prev, text: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTextSubmit(textInput.text);
              } else if (e.key === 'Escape') {
                handleTextCancel();
              }
            }}
            onBlur={() => handleTextSubmit(textInput.text)}
            autoFocus
            style={{
              fontSize: `${brushSize * 3}px`,
              color: currentColor,
              background: 'transparent',
              border: '1px dashed #ccc',
              outline: 'none',
              fontFamily: 'Arial'
            }}
          />
        </div>
      )}
    </div>
  );
});

export default Canvas;
