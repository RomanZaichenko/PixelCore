const RASTER_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const SVG_TYPE = 'image/svg+xml'
const ACCEPTED_TYPES = [...RASTER_TYPES, SVG_TYPE]
const MAX_SIDE = 4096
const SVG_FALLBACK_SIDE = 1024

export const IMAGE_ACCEPT = [...ACCEPTED_TYPES, '.svg'].join(',')

export function pickImageFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = IMAGE_ACCEPT
    input.style.display = 'none'

    const finish = (file: File | null) => {
      input.remove()
      resolve(file)
    }
    input.addEventListener(
      'change',
      () => finish(input.files?.[0] ?? null),
      { once: true },
    )
    input.addEventListener('cancel', () => finish(null), { once: true })

    document.body.append(input)
    input.click()
  })
}

export function hasFiles(dataTransfer: DataTransfer | null): boolean {
  return dataTransfer !== null && Array.from(dataTransfer.types).includes('Files')
}

function isSvg(file: File): boolean {
  return file.type === SVG_TYPE || /\.svg$/i.test(file.name)
}

async function readSvgFile(file: File): Promise<ImageBitmap> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()

    let width = img.naturalWidth || SVG_FALLBACK_SIDE
    let height = img.naturalHeight || SVG_FALLBACK_SIDE
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height))
    width = Math.max(1, Math.round(width * scale))
    height = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)
    return await createImageBitmap(canvas)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function readImageFile(file: File): Promise<ImageBitmap> {
  if (isSvg(file)) {
    try {
      return await readSvgFile(file)
    } catch {
      throw new Error('Не вдалося прочитати SVG. Файл пошкоджений або не підтримується.')
    }
  }
  if (!RASTER_TYPES.includes(file.type)) {
    throw new Error('Підтримуються PNG, JPEG, WebP, SVG і проєкти .pxc.')
  }
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(
      'Не вдалося прочитати зображення. Файл пошкоджений або завеликий.',
    )
  }
}

export function fileBaseName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').trim()
  return base || 'Зображення'
}