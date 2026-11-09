import { fill } from '../core/fill'
import type Tool from '../types/Tool'

export function createFillTool(): Tool {
  return {
    type: 'fill',
    label: 'Заливка',
    hotkey: 'G',
    cursor: 'crosshair',
    isModifiesPixels: true,

    onDown(ctx, e) {
      const changed = fill(
        ctx.layerCanvas,
        e.point.x,
        e.point.y,
        ctx.color,
        ctx.tolerance,
      )
      if (changed) ctx.requestRender()
    },
  }
}