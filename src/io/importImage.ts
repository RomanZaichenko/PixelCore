const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export function pickImageFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = ACCEPTED_TYPES.join(',')
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

export async function readImageFile(file: File): Promise<ImageBitmap> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Підтримуються лише PNG, JPEG і WebP.')
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