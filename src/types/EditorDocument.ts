import type Layer from './Layer'

export type DocumentBackground = 'white' | 'transparent'

export interface EditorDocument {
  id: string
  title: string
  width: number
  height: number
  background: DocumentBackground
  layers: Layer[]
}