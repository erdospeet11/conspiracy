'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { fabric } from 'fabric';

export interface CanvasRef {
  addRectangle: () => void;
  addText: () => void;
  startConnectionMode: () => void;
  isConnectionMode: boolean;
}

const Canvas = forwardRef<CanvasRef>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isConnectionMode, setIsConnectionMode] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [connections, setConnections] = useState<Array<{ from: fabric.Object; to: fabric.Object; line: fabric.Line }>>([]);

  const addRectangle = () => {
    if (!fabricRef.current) {
      console.error('Canvas not initialized');
      return;
    }

    const canvas = fabricRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      console.error('Container dimensions not available');
      return;
    }

    try {
      // Create a rectangle
      const rectangle = new fabric.Rect({
        left: rect.width / 2 - 50,
        top: rect.height / 2 - 50,
        width: 100,
        height: 100,
        fill: '#4f46e5',
        stroke: '#312e81',
        strokeWidth: 2,
        cornerColor: '#312e81',
        cornerStrokeColor: '#312e81',
        cornerSize: 10,
        transparentCorners: false,
        hasControls: true,
        hasBorders: true,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
      });

      // Add the rectangle to the canvas
      canvas.add(rectangle);
      canvas.setActiveObject(rectangle);
      canvas.renderAll();
    } catch (error) {
      console.error('Error adding rectangle:', error);
    }
  };

  const addText = () => {
    if (!fabricRef.current) {
      console.error('Canvas not initialized');
      return;
    }

    const canvas = fabricRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      console.error('Container dimensions not available');
      return;
    }

    try {
      // Create a textbox
      const textbox = new fabric.Textbox('Double click to edit', {
        left: rect.width / 2 - 100,
        top: rect.height / 2 - 25,
        width: 200,
        fontSize: 20,
        fontFamily: 'Arial',
        fill: '#1f2937',
        backgroundColor: '#f3f4f6',
        padding: 10,
        cornerColor: '#312e81',
        cornerStrokeColor: '#312e81',
        cornerSize: 10,
        transparentCorners: false,
        hasControls: true,
        hasBorders: true,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
        editable: true,
      });

      // Add the textbox to the canvas
      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      canvas.renderAll();

      // Enable text editing on double click
      textbox.on('mousedblclick', () => {
        textbox.enterEditing();
        textbox.selectAll();
        canvas.renderAll();
      });
    } catch (error) {
      console.error('Error adding text:', error);
    }
  };

  const startConnectionMode = () => {
    setIsConnectionMode(true);
  };

  const endConnectionMode = () => {
    setIsConnectionMode(false);
    if (selectedObject) {
      selectedObject.set('stroke', '#312e81');
      fabricRef.current?.renderAll();
    }
    setSelectedObject(null);
  };

  useImperativeHandle(ref, () => ({
    addRectangle,
    addText,
    startConnectionMode,
    isConnectionMode
  }));

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Initialize Fabric canvas
    fabricRef.current = new fabric.Canvas(canvasRef.current, {
      width: rect.width,
      height: rect.height,
      backgroundColor: '#f8f9fa',
      selection: true,
    });

    const canvas = fabricRef.current;

    // Add event listeners for object movement and scaling
    canvas.on('object:moving', (_e: fabric.IEvent) => {
      const obj = _e.target;
      if (!canvas || !obj || !canvas.width || !canvas.height) return;
      
      // Get object boundaries
      const objBounds = obj.getBoundingRect();
      
      // Prevent moving outside canvas
      if (objBounds.left < 0) obj.left = 0;
      if (objBounds.top < 0) obj.top = 0;
      if (objBounds.left + objBounds.width > canvas.width) {
        obj.left = canvas.width - objBounds.width;
      }
      if (objBounds.top + objBounds.height > canvas.height) {
        obj.top = canvas.height - objBounds.height;
      }

      // Update connection lines
      updateConnectionLines();
      
      canvas.renderAll();
    });

    canvas.on('object:scaling', (_e: fabric.IEvent) => {
      const obj = _e.target;
      if (!canvas || !obj || !canvas.width || !canvas.height) return;
      
      // Get object boundaries
      const objBounds = obj.getBoundingRect();
      
      // Prevent scaling outside canvas
      if (objBounds.left < 0) {
        obj.scaleX = (obj.left + obj.width * obj.scaleX) / obj.width;
        obj.left = 0;
      }
      if (objBounds.top < 0) {
        obj.scaleY = (obj.top + obj.height * obj.scaleY) / obj.height;
        obj.top = 0;
      }
      if (objBounds.left + objBounds.width > canvas.width) {
        obj.scaleX = (canvas.width - obj.left) / obj.width;
      }
      if (objBounds.top + objBounds.height > canvas.height) {
        obj.scaleY = (canvas.height - obj.top) / obj.height;
      }

      // Update connection lines
      updateConnectionLines();
      
      canvas.renderAll();
    });

    canvas.on('object:rotating', (_e: fabric.IEvent) => {
      // Update connection lines
      updateConnectionLines();
      canvas.renderAll();
    });

    // Add event listener for when object modification is complete
    canvas.on('object:modified', () => {
      updateConnectionLines();
      canvas.renderAll();
    });

    // Handle window resize
    const handleResize = () => {
      if (fabricRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        fabricRef.current.setWidth(rect.width);
        fabricRef.current.setHeight(rect.height);
        fabricRef.current.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      fabricRef.current?.dispose();
      fabricRef.current = null;
    };
  }, [updateConnectionLines]);

  // Separate effect for connection mode
  useEffect(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    const handleSelection = (e: fabric.IEvent) => {
      if (!isConnectionMode) return;
      
      const selected = e.selected?.[0];
      if (!selected) return;

      if (!selectedObject) {
        setSelectedObject(selected);
        selected.set('stroke', '#ef4444');
        canvas.renderAll();
      } else {
        // Create connection line
        const fromCenter = selectedObject.getCenterPoint();
        const toCenter = selected.getCenterPoint();
        
        const line = new fabric.Line(
          [fromCenter.x, fromCenter.y, toCenter.x, toCenter.y],
          {
            stroke: '#ef4444',
            strokeWidth: 2,
            selectable: false,
            evented: false,
          }
        );

        canvas.add(line);
        setConnections(prev => [...prev, { from: selectedObject, to: selected, line }]);
        
        // Reset selection and end connection mode
        selectedObject.set('stroke', '#312e81');
        selected.set('stroke', '#312e81');
        setSelectedObject(null);
        endConnectionMode();
        canvas.renderAll();
      }
    };

    canvas.on('selection:created', handleSelection);

    return () => {
      canvas.off('selection:created', handleSelection);
    };
  }, [isConnectionMode, selectedObject, endConnectionMode]);

  const updateConnectionLines = () => {
    if (!fabricRef.current) return;

    connections.forEach(({ from, to, line }) => {
      // Get the center points of both objects
      const fromCenter = from.getCenterPoint();
      const toCenter = to.getCenterPoint();

      // Update line coordinates
      line.set({
        x1: fromCenter.x,
        y1: fromCenter.y,
        x2: toCenter.x,
        y2: toCenter.y,
      });
    });

    fabricRef.current.renderAll();
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden bg-white"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas; 