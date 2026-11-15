import { del, get, set, update } from 'idb-keyval';
import { ensureLayerCanvas, setLayerCanvas } from '../core/layerPixels';
import type { EditorDocument } from '../types/EditorDocument';
import type { DocumentMeta } from '../types/DocumentMeta';
import { renderThumbnail } from './thumbnail';

const INDEX_KEY = 'projects:index';
const docKey = (id: string) => `projects:doc:${id}`;
const pixelsKey = (id: string) => `projects:pixels:${id}`;
const saveTokens = new Map<string, number>();
const inflight = new Set<Promise<void>>();

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Не вдалося закодувати шар.')),
      'image/png'
    );
  });
}

export async function listProjects(): Promise<DocumentMeta[]> {
  await Promise.allSettled([...inflight]);
  const list = (await get<DocumentMeta[]>(INDEX_KEY)) ?? [];
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveProject(doc: EditorDocument): Promise<void> {
  const token = (saveTokens.get(doc.id) ?? 0) + 1;
  saveTokens.set(doc.id, token);

  const layerBlobs = doc.layers.map((layer) =>
    canvasToBlob(ensureLayerCanvas(layer, doc.width, doc.height))
  );
  const thumbnail = renderThumbnail(doc);

  const task = (async () => {
    const blobs = await Promise.all(layerBlobs);
    if (saveTokens.get(doc.id) !== token) return;

    const pixels: Record<string, Blob> = {};
    doc.layers.forEach((layer, i) => {
      pixels[layer.id] = blobs[i];
    });
    const meta: DocumentMeta = {
      id: doc.id,
      title: doc.title,
      width: doc.width,
      height: doc.height,
      background: doc.background,
      updatedAt: Date.now(),
      thumbnail,
    };

    await set(docKey(doc.id), doc);
    if (saveTokens.get(doc.id) !== token) return;
    await update<DocumentMeta[]>(INDEX_KEY, (old = []) => [
      ...old.filter((p) => p.id !== doc.id),
      meta,
    ]);

    try {
      await set(pixelsKey(doc.id), pixels);
    } catch (error) {
      console.error('Не вдалося зберегти пікселі шарів', error);
    }
  })()
    .catch((error) => console.error('Не вдалося зберегти проєкт', error))
    .finally(() => inflight.delete(task));

  inflight.add(task);
  return task;
}

export async function loadProject(
  id: string
): Promise<EditorDocument | undefined> {
  const doc = await get<EditorDocument>(docKey(id));
  if (!doc) return undefined;

  const pixels = await get<Record<string, Blob>>(pixelsKey(id));
  if (pixels) {
    for (const layer of doc.layers) {
      const blob = pixels[layer.id];
      if (!blob) continue;
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = doc.width;
      canvas.height = doc.height;
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
      bitmap.close();
      setLayerCanvas(layer.id, canvas);
    }
  }
  return doc;
}

export async function deleteProject(id: string): Promise<void> {
  saveTokens.set(id, (saveTokens.get(id) ?? 0) + 1);
  await del(docKey(id));
  await del(pixelsKey(id));
  await update<DocumentMeta[]>(INDEX_KEY, (old = []) =>
    old.filter((p) => p.id !== id)
  );
}
