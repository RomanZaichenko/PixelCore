import type { DocumentBackground } from './EditorDocument'

export interface DocumentMeta {
  id: string
  title: string
  width: number
  height: number
  background: DocumentBackground
  updatedAt: number
}