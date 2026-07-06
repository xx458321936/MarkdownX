import { useState } from 'react';
import type { FileNode } from '@/types';

export function useDraggableNode(node: FileNode): {
  draggable: true;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
} {
  return {
    draggable: true,
    onDragStart: (e: React.DragEvent): void => {
      e.dataTransfer.setData('text/plain', node.path);
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragEnd: (): void => undefined,
  };
}

export function useDropTarget(node: FileNode): {
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  className?: string;
} {
  const [hover, setHover] = useState(false);
  return {
    onDragEnter: (e: React.DragEvent): void => {
      if (!node.isDir) return;
      const source = e.dataTransfer.types.includes('text/plain');
      if (!source) return;
      e.preventDefault();
      setHover(true);
    },
    onDragOver: (e: React.DragEvent): void => {
      if (!node.isDir) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDragLeave: (): void => setHover(false),
    className: hover ? 'ring-2 ring-accent' : '',
  };
}
