import type { EditorDocument } from '../types/EditorDocument';

export const MIN_DOCUMENT_SIZE = 1;
export const MAX_DOCUMENT_SIZE = 4096;
export const DEFAULT_DOCUMENT_SIZE = { width: 1280, height: 720 };

export const DOCUMENTS_PRESETS = [
  { label: '800 × 600', width: 800, height: 600 },
  { label: '1280 × 800', width: 1280, height: 800 },
  { label: '1920 × 1080', width: 1920, height: 1080 },
  { label: '1080 × 1080', width: 1080, height: 1080 },
];

export function isValidSize(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= MIN_DOCUMENT_SIZE &&
    value <= MAX_DOCUMENT_SIZE
  );
}

export function createDocument(
  title: string,
  width: number,
  height: number
): EditorDocument {
  return {
    id: crypto.randomUUID(),
    title,
    layers: [{ id: crypto.randomUUID(), name: 'Layer 1', visible: true }],
    width,
    height,
  };
}
