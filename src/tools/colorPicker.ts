import type { ToolContext, ToolPointerEvent } from '../types/Tool'
import type Tool from '../types/Tool'

function pick(ctx: ToolContext, e: ToolPointerEvent) {
  const color = ctx.sampleColor(e.point)
  if (color) ctx.setColor(color)
}

export function createColorPickerTool(): Tool {
  return {
    type: 'picker',
    label: 'Піпетка',
    hotkey: 'I',
    cursor: 'crosshair',
    isModifiesPixels: false,
    onDown: pick,
    onMove: pick,
  }
}