import { useEffect } from 'react'
import { saveActiveProjectFile } from '../actions/projectFiles'

export function useProjectHotkeys() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return
      if (e.code !== 'KeyS') return
      e.preventDefault()
      void saveActiveProjectFile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}