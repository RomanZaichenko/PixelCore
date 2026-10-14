import { create } from 'zustand';
import { createDocument } from '../core/document';
import type { DialogId } from '../types/Dialog';
import type { EditorDocument } from '../types/EditorDocument';
import type { DocumentBackground } from '../types/EditorDocument';

interface EditorState {
  documents: EditorDocument[];
  activeDocumentId: string | null;
  activeDialog: DialogId | null;

  addDocument: (
    title: string,
    width: number,
    height: number,
    background: DocumentBackground
  ) => void;
  openDocument: (doc: EditorDocument) => void;
  closeDocument: () => void;
  removeDocument: (id: string) => void;

  openDialog: (id: DialogId) => void;
  closeDialog: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  documents: [],
  activeDocumentId: null,
  activeDialog: null,

  addDocument: (title, width, height, background) =>
    set((s) => {
      const doc = createDocument(title, width, height, background);
      return {
        documents: [...s.documents, doc],
        activeDocumentId: doc.id,
      };
    }),

  openDocument: (doc) =>
    set((s) => ({
      documents: s.documents.some((d) => d.id === doc.id)
        ? s.documents
        : [...s.documents, doc],
      activeDocumentId: doc.id,
    })),

  closeDocument: () => set({ activeDocumentId: null }),

  removeDocument: (id) =>
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
      activeDocumentId: s.activeDocumentId === id ? null : s.activeDocumentId,
    })),

  openDialog: (id) => set({ activeDialog: id }),
  closeDialog: () => set({ activeDialog: null }),
}));
