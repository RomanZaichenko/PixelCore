import { create } from 'zustand'
import type { TransformBox } from '../types/Transform'

interface TransformState {
  box: TransformBox | null
  origin: TransformBox | null
  begin: (origin: TransformBox) => void
  setBox: (box: TransformBox) => void
  clear: () => void
}

export const useTransformStore = create<TransformState>((set) => ({
  box: null,
  origin: null,
  begin: (origin) => set({ box: origin, origin }),
  setBox: (box) => set({ box }),
  clear: () => set({ box: null, origin: null }),
}))