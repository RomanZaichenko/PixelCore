import { useEffect } from 'react';
import { importImageFiles } from '../actions/importImages';
import { hasFiles } from '../io/importImage';

export function useBlockFileDrop() {
  useEffect(() => {
    function onDragOver(e: DragEvent) {
      if (hasFiles(e.dataTransfer)) e.preventDefault();
    }
    function onDrop(e: DragEvent) {
      if (!hasFiles(e.dataTransfer)) return;
      const handled = e.defaultPrevented;
      e.preventDefault();
      if (handled) return;
      void importImageFiles(Array.from(e.dataTransfer?.files ?? []));
    }
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, []);
}
