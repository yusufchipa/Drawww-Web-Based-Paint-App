import React, { useRef, useEffect, useState, useCallback } from 'react';

const ColorWheel = ({ currentColor, onColorChange }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [wheelRadius, setWheelRadius] = useState(80);
  const [centerX, setCenterX] = useState(100);
  const [centerY, setCenterY] = useState(100);

  // Convert HSV to RGB
  const hsvToRgb = (h, s, v) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r, g, b;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  };

  // Convert RGB to HSV
  const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return [h, s, v];
  };

  // Draw the color wheel
  const drawColorWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(200, 200);
    const data = imageData.data;

    for (let x = 0; x < 200; x++) {
      for (let y = 0; y < 200; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= wheelRadius) {
          const angle = Math.atan2(dy, dx);
          const hue = (angle * 180 / Math.PI + 360) % 360;
          const saturation = distance / wheelRadius;
          const value = 1;
          
          const [r, g, b] = hsvToRgb(hue, saturation, value);
          const index = (y * 200 + x) * 4;
          
          data[index] = r;     // Red
          data[index + 1] = g; // Green
          data[index + 2] = b; // Blue
          data[index + 3] = 255; // Alpha
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [centerX, centerY, wheelRadius]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 200;
      canvas.height = 200;
      drawColorWheel();
    }
  }, [drawColorWheel]);

  // Get color at position
  const getColorAtPosition = useCallback((x, y) => {
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= wheelRadius) {
      const angle = Math.atan2(dy, dx);
      const hue = (angle * 180 / Math.PI + 360) % 360;
      const saturation = Math.min(distance / wheelRadius, 1);
      const value = 1;
      
      const [r, g, b] = hsvToRgb(hue, saturation, value);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return null;
  }, [centerX, centerY, wheelRadius]);

  // Handle mouse events
  const handleMouseDown = useCallback((event) => {
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const color = getColorAtPosition(x, y);
    if (color) {
      onColorChange(color);
    }
  }, [getColorAtPosition, onColorChange]);

  const handleMouseMove = useCallback((event) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const color = getColorAtPosition(x, y);
    if (color) {
      onColorChange(color);
    }
  }, [isDragging, getColorAtPosition, onColorChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="color-wheel">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        style={{
          cursor: 'crosshair',
          borderRadius: '50%',
          border: '2px solid #ddd'
        }}
      />
    </div>
  );
};

export default ColorWheel;
