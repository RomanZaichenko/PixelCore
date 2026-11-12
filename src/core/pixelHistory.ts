import { useHistoryStore } from '../store/useHistoryStore';
import type { Rect } from '../types/History';

let pending = 0;

export function isDrawing(): boolean {
  return pending > 0;
}

function copyCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const copy = document.createElement('canvas');
  copy.width = source.width;
  copy.height = source.height;
  copy.getContext('2d')?.drawImage(source, 0, 0);
  return copy;
}

function cropCanvas(source: HTMLCanvasElement, rect: Rect): HTMLCanvasElement {
  const crop = document.createElement('canvas');
  crop.width = rect.width;
  crop.height = rect.height;
  crop
    .getContext('2d')
    ?.drawImage(
      source,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      rect.width,
      rect.height
    );
  return crop;
}

function diffRect(a: HTMLCanvasElement, b: HTMLCanvasElement): Rect | null {
  const { width, height } = a;
  const ctxA = a.getContext('2d');
  const ctxB = b.getContext('2d');
  if (!ctxA || !ctxB) return null;

  const dataA = new Uint32Array(ctxA.getImageData(0, 0, width, height).data.buffer);
  const dataB = new Uint32Array(ctxB.getImageData(0, 0, width, height).data.buffer);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      if (dataA[row + x] !== dataB[row + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1) return null;
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}


export function beginPixelChange(
  docId: string,
  layerId: string,
  canvas: HTMLCanvasElement
) {
  const before = copyCanvas(canvas);
  pending += 1;
  let done = false;

  return {
    commit() {
      if (done) return;
      done = true;
      pending = Math.max(0, pending - 1);

      const rect = diffRect(before, canvas);
      if (!rect) return;

      useHistoryStore.getState().record(docId, {
        kind: 'pixels',
        layerId,
        rect,
        before: cropCanvas(before, rect),
        after: cropCanvas(canvas, rect),
      });
    },
  };
}

export function restoreRegion(
  canvas: HTMLCanvasElement,
  rect: Rect,
  source: HTMLCanvasElement
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
  ctx.drawImage(source, rect.x, rect.y);
}
