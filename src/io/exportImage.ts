import { ensureLayerCanvas } from '../core/layerPixels';
import { commitTransform } from '../actions/transform';
import type { EditorDocument } from '../types/EditorDocument';

export type RasterFormat = 'png' | 'jpeg' | 'webp';
export type ExportFormat = RasterFormat | 'svg';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number;
  backgroundColor?: string;
}

const MIME: Record<RasterFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export const EXTENSION: Record<ExportFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
  svg: 'svg',
};

export function flattenDocument(
  doc: EditorDocument,
  backgroundColor?: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = doc.width;
  canvas.height = doc.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Не вдалося створити canvas для експорту.');

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, doc.width, doc.height);
  }
  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    ctx.drawImage(ensureLayerCanvas(layer, doc.width, doc.height), 0, 0);
  }
  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('Не вдалося закодувати зображення.')),
      type,
      quality
    );
  });
}

export function canvasToSvg(canvas: HTMLCanvasElement): string {
  const { width, height } = canvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Не вдалося прочитати пікселі.');
  const data = ctx.getImageData(0, 0, width, height).data;

  const rects: string[] = [];
  for (let y = 0; y < height; y++) {
    let x = 0;
    while (x < width) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a === 0) {
        x++;
        continue;
      }
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      let end = x + 1;
      while (end < width) {
        const j = (y * width + end) * 4;
        if (
          data[j] !== r ||
          data[j + 1] !== g ||
          data[j + 2] !== b ||
          data[j + 3] !== a
        )
          break;
        end++;
      }
      const hex =
        '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
      const opacity = a < 255 ? ` fill-opacity="${(a / 255).toFixed(3)}"` : '';
      rects.push(
        `<rect x="${x}" y="${y}" width="${end - x}" height="${1}" fill="${hex}"${opacity}/>`
      );
      x = end;
    }
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">\n` +
    rects.join('\n') +
    `\n</svg>\n`
  );
}

export async function exportDocument(
  doc: EditorDocument,
  options: ExportOptions
): Promise<Blob> {
  commitTransform();

  const { format, quality = 0.92 } = options;
  const bg =
    options.backgroundColor ?? (format === 'jpeg' ? '#ffffff' : undefined);
  const canvas = flattenDocument(doc, bg);

  if (format === 'svg') {
    return new Blob([canvasToSvg(canvas)], { type: 'image/svg+xml' });
  }
  return canvasToBlob(
    canvas,
    MIME[format],
    format === 'png' ? undefined : quality
  );
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFileName(title: string): string {
  return title.replace(/[\\/:*?"<>|]+/g, '_').trim() || 'document';
}
