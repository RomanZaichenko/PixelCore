import { MAX_DOCUMENT_SIZE } from '../core/document';
import { fileBaseName, readImageFile } from '../io/importImage';
import { PXC_EXTENSION } from '../io/pxcFormat';
import { selectActiveDocument, useEditorStore } from '../store/useEditorStore';
import { importProjectFile } from './projectFiles';

const isPxc = (file: File) =>
  file.name.toLowerCase().endsWith(`.${PXC_EXTENSION}`);

export async function importImageFiles(files: File[]): Promise<void> {
  if (files.length === 0) return;

  const errors: string[] = [];

  for (const file of files) {
    try {
      if (isPxc(file)) {
        await importProjectFile(file);
        continue;
      }

      const image = await readImageFile(file);
      const name = fileBaseName(file.name);
      const store = useEditorStore.getState();

      if (!selectActiveDocument(store)) {
        store.addDocument(
          name,
          Math.min(image.width, MAX_DOCUMENT_SIZE),
          Math.min(image.height, MAX_DOCUMENT_SIZE),
          'transparent'
        );
      }
      useEditorStore.getState().addImageLayer(name, image);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Невідома помилка.';
      errors.push(files.length > 1 ? `${file.name}: ${message}` : message);
    }
  }

  if (errors.length > 0) window.alert(errors.join('\n'));
}
