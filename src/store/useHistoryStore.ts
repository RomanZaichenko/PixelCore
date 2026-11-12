import { create } from 'zustand';
import type { HistoryEntry } from '../types/History';

export const MAX_HISTORY = 100;

interface Stack {
  undo: HistoryEntry[];
  redo: HistoryEntry[];
}

interface HistoryState {
  stacks: Record<string, Stack>;
  record: (docId: string, entry: HistoryEntry) => void;
  step: (docId: string, direction: 'undo' | 'redo') => HistoryEntry | undefined;
  clear: (docId: string) => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  stacks: {},

  record: (docId, entry) =>
    set((s) => {
      const stack = s.stacks[docId] ?? { undo: [], redo: [] };
      const undo = [...stack.undo, entry].slice(-MAX_HISTORY);
      return { stacks: { ...s.stacks, [docId]: { undo, redo: [] } } };
    }),

  step: (docId, direction) => {
    const stack = get().stacks[docId];
    if (!stack) return undefined;

    const from = direction === 'undo' ? stack.undo : stack.redo;
    if (from.length === 0) return undefined;

    const entry = from[from.length - 1];
    const next: Stack =
      direction === 'undo'
        ? { undo: stack.undo.slice(0, -1), redo: [...stack.redo, entry] }
        : { undo: [...stack.undo, entry], redo: stack.redo.slice(0, -1) };

    set((s) => ({ stacks: { ...s.stacks, [docId]: next } }));
    return entry;
  },

  clear: (docId) =>
    set((s) => {
      if (!(docId in s.stacks)) return s;
      const stacks = { ...s.stacks };
      delete stacks[docId];
      return { stacks };
    }),
}));

export const selectCanUndo = (docId: string | null) => (s: HistoryState) =>
  docId !== null && (s.stacks[docId]?.undo.length ?? 0) > 0;

export const selectCanRedo = (docId: string | null) => (s: HistoryState) =>
  docId !== null && (s.stacks[docId]?.redo.length ?? 0) > 0;
