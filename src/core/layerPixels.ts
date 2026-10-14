import type { EditorDocument } from '../types/EditorDocument';
import type Layer from '../types/Layer';

const pixels = new Map<string, HTMLCanvasElement>();

export function ensureLayerCanvas(
  layer: Layer,
  width: number,
  height: number
): HTMLCanvasElement {
  let canvas = pixels.get(layer.id);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    if (layer.fill === 'white') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }
    }
    pixels.set(layer.id, canvas);
  }
  return canvas;
}

export function disposeLayerCanvas(id: string): void {
  pixels.delete(id);
}

export function composite(
  doc: EditorDocument,
  target: HTMLCanvasElement
): void {
  const ctx = target.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, target.width, target.height);
  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    ctx.drawImage(ensureLayerCanvas(layer, doc.width, doc.height), 0, 0);
  }
}
