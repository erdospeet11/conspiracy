'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
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

  const updateConnectionLines = useCallback(() => {
    if (!fabricRef.current) return;

    connections.forEach(({ from, to, line }) => {
      const fromCenter = from.getCenterPoint();
      const toCenter = to.getCenterPoint();

      line.set({
        x1: fromCenter.x,
        y1: fromCenter.y,
        x2: toCenter.x,
        y2: toCenter.y,
      });
    });

    fabricRef.current.renderAll();
  }, [connections]);

  const addRectangle = useCallback(() => {
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

      canvas.add(rectangle);
      canvas.setActiveObject(rectangle);
      canvas.renderAll();
    } catch (error) {
      console.error('Error adding rectangle:', error);
    }
  }, []);

  const addText = useCallback(() => {
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

      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      canvas.renderAll();

      textbox.on('mousedblclick', () => {
        textbox.enterEditing();
        textbox.selectAll();
        canvas.renderAll();
      });
    } catch (error) {
      console.error('Error adding text:', error);
    }
  }, []);

  const startConnectionMode = useCallback(() => {
    setIsConnectionMode(true);
  }, []);

  const endConnectionMode = useCallback(() => {
    setIsConnectionMode(false);
    if (selectedObject) {
      selectedObject.set('stroke', '#312e81');
      fabricRef.current?.renderAll();
    }
    setSelectedObject(null);
  }, [selectedObject]);

  useImperativeHandle(ref, () => ({
    addRectangle,
    addText,
    startConnectionMode,
    isConnectionMode
  }), [addRectangle, addText, startConnectionMode, isConnectionMode]);

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
    const handleObjectMoving = (_e: fabric.IEvent) => {
      const obj = _e.target;
      if (!canvas || !obj || !canvas.width || !canvas.height) return;
      
      const objBounds = obj.getBoundingRect();
      
      if (objBounds.left < 0) obj.left = 0;
      if (objBounds.top < 0) obj.top = 0;
      if (objBounds.left + objBounds.width > canvas.width) {
        obj.left = canvas.width - objBounds.width;
      }
      if (objBounds.top + objBounds.height > canvas.height) {
        obj.top = canvas.height - objBounds.height;
      }

      updateConnectionLines();
      canvas.renderAll();
    };

    const handleObjectScaling = (_e: fabric.IEvent) => {
      const obj = _e.target;
      if (!canvas || !obj || !canvas.width || !canvas.height) return;
      
      const objBounds = obj.getBoundingRect();
      
      if (objBounds.left < 0) {
        const rect = obj as fabric.Rect;
        rect.scaleX = ((rect.left || 0) + (rect.width || 0) * (rect.scaleX || 1)) / (rect.width || 1);
        rect.left = 0;
      }
      if (objBounds.top < 0) {
        const rect = obj as fabric.Rect;
        rect.scaleY = ((rect.top || 0) + (rect.height || 0) * (rect.scaleY || 1)) / (rect.height || 1);
        rect.top = 0;
      }
      if (objBounds.left + objBounds.width > canvas.width) {
        const rect = obj as fabric.Rect;
        rect.scaleX = (canvas.width - (rect.left || 0)) / (rect.width || 1);
      }
      if (objBounds.top + objBounds.height > canvas.height) {
        const rect = obj as fabric.Rect;
        rect.scaleY = (canvas.height - (rect.top || 0)) / (rect.height || 1);
      }

      updateConnectionLines();
      canvas.renderAll();
    };

    const handleObjectRotating = () => {
      updateConnectionLines();
      canvas.renderAll();
    };

    const handleObjectModified = () => {
      updateConnectionLines();
      canvas.renderAll();
    };

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:scaling', handleObjectScaling);
    canvas.on('object:rotating', handleObjectRotating);
    canvas.on('object:modified', handleObjectModified);

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
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:scaling', handleObjectScaling);
      canvas.off('object:rotating', handleObjectRotating);
      canvas.off('object:modified', handleObjectModified);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [updateConnectionLines]);

  // Connection mode effect
  useEffect(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    
    // Handle object click for connection mode
    const handleObjectSelect = (e: fabric.IEvent) => {
      if (!isConnectionMode) return;

      const target = e.target;
      if (!target) return;
      
      console.log('Object selected for connection:', target);

      // Prevent default selection behavior
      e.e.preventDefault();
      e.e.stopPropagation();
      
      if (!selectedObject) {
        // First selection
        console.log('First object selected');
        setSelectedObject(target);
        target.set('stroke', '#ef4444');
        canvas.renderAll();
      } else if (target !== selectedObject) {
        // Second selection - create connection
        console.log('Second object selected, creating connection');
        target.set('stroke', '#ef4444');
        canvas.renderAll();
        
        // Create line between objects
        const fromCenter = selectedObject.getCenterPoint();
        const toCenter = target.getCenterPoint();
        
        const line = new fabric.Line(
          [fromCenter.x, fromCenter.y, toCenter.x, toCenter.y],
          {
            stroke: '#ef4444',
            strokeWidth: 2,
            selectable: false,
            evented: false,
          }
        );

        console.log('Adding connection line to canvas');
        canvas.add(line);
        setConnections(prev => [...prev, { from: selectedObject, to: target, line }]);
        
        // Reset selection styles after a short delay to make it visible
        setTimeout(() => {
          if (selectedObject) selectedObject.set('stroke', '#312e81');
          target.set('stroke', '#312e81');
          
          // End connection mode
          setSelectedObject(null);
          setIsConnectionMode(false);
          canvas.renderAll();
          console.log('Connection completed, exiting connection mode');
        }, 300);
      }
    };

    if (isConnectionMode) {
      console.log('Entering connection mode');
      // Add object select event listener
      canvas.on('object:selected', handleObjectSelect);
    }

    return () => {
      // Remove event listener when connection mode changes
      canvas.off('object:selected', handleObjectSelect);
    };
  }, [isConnectionMode, selectedObject]);

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