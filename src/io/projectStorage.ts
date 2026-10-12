import { del, get, set, update } from 'idb-keyval'
import type { EditorDocument } from '../types/EditorDocument'
import type { DocumentMeta } from '../types/DocumentMeta'

const INDEX_KEY = 'projects:index'
const docKey = (id: string) => `projects:doc:${id}`

export async function listProjects(): Promise<DocumentMeta[]> {
  const list = (await get<DocumentMeta[]>(INDEX_KEY)) ?? []
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function saveProject(doc: EditorDocument): Promise<void> {
  const meta: DocumentMeta = {
    id: doc.id,
    title: doc.title,
    width: doc.width,
    height: doc.height,
    updatedAt: Date.now(),
  }
  await set(docKey(doc.id), doc)
  await update<DocumentMeta[]>(INDEX_KEY, (old = []) => [
    ...old.filter((p) => p.id !== doc.id),
    meta,
  ])
}

export async function loadProject(
  id: string,
): Promise<EditorDocument | undefined> {
  return get<EditorDocument>(docKey(id))
}

export async function deleteProject(id: string): Promise<void> {
  await del(docKey(id))
  await update<DocumentMeta[]>(INDEX_KEY, (old = []) =>
    old.filter((p) => p.id !== id),
  )
}