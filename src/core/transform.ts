import {useTransformStore} from '../store/useTransformStore'
import type { Rect } from '../types/History'
import type { TransformBox } from '../types/Transform'
import { getLayerCanvas } from './layerPixels'
import { beginPixelChange } from './pixelHistory'
import { setLayerOverride } from './preview'
import { requestRender } from './render'
import { drawTransformed, sameBox } from './transformMath'

interface Session {
  docId: string
  layerId: string
  canvas: HTMLCanvasElement
  source: HTMLCanvasElement
}

let session: Session | null = null

function contentBounds(canvas: HTMLCanvasElement): Rect | null {
  const { width, height } = canvas
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const data = new Uint32Array(ctx.getImageData(0, 0, width, height).data.buffer)
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    const row = y * width
    for (let x = 0; x < width; x++) {
      if (data[row + x] >>> 24 !== 0) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX === -1) return null
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

function crop(canvas: HTMLCanvasElement, rect: Rect): HTMLCanvasElement {
  const result = document.createElement('canvas')
  result.width = rect.width
  result.height = rect.height
  result
    .getContext('2d')
    ?.drawImage(
      canvas,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      rect.width,
      rect.height,
    )
  return result
}

function endSession(): void {
  session = null
  setLayerOverride(null)
  useTransformStore.getState().clear()
  requestRender()
}

export function beginTransform(
  docId: string,
  layerId: string,
  canvas: HTMLCanvasElement,
): boolean {
  endSession()

  const bounds = contentBounds(canvas)
  if (!bounds) return false

  session = { docId, layerId, canvas, source: crop(canvas, bounds) }

  useTransformStore.getState().begin({
    cx: bounds.x + bounds.width / 2,
    cy: bounds.y + bounds.height / 2,
    width: bounds.width,
    height: bounds.height,
    rotation: 0,
  })

  setLayerOverride({
    layerId,
    painter: (ctx) => {
      const box = useTransformStore.getState().box
      if (session && box) drawTransformed(ctx, session.source, box)
    },
  })
  requestRender()
  return true
}

export function getTransformBox(): TransformBox | null {
  return useTransformStore.getState().box
}

export function setTransformBox(box: TransformBox): void {
  useTransformStore.getState().setBox(box)
  requestRender()
}

export function resetTransform(): void {
  const origin = useTransformStore.getState().origin
  if (origin) setTransformBox(origin)
}

export function isTransformDirty(): boolean {
  const { box, origin } = useTransformStore.getState()
  return box !== null && origin !== null && !sameBox(box, origin)
}

export function applyTransform(): void {
  const current = session
  const { box, origin } = useTransformStore.getState()
  endSession()

  if (!current || !box || !origin || sameBox(box, origin)) return
  if (getLayerCanvas(current.layerId) !== current.canvas) return

  const ctx = current.canvas.getContext('2d')
  if (!ctx) return

  const change = beginPixelChange(current.docId, current.layerId, current.canvas)
  ctx.clearRect(0, 0, current.canvas.width, current.canvas.height)
  drawTransformed(ctx, current.source, box)
  change.commit()
  requestRender()
}