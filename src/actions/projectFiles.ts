import { createLayer } from '../core/document';
import { setLayerCanvas } from '../core/layerPixels';
import { requestRender } from '../core/render';
import {
  EXTENSION,
  downloadBlob,
  exportDocument,
  safeFileName,
  type ExportFormat,
} from '../io/exportImage';
import { PXC_EXTENSION, decodePxc, encodePxc } from '../io/pxcFormat';
import { selectActiveDocument, useEditorStore } from '../store/useEditorStore';
import type { EditorDocument } from '../types/EditorDocument';

function reportError(error: unknown): void {
  window.alert(error instanceof Error ? error.message : 'Невідома помилка.');
}

export function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    const finish = (file: File | null) => {
      input.remove();
      resolve(file);
    };
    input.addEventListener('change', () => finish(input.files?.[0] ?? null), {
      once: true,
    });
    input.addEventListener('cancel', () => finish(null), { once: true });
    document.body.append(input);
    input.click();
  });
}

export async function exportActiveDocument(
  format: ExportFormat
): Promise<void> {
  const doc = selectActiveDocument(useEditorStore.getState());
  if (!doc) return;
  try {
    const blob = await exportDocument(doc, { format });
    downloadBlob(blob, `${safeFileName(doc.title)}.${EXTENSION[format]}`);
  } catch (error) {
    reportError(error);
  }
}

export async function saveActiveProjectFile(): Promise<void> {
  const doc = selectActiveDocument(useEditorStore.getState());
  if (!doc) return;
  try {
    const blob = await encodePxc(doc);
    downloadBlob(blob, `${safeFileName(doc.title)}.${PXC_EXTENSION}`);
  } catch (error) {
    reportError(error);
  }
}

export async function importProjectFile(file: File): Promise<boolean> {
  try {
    const content = await decodePxc(file);
    const layers = content.layers.map((l) => {
      const layer = createLayer(l.name, l.fill);
      layer.visible = l.visible;
      setLayerCanvas(layer.id, l.canvas);
      return layer;
    });
    const doc: EditorDocument = {
      id: crypto.randomUUID(),
      title: content.title,
      width: content.width,
      height: content.height,
      background: content.background,
      layers,
      activeLayerId: layers[content.activeLayerIndex].id,
    };
    useEditorStore.getState().openDocument(doc);
    requestRender();
    return true;
  } catch (error) {
    reportError(error);
    return false;
  }
}

export async function pickAndImportProject(): Promise<void> {
  const file = await pickFile(`.${PXC_EXTENSION}`);
  if (file) await importProjectFile(file);
}
