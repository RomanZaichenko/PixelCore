import { create } from 'zustand';
import { createDocument, createLayer, nextLayerName } from '../core/document';
import {
  disposeLayerCanvas,
  getLayerCanvas,
  setLayerCanvas,
  createCanvasFromImage,
} from '../core/layerPixels';
import { useHistoryStore } from './useHistoryStore';
import type { DialogId } from '../types/Dialog';
import type {
  DocumentBackground,
  EditorDocument,
} from '../types/EditorDocument';
import type Layer from '../types/Layer';
import type { ShapeMode, ToolType } from '../types/Tool'

export type MoveDirection = 'up' | 'down';

interface EditorState {
  documents: EditorDocument[];
  activeDocumentId: string | null;
  activeDialog: DialogId | null;
  tool: ToolType;
  color: string;
  brushSize: number;
  shapeMode: ShapeMode;
  tolerance: number;
  

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
  addImageLayer: (name: string, image: ImageBitmap) => void;

  setTool: (tool: ToolType) => void;
  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setShapeMode: (mode: ShapeMode) => void;
  setTolerance: (tolerance: number) => void;

}

export const selectActiveDocument = (s: EditorState) =>
  s.documents.find((d) => d.id === s.activeDocumentId);

function insertLayerAboveActive(
  doc: EditorDocument,
  layer: Layer
): EditorDocument {
  const activeIndex = doc.layers.findIndex((l) => l.id === doc.activeLayerId);
  const at = activeIndex === -1 ? doc.layers.length : activeIndex + 1;
  const layers = [...doc.layers];
  layers.splice(at, 0, layer);
  return { ...doc, layers, activeLayerId: layer.id };
}

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

function recorded(get: () => EditorState, change: () => void): void {
  const before = selectActiveDocument(get());
  if (!before) {
    change();
    return;
  }

  const beforeCanvases = new Map<string, HTMLCanvasElement>();
  for (const layer of before.layers) {
    const canvas = getLayerCanvas(layer.id);
    if (canvas) beforeCanvases.set(layer.id, canvas);
  }

  change();

  const after = get().documents.find((d) => d.id === before.id);
  if (
    !after ||
    (after.layers === before.layers &&
      after.activeLayerId === before.activeLayerId)
  ) {
    return;
  }

  const beforeIds = new Set(before.layers.map((l) => l.id));
  const afterIds = new Set(after.layers.map((l) => l.id));
  const canvases = new Map<string, HTMLCanvasElement>();

  for (const layer of before.layers) {
    const canvas = beforeCanvases.get(layer.id);
    if (!afterIds.has(layer.id) && canvas) canvases.set(layer.id, canvas);
  }
  for (const layer of after.layers) {
    const canvas = getLayerCanvas(layer.id);
    if (!beforeIds.has(layer.id) && canvas) canvases.set(layer.id, canvas);
  }

  useHistoryStore.getState().record(before.id, {
    kind: 'structure',
    before: { layers: before.layers, activeLayerId: before.activeLayerId },
    after: { layers: after.layers, activeLayerId: after.activeLayerId },
    canvases,
  });
}

export const useEditorStore = create<EditorState>((set, get) => ({
  documents: [],
  activeDocumentId: null,
  activeDialog: null,
  tool: 'brush',
  color: '#1f1f1f',
  brushSize: 12,
  shapeMode: 'fill',
  tolerance: 32,
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setBrushSize: (brushSize) => set({ brushSize }),
  setShapeMode: (shapeMode) => set({ shapeMode }),
  setTolerance: (tolerance) => set({ tolerance }),

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
    useHistoryStore.getState().clear(id);
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
      activeDocumentId: s.activeDocumentId === id ? null : s.activeDocumentId,
    }));
  },

  addLayer: () =>
    recorded(get, () =>
      set((s) =>
        updateActive(s, (doc) =>
          insertLayerAboveActive(doc, createLayer(nextLayerName(doc.layers)))
        )
      )
    ),

  addImageLayer: (name, image) => {
    const doc = selectActiveDocument(get());
    if (!doc) {
      image.close();
      return;
    }
    const layer = createLayer(name);
    recorded(get, () => {
      setLayerCanvas(
        layer.id,
        createCanvasFromImage(image, doc.width, doc.height)
      );
      image.close();
      set((s) => updateActive(s, (d) => insertLayerAboveActive(d, layer)));
    });
  },

  removeLayer: (id) => {
    const doc = selectActiveDocument(get());
    if (!doc || doc.layers.length <= 1) return;
    recorded(get, () => {
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
    });
  },

  setActiveLayer: (id) =>
    set((s) => updateActive(s, (d) => ({ ...d, activeLayerId: id }))),

  toggleLayerVisible: (id) =>
    recorded(get, () =>
      set((s) =>
        updateActive(s, (d) => ({
          ...d,
          layers: d.layers.map((l) =>
            l.id === id ? { ...l, visible: !l.visible } : l
          ),
        }))
      )
    ),

  renameLayer: (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    recorded(get, () =>
      set((s) =>
        updateActive(s, (d) => {
          const layer = d.layers.find((l) => l.id === id);
          if (!layer || layer.name === trimmed) return d;
          return {
            ...d,
            layers: d.layers.map((l) =>
              l.id === id ? { ...l, name: trimmed } : l
            ),
          };
        })
      )
    );
  },

  moveLayer: (id, direction) =>
    recorded(get, () =>
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
      )
    ),

  openDialog: (id) => set({ activeDialog: id }),
  closeDialog: () => set({ activeDialog: null }),
  reorderLayer: (activeId, overId) => {
    recorded(get, () =>
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
      )
    );
  },
}));
