import { ensureLayerCanvas } from '../core/layerPixels';
import { commitTransform } from '../actions/transform';
import { canvasToBlob } from './exportImage';
import type {
  DocumentBackground,
  EditorDocument,
} from '../types/EditorDocument';
import type Layer from '../types/Layer';

export const PXC_MAGIC = 'PXC1';
export const PXC_VERSION = 1;
export const PXC_EXTENSION = 'pxc';
export const PXC_MIME = 'application/x-pixelcore';

interface PxcLayerEntry {
  name: string;
  visible: boolean;
  fill: Layer['fill'];
  offset: number;
  length: number;
}

interface PxcHeader {
  version: number;
  title: string;
  width: number;
  height: number;
  background: DocumentBackground;
  activeLayerIndex: number;
  layers: PxcLayerEntry[];
}

export interface PxcContent {
  title: string;
  width: number;
  height: number;
  background: DocumentBackground;
  activeLayerIndex: number;
  layers: {
    name: string;
    visible: boolean;
    fill: Layer['fill'];
    canvas: HTMLCanvasElement;
  }[];
}

export async function encodePxc(doc: EditorDocument): Promise<Blob> {
  commitTransform();

  const blobs: Blob[] = [];
  const entries: PxcLayerEntry[] = [];
  let offset = 0;

  for (const layer of doc.layers) {
    const canvas = ensureLayerCanvas(layer, doc.width, doc.height);
    const blob = await canvasToBlob(canvas, 'image/png');
    entries.push({
      name: layer.name,
      visible: layer.visible,
      fill: layer.fill,
      offset,
      length: blob.size,
    });
    blobs.push(blob);
    offset += blob.size;
  }

  const header: PxcHeader = {
    version: PXC_VERSION,
    title: doc.title,
    width: doc.width,
    height: doc.height,
    background: doc.background,
    activeLayerIndex: Math.max(
      0,
      doc.layers.findIndex((l) => l.id === doc.activeLayerId)
    ),
    layers: entries,
  };

  const json = new TextEncoder().encode(JSON.stringify(header));
  const prefix = new Uint8Array(8);
  prefix.set(new TextEncoder().encode(PXC_MAGIC), 0);
  new DataView(prefix.buffer).setUint32(4, json.length, true);

  return new Blob([prefix, json, ...blobs], { type: PXC_MIME });
}

async function blobToCanvas(
  blob: Blob,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

export async function decodePxc(file: Blob): Promise<PxcContent> {
  const bad = () =>
    new Error('Файл .pxc пошкоджений або має невідомий формат.');

  if (file.size < 8) throw bad();
  const prefix = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (new TextDecoder().decode(prefix.subarray(0, 4)) !== PXC_MAGIC)
    throw bad();

  const headerLength = new DataView(prefix.buffer).getUint32(4, true);
  if (headerLength === 0 || 8 + headerLength > file.size) throw bad();

  let header: PxcHeader;
  try {
    header = JSON.parse(
      new TextDecoder().decode(
        new Uint8Array(await file.slice(8, 8 + headerLength).arrayBuffer())
      )
    ) as PxcHeader;
  } catch {
    throw bad();
  }

  if (header.version > PXC_VERSION) {
    throw new Error('Файл створено новішою версією PixelCore.');
  }
  const validSize = (n: unknown) =>
    Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 4096;
  if (
    !validSize(header.width) ||
    !validSize(header.height) ||
    !Array.isArray(header.layers) ||
    header.layers.length === 0
  ) {
    throw bad();
  }

  const dataStart = 8 + headerLength;
  const layers: PxcContent['layers'] = [];
  for (const entry of header.layers) {
    const start = dataStart + entry.offset;
    const end = start + entry.length;
    if (entry.offset < 0 || entry.length <= 0 || end > file.size) throw bad();
    const canvas = await blobToCanvas(
      file.slice(start, end, 'image/png'),
      header.width,
      header.height
    );
    layers.push({
      name: String(entry.name),
      visible: Boolean(entry.visible),
      fill: entry.fill === 'white' ? 'white' : 'transparent',
      canvas,
    });
  }

  return {
    title: String(header.title || 'Без назви'),
    width: header.width,
    height: header.height,
    background: header.background === 'transparent' ? 'transparent' : 'white',
    activeLayerIndex: Math.min(
      Math.max(0, header.activeLayerIndex | 0),
      layers.length - 1
    ),
    layers,
  };
}
