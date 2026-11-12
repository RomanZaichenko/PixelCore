import { useEffect } from 'react'
import { commitTransform } from '../actions/transform'
import { isTransformDirty, resetTransform } from '../core/transform'
import { useEditorStore } from '../store/useEditorStore'

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  )
}

export function useTransformHotkeys() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (useEditorStore.getState().tool !== 'transform') return
      if (isTextField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return
      if (!isTransformDirty()) return

      if (e.key === 'Enter') {
        e.preventDefault()
        commitTransform()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        resetTransform()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}