let renderer: (() => void) | null = null
let scheduled = false

export function setRenderer(fn: (() => void) | null): void {
  renderer = fn
}

export function requestRender(): void {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(() => {
    scheduled = false
    renderer?.()
  })
}