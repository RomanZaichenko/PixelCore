import { create } from 'zustand';
import { createDocument, createLayer, nextLayerName } from '../core/document';
import { disposeLayerCanvas } from '../core/layerPixels';
import type { DialogId } from '../types/Dialog';
import type {
  DocumentBackground,
  EditorDocument,
} from '../types/EditorDocument';

export type MoveDirection = 'up' | 'down';

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

  addLayer: () => void;
  removeLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  toggleLayerVisible: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  moveLayer: (id: string, direction: MoveDirection) => void;

  openDialog: (id: DialogId) => void;
  closeDialog: () => void;
  reorderLayer: (activeId: string, overId: string) => void;
}

export const selectActiveDocument = (s: EditorState) =>
  s.documents.find((d) => d.id === s.activeDocumentId);

function updateActive(
  s: EditorState,
  fn: (doc: EditorDocument) => EditorDocument
): Partial<EditorState> {
  return {
    documents: s.documents.map((d) =>
      d.id === s.activeDocumentId ? fn(d) : d
    ),
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
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

  removeDocument: (id) => {
    const doc = get().documents.find((d) => d.id === id);
    doc?.layers.forEach((l) => disposeLayerCanvas(l.id));
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
      activeDocumentId: s.activeDocumentId === id ? null : s.activeDocumentId,
    }));
  },

  addLayer: () =>
    set((s) =>
      updateActive(s, (doc) => {
        const layer = createLayer(nextLayerName(doc.layers));
        const activeIndex = doc.layers.findIndex(
          (l) => l.id === doc.activeLayerId
        );
        const at = activeIndex === -1 ? doc.layers.length : activeIndex + 1;
        const layers = [...doc.layers];
        layers.splice(at, 0, layer);
        return { ...doc, layers, activeLayerId: layer.id };
      })
    ),

  removeLayer: (id) => {
    const doc = selectActiveDocument(get());
    if (!doc || doc.layers.length <= 1) return;
    set((s) =>
      updateActive(s, (d) => {
        const index = d.layers.findIndex((l) => l.id === id);
        if (index === -1) return d;
        const layers = d.layers.filter((l) => l.id !== id);
        const activeLayerId =
          d.activeLayerId === id
            ? layers[Math.min(index, layers.length - 1)].id
            : d.activeLayerId;
        return { ...d, layers, activeLayerId };
      })
    );
    disposeLayerCanvas(id);
  },

  setActiveLayer: (id) =>
    set((s) => updateActive(s, (d) => ({ ...d, activeLayerId: id }))),

  toggleLayerVisible: (id) =>
    set((s) =>
      updateActive(s, (d) => ({
        ...d,
        layers: d.layers.map((l) =>
          l.id === id ? { ...l, visible: !l.visible } : l
        ),
      }))
    ),

  renameLayer: (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((s) =>
      updateActive(s, (d) => ({
        ...d,
        layers: d.layers.map((l) =>
          l.id === id ? { ...l, name: trimmed } : l
        ),
      }))
    );
  },

  moveLayer: (id, direction) =>
    set((s) =>
      updateActive(s, (d) => {
        const from = d.layers.findIndex((l) => l.id === id);
        const to = direction === 'up' ? from + 1 : from - 1;
        if (from === -1 || to < 0 || to >= d.layers.length) return d;
        const layers = [...d.layers];
        const moved = layers[from];
        layers[from] = layers[to];
        layers[to] = moved;
        return { ...d, layers };
      })
    ),

  openDialog: (id) => set({ activeDialog: id }),
  closeDialog: () => set({ activeDialog: null }),
  reorderLayer: (activeId, overId) => {
    set((s) =>
      updateActive(s, (d) => {
        const from = d.layers.findIndex((l) => l.id === activeId);
        const to = d.layers.findIndex((l) => l.id === overId);
        if (from === -1 || to === -1 || from === to) return d;
        const layers = [...d.layers];
        const [moved] = layers.splice(from, 1);
        layers.splice(to, 0, moved);
        return { ...d, layers };
      })
    );
  },
}));
