import type { EditorDocument } from '../types/EditorDocument'
import type Layer  from '../types/Layer'
import { fitInside } from './imageFit'
import { getPreview } from './preview'

const pixels = new Map<string, HTMLCanvasElement>()
let probe: HTMLCanvasElement | null = null

export function ensureLayerCanvas(
  layer: Layer,
  width: number,
  height: number,
): HTMLCanvasElement {
  let canvas = pixels.get(layer.id)
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    if (layer.fill === 'white') {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
      }
    }
    pixels.set(layer.id, canvas)
  }
  return canvas
}

export  function setLayerCanvas(id: string, canvas: HTMLCanvasElement): void {
  pixels.set(id, canvas)
}

export function createCanvasFromImage(
  image: ImageBitmap,
  docWidth: number,
  docHeight: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = docWidth
  canvas.height = docHeight
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const place = fitInside(image.width, image.height, docWidth, docHeight)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, place.x, place.y, place.width, place.height)
  }
  return canvas
}

export function disposeLayerCanvas(id: string): void {
  pixels.delete(id)
}

export function composite(
  doc: EditorDocument,
  target: HTMLCanvasElement,
): void {
  const ctx = target.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, target.width, target.height)
  for (const layer of doc.layers) {
    if (!layer.visible) continue
    ctx.drawImage(ensureLayerCanvas(layer, doc.width, doc.height), 0, 0)
    if (layer.id === doc.activeLayerId) getPreview()?.(ctx)
  }
}

export function sampleColor(
  doc: EditorDocument,
  x: number,
  y: number,
): string | null {
  const px = Math.floor(x)
  const py = Math.floor(y)
  if (px < 0 || py < 0 || px >= doc.width || py >= doc.height) return null

  if (!probe) {
    probe = document.createElement('canvas')
    probe.width = 1
    probe.height = 1
  }
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.clearRect(0, 0, 1, 1)
  for (const layer of doc.layers) {
    if (!layer.visible) continue
    const source = ensureLayerCanvas(layer, doc.width, doc.height)
    ctx.drawImage(source, px, py, 1, 1, 0, 0, 1, 1)
  }

  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  if (a === 0) return null
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}