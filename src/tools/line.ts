import { drawLine, segmentFromDrag } from '../core/shapes'
import type Point from '../types/Point'
import type { Tool, ToolContext, ToolPointerEvent } from '../types/Tool'

export function createLineTool(): Tool {
  let start: Point | null = null

  function updatePreview(ctx: ToolContext, e: ToolPointerEvent) {
    if (!start) return
    const segment = segmentFromDrag(start, e.point, e.shiftKey, e.altKey)
    ctx.setPreview((c) => drawLine(c, segment, ctx.color, ctx.size))
    ctx.requestRender()
  }

  return {
    type: 'line',
    label: 'Лінія',
    hotkey: 'L',
    cursor: 'crosshair',
    modifiesPixels: true,

    onDown(ctx, e) {
      start = e.point
      updatePreview(ctx, e)
    },

    onMove: updatePreview,

    onUp(ctx, e) {
      if (!start) return
      const segment = segmentFromDrag(start, e.point, e.shiftKey, e.altKey)
      start = null
      ctx.setPreview(null)

      const target = ctx.layerCanvas.getContext('2d')
      if (target) drawLine(target, segment, ctx.color, ctx.size)
      ctx.requestRender()
    },

    onCancel(ctx) {
      start = null
      ctx.setPreview(null)
      ctx.requestRender()
    },
  }
}