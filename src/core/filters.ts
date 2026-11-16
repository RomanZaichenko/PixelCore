export type SimpleFilter = 'grayscale' | 'invert' | 'sepia'
export type AdjustFilter = 'brightness' | 'contrast' | 'saturation' | 'blur'
export type FilterKind = SimpleFilter | AdjustFilter

export type FilterSpec =
  | { kind: SimpleFilter }
  | { kind: AdjustFilter; amount: number }

export const FILTER_LABELS: Record<FilterKind, string> = {
  grayscale: 'Чорно-білий',
  invert: 'Інверсія',
  sepia: 'Сепія',
  brightness: 'Яскравість',
  contrast: 'Контраст',
  saturation: 'Насиченість',
  blur: 'Розмиття',
}

export interface AdjustRange {
  min: number
  max: number
  step: number
  default: number
  unit: string
}

export const ADJUST_RANGES: Record<AdjustFilter, AdjustRange> = {
  brightness: { min: -100, max: 100, step: 1, default: 0, unit: '%' },
  contrast: { min: -100, max: 100, step: 1, default: 0, unit: '%' },
  saturation: { min: -100, max: 100, step: 1, default: 0, unit: '%' },
  blur: { min: 0, max: 40, step: 1, default: 4, unit: 'px' },
}

export function isAdjustFilter(kind: FilterKind): kind is AdjustFilter {
  return kind in ADJUST_RANGES
}

const luma = (r: number, g: number, b: number) =>
  0.299 * r + 0.587 * g + 0.114 * b

/** Застосовує фільтр до пікселів «на місці». Прозорі пікселі не чіпає. */
export function applyFilter(image: ImageData, spec: FilterSpec): void {
  const d = image.data

  switch (spec.kind) {
    case 'grayscale':
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue
        const g = luma(d[i], d[i + 1], d[i + 2])
        d[i] = d[i + 1] = d[i + 2] = g
      }
      return

    case 'invert':
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue
        d[i] = 255 - d[i]
        d[i + 1] = 255 - d[i + 1]
        d[i + 2] = 255 - d[i + 2]
      }
      return

    case 'sepia':
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue
        const r = d[i]
        const g = d[i + 1]
        const b = d[i + 2]
        d[i] = 0.393 * r + 0.769 * g + 0.189 * b
        d[i + 1] = 0.349 * r + 0.686 * g + 0.168 * b
        d[i + 2] = 0.272 * r + 0.534 * g + 0.131 * b
      }
      return

    case 'brightness': {
      const delta = spec.amount * 2.55
      if (delta === 0) return
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue
        d[i] += delta
        d[i + 1] += delta
        d[i + 2] += delta
      }
      return
    }

    case 'contrast': {
      const v = spec.amount * 2.55
      if (v === 0) return
      const factor = (259 * (v + 255)) / (255 * (259 - v))
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue
        d[i] = factor * (d[i] - 128) + 128
        d[i + 1] = factor * (d[i + 1] - 128) + 128
        d[i + 2] = factor * (d[i + 2] - 128) + 128
      }
      return
    }

    case 'saturation': {
      const s = 1 + spec.amount / 100
      if (s === 1) return
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue
        const r = d[i]
        const g = d[i + 1]
        const b = d[i + 2]
        const gray = luma(r, g, b)
        d[i] = gray + (r - gray) * s
        d[i + 1] = gray + (g - gray) * s
        d[i + 2] = gray + (b - gray) * s
      }
      return
    }

    case 'blur':
      blurImageData(image, spec.amount)
      return
  }
}


function boxesForGauss(sigma: number, n: number): number[] {
  const ideal = Math.sqrt((12 * sigma * sigma) / n + 1)
  let lower = Math.floor(ideal)
  if (lower % 2 === 0) lower--
  const upper = lower + 2
  const m = Math.round(
    (12 * sigma * sigma - n * lower * lower - 4 * n * lower - 3 * n) /
      (-4 * lower - 4),
  )
  return Array.from({ length: n }, (_, i) => (i < m ? lower : upper))
}

function boxPass(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  r: number,
  horizontal: boolean,
): void {
  const length = horizontal ? width : height
  const lines = horizontal ? height : width
  const step = horizontal ? 4 : width * 4
  const lineStep = horizontal ? width * 4 : 4
  const inv = 1 / (2 * r + 1)

  for (let line = 0; line < lines; line++) {
    const base = line * lineStep
    for (let c = 0; c < 4; c++) {
      const o = base + c
      let sum = 0
      for (let k = -r; k <= r; k++) {
        const idx = k < 0 ? 0 : k >= length ? length - 1 : k
        sum += src[o + idx * step]
      }
      for (let x = 0; x < length; x++) {
        dst[o + x * step] = sum * inv
        const add = x + r + 1
        const sub = x - r
        sum +=
          src[o + (add >= length ? length - 1 : add) * step] -
          src[o + (sub < 0 ? 0 : sub) * step]
      }
    }
  }
}

function blurImageData(image: ImageData, radius: number): void {
  if (radius < 0.5) return
  const { data, width, height } = image

  const a = new Uint8ClampedArray(data.length)
  const b = new Uint8ClampedArray(data.length)
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    const f = alpha / 255
    a[i] = data[i] * f
    a[i + 1] = data[i + 1] * f
    a[i + 2] = data[i + 2] * f
    a[i + 3] = alpha
  }

  for (const size of boxesForGauss(radius, 3)) {
    const r = (size - 1) >> 1
    boxPass(a, b, width, height, r, true)
    boxPass(b, a, width, height, r, false)
  }

  const result = a
  for (let i = 0; i < data.length; i += 4) {
    const alpha = result[i + 3]
    if (alpha === 0) {
      data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0
      continue
    }
    const f = 255 / alpha
    data[i] = result[i] * f
    data[i + 1] = result[i + 1] * f
    data[i + 2] = result[i + 2] * f
    data[i + 3] = alpha
  }
}