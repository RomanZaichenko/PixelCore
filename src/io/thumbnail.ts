import { ensureLayerCanvas } from '../core/layerPixels';
import type { EditorDocument } from '../types/EditorDocument';

const MAX_WIDTH = 480;
const MAX_HEIGHT = 240;

export function renderThumbnail(doc: EditorDocument): string | undefined {
  const scale = Math.min(1, MAX_WIDTH / doc.width, MAX_HEIGHT / doc.height);
  const width = Math.max(1, Math.round(doc.width * scale));
  const height = Math.max(1, Math.round(doc.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    ctx.drawImage(
      ensureLayerCanvas(layer, doc.width, doc.height),
      0,
      0,
      width,
      height
    );
  }
  return canvas.toDataURL('image/webp', 0.85);
}
