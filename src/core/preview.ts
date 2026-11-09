import type PreviewPainter from '../types/Tool'

let painter: PreviewPainter | null = null

export function setPreview(next: PreviewPainter | null): void {
  painter = next
}

export function getPreview(): PreviewPainter | null {
  return painter
}