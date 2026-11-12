import type { PreviewPainter } from '../types/Tool'

interface LayerOverride {
  layerId: string
  painter: PreviewPainter
}

let painter: PreviewPainter | null = null
let override: LayerOverride | null = null

export function setPreview(next: PreviewPainter | null): void {
  painter = next
}

export function getPreview(): PreviewPainter | null {
  return painter
}

export function setLayerOverride(next: LayerOverride | null): void {
  override = next
}

export function getLayerOverride(layerId: string): PreviewPainter | null {
  return override?.layerId === layerId ? override.painter : null
}