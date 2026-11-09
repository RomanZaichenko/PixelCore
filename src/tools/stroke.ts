import {drawSegment} from '../core/stroke'
import type Point from '../types/Point'
import type Tool from '../types/Tool'
import type { ToolType } from '../types/Tool'


interface StrokeToolConfig {
  type: ToolType
  label: string
  hotkey: string
  erase: boolean
}

export function createStrokeTool({
  type,
  label,
  hotkey,
  erase,
}: StrokeToolConfig): Tool {
  let last: Point | null = null

  return {
    type,
    label,
    hotkey,
    cursor: 'crosshair',
    isModifiesPixels: true,

    onDown(ctx, e) {
      last = e.point
      drawSegment(ctx.layerCanvas, e.point, e.point, ctx.size, ctx.color, erase)
      ctx.requestRender()
    },

    onMove(ctx, e) {
      if (!last) return
      drawSegment(ctx.layerCanvas, last, e.point, ctx.size, ctx.color, erase)
      last = e.point
      ctx.requestRender()
    },

    onUp() {
      last = null
    },
  }
}