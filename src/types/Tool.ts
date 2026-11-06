import type  Point  from './Point'

export type ToolType = 'brush' | 'eraser' 

export interface ToolPointerEvent {
  point: Point
  pressure: number
  shiftKey: boolean
  altKey: boolean
  ctrlKey: boolean
}

export interface ToolContext {
  layerCanvas: HTMLCanvasElement
  color: string
  size: number
  requestRender: () => void
}

export default interface Tool {
  label: string
  hotkey: string
  cursor: string
  type: ToolType
  onDown: (ctx: ToolContext, e: ToolPointerEvent) => void
  onMove: (ctx: ToolContext, e: ToolPointerEvent) => void
  onUp: (ctx: ToolContext, e: ToolPointerEvent) => void
}