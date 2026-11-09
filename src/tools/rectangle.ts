import { drawRect, rectFromDrag } from '../core/shapes'
import type Point from '../types/Point'
import type { ToolContext, ToolPointerEvent } from '../types/Tool'
import type Tool from '../types/Tool'

export function createRectangleTool(): Tool {
  let start: Point | null = null

  function updatePreview(ctx: ToolContext, e: ToolPointerEvent) {
    if (!start) return
    const rect = rectFromDrag(start, e.point, e.shiftKey, e.altKey)
    ctx.setPreview((c) =>
      drawRect(c, rect, ctx.shapeMode, ctx.color, ctx.size),
    )
    ctx.requestRender()
  }

  return {
    type: 'rectangle',
    label: 'Прямокутник',
    hotkey: 'U',
    cursor: 'crosshair',
    isModifiesPixels: true,

    onDown(ctx, e) {
      start = e.point
      updatePreview(ctx, e)
    },

    onMove: updatePreview,

    onUp(ctx, e) {
      if (!start) return
      const rect = rectFromDrag(start, e.point, e.shiftKey, e.altKey)
      start = null
      ctx.setPreview(null)

      const target = ctx.layerCanvas.getContext('2d')
      if (target) {
        drawRect(target, rect, ctx.shapeMode, ctx.color, ctx.size)
      }
      ctx.requestRender()
    },

    onCancel(ctx) {
      start = null
      ctx.setPreview(null)
      ctx.requestRender()
    },
  }
}