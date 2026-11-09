import type  Point  from './Point'

export type ToolType = 'brush' | 'eraser' | "fill" | "rectangle" | "picker" 

export type ShapeMode = "fill" | "stroke"

export type PreviewPainter = (ctx: CanvasRenderingContext2D) => void

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
  tolerance: number
  shapeMode: ShapeMode
  requestRender: () => void
  setPreview: (painter: PreviewPainter | null) => void
  sampleColor: (point: Point) => string | null
  setColor: (color: string) => void
}

export default interface Tool {
  label: string
  hotkey: string
  cursor: string
  type: ToolType
  isModifiesPixels: boolean
  onDown: (ctx: ToolContext, e: ToolPointerEvent) => void
  onMove?: (ctx: ToolContext, e: ToolPointerEvent) => void
  onUp?: (ctx: ToolContext, e: ToolPointerEvent) => void
  onCancel?: (ctx: ToolContext) => void
}