import type {
  DocumentBackground,
  EditorDocument,
} from '../types/EditorDocument'
import type Layer from '../types/Layer'
import type {LayerFill} from '../types/Layer'

export const MIN_DOCUMENT_SIZE = 1
export const MAX_DOCUMENT_SIZE = 4096
export const DEFAULT_DOCUMENT_SIZE = { width: 1280, height: 800 }

export const DOCUMENT_PRESETS = [
  { label: '800 × 600', width: 800, height: 600 },
  { label: '1280 × 800', width: 1280, height: 800 },
  { label: '1920 × 1080', width: 1920, height: 1080 },
  { label: '1080 × 1080', width: 1080, height: 1080 },
]

export function isValidSize(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= MIN_DOCUMENT_SIZE &&
    value <= MAX_DOCUMENT_SIZE
  )
}

export function createLayer(
  name: string,
  fill: LayerFill = 'transparent',
): Layer {
  return { id: crypto.randomUUID(), name, visible: true, fill }
}

export function nextLayerName(layers: Layer[]): string {
  const numbers = layers
    .map((l) => /^Шар (\d+)$/.exec(l.name))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]))
  return `Шар ${Math.max(0, ...numbers) + 1}`
}

export function createDocument(
  title: string,
  width: number,
  height: number,
  background: DocumentBackground,
): EditorDocument {
  const base = createLayer('Фон', background)
  return {
    id: crypto.randomUUID(),
    title,
    width,
    height,
    background,
    layers: [base],
    activeLayerId: base.id,
  }
}