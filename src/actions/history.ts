import {
  disposeLayerCanvas,
  ensureLayerCanvas,
  getLayerCanvas,
  setLayerCanvas,
} from '../core/layerPixels';
import { isDrawing, restoreRegion } from '../core/pixelHistory';
import { requestRender } from '../core/render';
import { selectActiveDocument, useEditorStore } from '../store/useEditorStore';
import { useHistoryStore } from '../store/useHistoryStore';
import type {
  HistoryEntry,
  LayerSnapshot,
  StructureEntry,
} from '../types/History';

function applyStructure(
  docId: string,
  entry: StructureEntry,
  target: LayerSnapshot
): void {
  const doc = useEditorStore.getState().documents.find((d) => d.id === docId);
  if (!doc) return;

  const currentIds = new Set(doc.layers.map((l) => l.id));
  const targetIds = new Set(target.layers.map((l) => l.id));

  for (const layer of doc.layers) {
    if (targetIds.has(layer.id)) continue;
    const canvas = getLayerCanvas(layer.id);
    if (canvas) entry.canvases.set(layer.id, canvas);
    disposeLayerCanvas(layer.id);
  }

  for (const layer of target.layers) {
    if (currentIds.has(layer.id)) continue;
    const canvas = entry.canvases.get(layer.id);
    if (canvas) setLayerCanvas(layer.id, canvas);
  }

  useEditorStore.setState((s) => ({
    documents: s.documents.map((d) =>
      d.id === docId
        ? { ...d, layers: target.layers, activeLayerId: target.activeLayerId }
        : d
    ),
  }));
}

function applyEntry(
  docId: string,
  entry: HistoryEntry,
  direction: 'undo' | 'redo'
): void {
  if (entry.kind === 'structure') {
    applyStructure(
      docId,
      entry,
      direction === 'undo' ? entry.before : entry.after
    );
    return;
  }

  const doc = useEditorStore.getState().documents.find((d) => d.id === docId);
  const layer = doc?.layers.find((l) => l.id === entry.layerId);
  if (!doc || !layer) return;

  const canvas = ensureLayerCanvas(layer, doc.width, doc.height);
  restoreRegion(
    canvas,
    entry.rect,
    direction === 'undo' ? entry.before : entry.after
  );
  requestRender();
}

function run(direction: 'undo' | 'redo'): void {
  if (isDrawing()) return;
  const doc = selectActiveDocument(useEditorStore.getState());
  if (!doc) return;

  const entry = useHistoryStore.getState().step(doc.id, direction);
  if (entry) applyEntry(doc.id, entry, direction);
}

export const undo = () => run('undo');
export const redo = () => run('redo');
