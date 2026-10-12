import { useEditorStore } from '../store/useEditorStore'
import type { EditorDocument } from '../types/EditorDocument'
import { saveProject } from './projectStorage'

export function startAutosave(delay = 500) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let last: EditorDocument | undefined

  const unsubscribe = useEditorStore.subscribe((state) => {
    const doc = state.documents.find((d) => d.id === state.activeDocumentId)
    if (!doc || doc === last) return
    last = doc
    clearTimeout(timer)
    timer = setTimeout(() => {
      void saveProject(doc)
    }, delay)
  })

  return () => {
    clearTimeout(timer)
    unsubscribe()
  }
}