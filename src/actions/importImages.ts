import { fileBaseName, readImageFile } from '../io/importImage'
import { useEditorStore } from '../store/useEditorStore'

export async function importImageFiles(files: File[]): Promise<void> {
  if (files.length === 0) return

  const errors: string[] = []

  for (const file of files) {
    try {
      const image = await readImageFile(file)
      useEditorStore.getState().addImageLayer(fileBaseName(file.name), image)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Невідома помилка.'
      errors.push(files.length > 1 ? `${file.name}: ${message}` : message)
    }
  }

  if (errors.length > 0) window.alert(errors.join('\n'))
}