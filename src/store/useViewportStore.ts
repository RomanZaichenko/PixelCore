import { create } from 'zustand'

const MIN_ZOOM = 0.05
const MAX_ZOOM = 32

interface ViewportState {
  docId: string | null
  zoom: number
  offsetX: number
  offsetY: number
  zoomAt: (cx: number, cy: number, factor: number) => void
  panBy: (dx: number, dy: number) => void
  setView: (docId: string, zoom: number, offsetX: number, offsetY: number) => void
}

export const useViewportStore = create<ViewportState>((set) => ({
  docId: null,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,

  zoomAt: (cx, cy, factor) =>
    set((s) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s.zoom * factor))
      const k = next / s.zoom
      return {
        zoom: next,
        offsetX: cx - (cx - s.offsetX) * k,
        offsetY: cy - (cy - s.offsetY) * k,
      }
    }),

  panBy: (dx, dy) =>
    set((s) => ({ offsetX: s.offsetX + dx, offsetY: s.offsetY + dy })),

  setView: (docId, zoom, offsetX, offsetY) =>
    set({ docId, zoom, offsetX, offsetY }),
}))