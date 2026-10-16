import type { EditorDocument } from '../types/EditorDocument';
import type Layer from '../types/Layer';
import { fitInside } from './imageFit';

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


export function setLayerCanvas(id: string, canvas: HTMLCanvasElement): void {
  pixels.set(id, canvas);
}

export function createLayerFromImage(
  image: ImageBitmap,
  documentWidth: number,
  documentHeight: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = documentWidth;
    canvas.height = documentHeight;
    const context = canvas.getContext('2d');
    if (context) {
      const place = fitInside(image.width, image.height, documentWidth, documentHeight);
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(image, place.x, place.y, place.width, place.height);
    }
    return canvas;
}


