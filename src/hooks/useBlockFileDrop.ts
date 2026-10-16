import { useEffect } from 'react'
import { hasFiles } from '../io/importImage'

export function useBlockFileDrop() {
  useEffect(() => {
    function block(e: DragEvent) {
      if (hasFiles(e.dataTransfer)) e.preventDefault()
    }
    window.addEventListener('dragover', block)
    window.addEventListener('drop', block)
    return () => {
      window.removeEventListener('dragover', block)
      window.removeEventListener('drop', block)
    }
  }, [])
}