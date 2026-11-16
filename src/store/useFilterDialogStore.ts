import { create } from 'zustand'
import type { AdjustFilter } from '../core/filters'

interface FilterDialogState {
  kind: AdjustFilter | null
  open: (kind: AdjustFilter) => void
  close: () => void
}

export const useFilterDialogStore = create<FilterDialogState>((set) => ({
  kind: null,
  open: (kind) => set({ kind }),
  close: () => set({ kind: null }),
}))