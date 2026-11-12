import type Point from '../types/Point'
import type { TransformBox } from '../types/Transform'

export type HandleDef = { id: string; hx: -1 | 0 | 1; hy: -1 | 0 | 1 }

export const HANDLES: HandleDef[] = [
  { id: 'nw', hx: -1, hy: -1 },
  { id: 'n', hx: 0, hy: -1 },
  { id: 'ne', hx: 1, hy: -1 },
  { id: 'e', hx: 1, hy: 0 },
  { id: 'se', hx: 1, hy: 1 },
  { id: 's', hx: 0, hy: 1 },
  { id: 'sw', hx: -1, hy: 1 },
  { id: 'w', hx: -1, hy: 0 },
]

export const ROTATE_OFFSET_PX = 28
export const HANDLE_HIT_PX = 8
export const MIN_SIZE = 1

export type Hit =
  | { kind: 'handle'; handle: HandleDef }
  | { kind: 'rotate' }
  | { kind: 'move' }

function rotate(x: number, y: number, angle: number): Point {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x: x * cos - y * sin, y: x * sin + y * cos }
}

export function toLocal(box: TransformBox, p: Point): Point {
  return rotate(p.x - box.cx, p.y - box.cy, -box.rotation)
}

export function toWorld(box: TransformBox, local: Point): Point {
  const r = rotate(local.x, local.y, box.rotation)
  return { x: box.cx + r.x, y: box.cy + r.y }
}

export function handlePoint(box: TransformBox, hx: number, hy: number): Point {
  return toWorld(box, { x: (hx * box.width) / 2, y: (hy * box.height) / 2 })
}

export function rotateHandlePoint(box: TransformBox, zoom: number): Point {
  return toWorld(box, {
    x: 0,
    y: -box.height / 2 - ROTATE_OFFSET_PX / zoom,
  })
}

export function sameBox(a: TransformBox, b: TransformBox): boolean {
  return (
    a.cx === b.cx &&
    a.cy === b.cy &&
    a.width === b.width &&
    a.height === b.height &&
    a.rotation === b.rotation
  )
}

export function hitTest(
  box: TransformBox,
  p: Point,
  zoom: number,
): Hit | null {
  const radius = HANDLE_HIT_PX / zoom

  const rot = rotateHandlePoint(box, zoom)
  if (Math.hypot(p.x - rot.x, p.y - rot.y) <= radius) return { kind: 'rotate' }

  for (const handle of HANDLES) {
    const hp = handlePoint(box, handle.hx, handle.hy)
    if (Math.hypot(p.x - hp.x, p.y - hp.y) <= radius) {
      return { kind: 'handle', handle }
    }
  }

  const q = toLocal(box, p)
  if (Math.abs(q.x) <= box.width / 2 && Math.abs(q.y) <= box.height / 2) {
    return { kind: 'move' }
  }
  return null
}

export function moveBox(
  start: TransformBox,
  startPointer: Point,
  pointer: Point,
): TransformBox {
  return {
    ...start,
    cx: start.cx + Math.round(pointer.x - startPointer.x),
    cy: start.cy + Math.round(pointer.y - startPointer.y),
  }
}

export function rotateBox(
  start: TransformBox,
  startPointer: Point,
  pointer: Point,
  snap: boolean,
): TransformBox {
  const from = Math.atan2(startPointer.y - start.cy, startPointer.x - start.cx)
  const to = Math.atan2(pointer.y - start.cy, pointer.x - start.cx)
  let rotation = start.rotation + (to - from)

  if (snap) {
    const step = Math.PI / 12
    rotation = Math.round(rotation / step) * step
  }
  return { ...start, rotation }
}

export function resizeBox(
  start: TransformBox,
  hx: number,
  hy: number,
  pointer: Point,
  keepAspect: boolean,
  fromCenter: boolean,
): TransformBox {
  const q = toLocal(start, pointer)
  const { width: w, height: h } = start

  let newW = w
  let newH = h
  if (hx !== 0) newW = fromCenter ? 2 * hx * q.x : hx * q.x + w / 2
  if (hy !== 0) newH = fromCenter ? 2 * hy * q.y : hy * q.y + h / 2

  if (keepAspect) {
    let s: number
    if (hx !== 0 && hy !== 0) s = Math.max(newW / w, newH / h)
    else if (hx !== 0) s = newW / w
    else s = newH / h
    s = Math.max(s, MIN_SIZE / w, MIN_SIZE / h)
    newW = w * s
    newH = h * s
  } else {
    newW = Math.max(MIN_SIZE, newW)
    newH = Math.max(MIN_SIZE, newH)
  }

  const offset = fromCenter
    ? { x: 0, y: 0 }
    : rotate((hx * (newW - w)) / 2, (hy * (newH - h)) / 2, start.rotation)

  return {
    cx: start.cx + offset.x,
    cy: start.cy + offset.y,
    width: newW,
    height: newH,
    rotation: start.rotation,
  }
}

export function drawTransformed(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  box: TransformBox,
): void {
  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.translate(box.cx, box.cy)
  ctx.rotate(box.rotation)
  ctx.drawImage(
    source,
    -box.width / 2,
    -box.height / 2,
    box.width,
    box.height,
  )
  ctx.restore()
}