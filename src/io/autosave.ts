import { useEditorStore } from '../store/useEditorStore';
import { useHistoryStore } from '../store/useHistoryStore';
import type { EditorDocument } from '../types/EditorDocument';
import { saveProject } from './projectStorage';

const activeDocument = () => {
  const state = useEditorStore.getState();
  return state.documents.find((d) => d.id === state.activeDocumentId);
};

export function startAutosave(delay = 800) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: EditorDocument | undefined;
  let last: EditorDocument | undefined;

  const flush = () => {
    clearTimeout(timer);
    const doc = pending;
    pending = undefined;
    if (doc) void saveProject(doc);
  };

  const schedule = (doc: EditorDocument) => {
    pending = doc;
    clearTimeout(timer);
    timer = setTimeout(flush, delay);
  };

  const unsubscribeEditor = useEditorStore.subscribe(() => {
    const doc = activeDocument();
    if (!doc) {
      flush();
      return;
    }
    if (doc === last) return;
    last = doc;
    schedule(doc);
  });

  const unsubscribeHistory = useHistoryStore.subscribe(() => {
    const doc = activeDocument();
    if (doc) schedule(doc);
  });

  const onHide = () => {
    if (document.visibilityState === 'hidden') flush();
  };
  document.addEventListener('visibilitychange', onHide);

  return () => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', onHide);
    unsubscribeEditor();
    unsubscribeHistory();
  };
}
