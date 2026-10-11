import type Layer  from './Layer'

export interface EditorDocument {
  id: string
  title: string
  layers: Layer[]
  width: number
  height: number
}
