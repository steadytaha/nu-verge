import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { v4 } from 'uuid';

// Helper function to get coordinates from either mouse or touch event
const getEventCoordinates = (event: MouseEvent | TouchEvent) => {
  if (event.type.startsWith('touch')) {
    const touch = (event as TouchEvent).touches[0];
    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
    };
  }
  return {
    clientX: (event as MouseEvent).clientX,
    clientY: (event as MouseEvent).clientY,
  };
};

export const useFlowEvents = (reactFlowInstance: any, state: any, setNodes: any) => {
  const onDrop = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();

      // Get the transferred data regardless of event type
      const dataTransfer = event instanceof DragEvent ? event.dataTransfer : 
                          (event as any).dataTransfer || 
                          (window as any).lastDragData; // Fallback for touch events

      if (!dataTransfer) {
        console.warn('No data transfer available');
        return;
      }

      const type = dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const triggerAlreadyExists = state.editor.elements.find(
        (node: any) => node.type === "Trigger"
      );
      
      if (type === "Trigger" && triggerAlreadyExists) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Only one trigger can be placed into the automation!",
        });
        return;
      }

      if (!reactFlowInstance) return;

      const coordinates = getEventCoordinates(event);
      const position = reactFlowInstance.screenToFlowPosition({
        x: coordinates.clientX,
        y: coordinates.clientY,
      });

      const newNode = {
        id: v4(),
        type,
        position,
        data: {
          title: type,
          description: EditorCanvasDefaultCardTypes[type].description,
          completed: false,
          current: false,
          metadata: {},
          type: type,
          index: state.editor.elements.length,
        },
      };

      setNodes((nds: any) => nds.concat(newNode));
    },
    [state, reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    if (event instanceof DragEvent) {
      event.dataTransfer.dropEffect = "move";
    }
  }, []);

  // New touch event handlers
  const onTouchStart = useCallback((event: TouchEvent) => {
    // Store the dragged item's data for touch events
    const target = event.target as HTMLElement;
    const dragData = target.getAttribute('data-flow-type');
    if (dragData) {
      (window as any).lastDragData = {
        getData: () => dragData
      };
    }
  }, []);

  const onTouchMove = useCallback((event: TouchEvent) => {
    event.preventDefault();
    // Optional: Add visual feedback during touch drag
  }, []);

  const onTouchEnd = useCallback((event: TouchEvent) => {
    if ((window as any).lastDragData) {
      onDrop(event);
      (window as any).lastDragData = null;
    }
  }, [onDrop]);

  return {
    onDrop,
    onDragOver,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};