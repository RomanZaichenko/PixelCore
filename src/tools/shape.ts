import { drawShape, rectFromDrag } from '../core/shapes'
import type Point from '../types/Point'
import type {
  ShapeKind,
  Tool,
  ToolContext,
  ToolPointerEvent,
} from '../types/Tool'

interface ShapeToolConfig {
  type: ShapeKind
  label: string
  hotkey: string
}

export function createShapeTool({ type, label, hotkey }: ShapeToolConfig): Tool {
  let start: Point | null = null

  function updatePreview(ctx: ToolContext, e: ToolPointerEvent) {
    if (!start) return
    const rect = rectFromDrag(start, e.point, e.shiftKey, e.altKey)
    ctx.setPreview((c) =>
      drawShape(c, type, rect, ctx.shapeMode, ctx.color, ctx.size),
    )
    ctx.requestRender()
  }

  return {
    type,
    label,
    hotkey,
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
        drawShape(target, type, rect, ctx.shapeMode, ctx.color, ctx.size)
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