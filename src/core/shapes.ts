import type Point  from '../types/Point'
import type { ShapeMode } from '../types/Tool'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

function normalize(x1: number, y1: number, x2: number, y2: number): Rect {
  const left = Math.round(Math.min(x1, x2))
  const top = Math.round(Math.min(y1, y2))
  const right = Math.round(Math.max(x1, x2))
  const bottom = Math.round(Math.max(y1, y2))
  return { x: left, y: top, width: right - left, height: bottom - top }
}

export function rectFromDrag(
  start: Point,
  end: Point,
  square: boolean,
  fromCenter: boolean,
): Rect {
  let dx = end.x - start.x
  let dy = end.y - start.y

  if (square) {
    const side = Math.max(Math.abs(dx), Math.abs(dy))
    dx = Math.sign(dx || 1) * side
    dy = Math.sign(dy || 1) * side
  }

  if (fromCenter) {
    return normalize(start.x - dx, start.y - dy, start.x + dx, start.y + dy)
  }
  return normalize(start.x, start.y, start.x + dx, start.y + dy)
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  mode: ShapeMode,
  color: string,
  lineWidth: number,
): void {
  if (rect.width <= 0 || rect.height <= 0) return

  ctx.save()
  if (mode === 'fill') {
    ctx.fillStyle = color
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
  } else {
    const inset = Math.min(lineWidth / 2, rect.width / 2, rect.height / 2)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineJoin = 'miter'
    ctx.strokeRect(
      rect.x + inset,
      rect.y + inset,
      rect.width - inset * 2,
      rect.height - inset * 2,
    )
  }
  ctx.restore()
}