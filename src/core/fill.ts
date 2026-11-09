function parseHex(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function fill(
  canvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  color: string,
  tolerance: number,
): boolean {
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  const { width, height } = canvas
  const sx = Math.floor(startX)
  const sy = Math.floor(startY)
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return false

  const image = ctx.getImageData(0, 0, width, height)
  const data = image.data
  const [fr, fg, fb] = parseHex(color)

  const startOffset = (sy * width + sx) * 4
  const tr = data[startOffset]
  const tg = data[startOffset + 1]
  const tb = data[startOffset + 2]
  const ta = data[startOffset + 3]

  if (tolerance === 0 && ta === 255 && tr === fr && tg === fg && tb === fb) {
    return false
  }

  const matches = (p: number): boolean => {
    const i = p * 4
    return (
      Math.abs(data[i] - tr) <= tolerance &&
      Math.abs(data[i + 1] - tg) <= tolerance &&
      Math.abs(data[i + 2] - tb) <= tolerance &&
      Math.abs(data[i + 3] - ta) <= tolerance
    )
  }

  const visited = new Uint8Array(width * height)
  const stack: number[] = [sx, sy]

  while (stack.length > 0) {
    const y = stack.pop()!
    const x = stack.pop()!
    if (visited[y * width + x]) continue

    let left = x
    while (left >= 0 && !visited[y * width + left] && matches(y * width + left)) {
      left--
    }
    left++

    let spanUp = false
    let spanDown = false

    for (let i = left; i < width; i++) {
      const p = y * width + i
      if (visited[p] || !matches(p)) break

      visited[p] = 1
      const o = p * 4
      data[o] = fr
      data[o + 1] = fg
      data[o + 2] = fb
      data[o + 3] = 255

      if (y > 0) {
        const n = p - width
        const ok = !visited[n] && matches(n)
        if (ok && !spanUp) {
          stack.push(i, y - 1)
          spanUp = true
        } else if (!ok) {
          spanUp = false
        }
      }

      if (y < height - 1) {
        const n = p + width
        const ok = !visited[n] && matches(n)
        if (ok && !spanDown) {
          stack.push(i, y + 1)
          spanDown = true
        } else if (!ok) {
          spanDown = false
        }
      }
    }
  }

  ctx.putImageData(image, 0, 0)
  return true
}