import { useEffect, useRef, useState } from 'react';
import { selectActiveDocument, useEditorStore } from '../store/useEditorStore';
import type { Menu } from '../types/Menu';
import MenuDropdown from './MenuDropdown';

import { redo, undo } from '../actions/history';
import { applyFilterToActiveLayer, openFilterDialog } from '../actions/filters';
import { importImageFiles } from '../actions/importImages';
import { pickImageFile } from '../io/importImage';
import {
  exportActiveDocument,
  pickAndImportProject,
  saveActiveProjectFile,
} from '../actions/projectFiles';
import {
  selectCanRedo,
  selectCanUndo,
  useHistoryStore,
} from '../store/useHistoryStore';

export default function MenuBar() {
  const openDialog = useEditorStore((s) => s.openDialog);
  const closeDocument = useEditorStore((s) => s.closeDocument);
  const activeDocumentId = useEditorStore((s) => s.activeDocumentId);
  const canUndo = useHistoryStore(selectCanUndo(activeDocumentId));
  const canRedo = useHistoryStore(selectCanRedo(activeDocumentId));
  const canFilter = useEditorStore((s) => {
    const doc = selectActiveDocument(s);
    return !!doc?.layers.find((l) => l.id === doc.activeLayerId)?.visible;
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  const menus: Menu[] = [
    {
      id: 'file',
      label: 'Файл',
      items: [
        {
          id: 'new',
          label: 'Новий документ…',
          onSelect: () => openDialog('newDocument'),
        },
        {
          id: 'import',
          label: 'Імпортувати зображення (PNG, JPG, SVG)…',
          onSelect: () => {
            void pickImageFile().then((file) => {
              if (file) void importImageFiles([file]);
            });
          },
        },
        {
          id: 'open-pxc',
          label: 'Відкрити проєкт (.pxc)…',
          onSelect: () => void pickAndImportProject(),
        },
        {
          id: 'save-pxc',
          label: 'Зберегти проєкт (.pxc)',
          shortcut: 'Ctrl+S',
          onSelect: () => void saveActiveProjectFile(),
        },
        {
          id: 'export-png',
          label: 'Експорт як PNG',
          onSelect: () => void exportActiveDocument('png'),
        },
        {
          id: 'export-jpg',
          label: 'Експорт як JPG',
          onSelect: () => void exportActiveDocument('jpeg'),
        },
        {
          id: 'export-webp',
          label: 'Експорт як WebP',
          onSelect: () => void exportActiveDocument('webp'),
        },
        {
          id: 'export-svg',
          label: 'Експорт як SVG',
          onSelect: () => void exportActiveDocument('svg'),
        },
        { id: 'home', label: 'На головну', onSelect: closeDocument },
      ],
    },
    {
      id: 'edit',
      label: 'Редагування',
      items: [
        {
          id: 'undo',
          label: 'Скасувати',
          shortcut: 'Ctrl+Z',
          disabled: !canUndo,
          onSelect: undo,
        },
        {
          id: 'redo',
          label: 'Повторити',
          shortcut: 'Ctrl+Y',
          disabled: !canRedo,
          onSelect: redo,
        },
      ],
    },
    {
      id: 'filters',
      label: 'Фільтри',
      items: [
        {
          id: 'filter-grayscale',
          label: 'Чорно-білий',
          disabled: !canFilter,
          onSelect: () => applyFilterToActiveLayer({ kind: 'grayscale' }),
        },
        {
          id: 'filter-invert',
          label: 'Інверсія',
          disabled: !canFilter,
          onSelect: () => applyFilterToActiveLayer({ kind: 'invert' }),
        },
        {
          id: 'filter-sepia',
          label: 'Сепія',
          disabled: !canFilter,
          onSelect: () => applyFilterToActiveLayer({ kind: 'sepia' }),
        },
        {
          id: 'filter-brightness',
          label: 'Яскравість…',
          disabled: !canFilter,
          onSelect: () => openFilterDialog('brightness'),
        },
        {
          id: 'filter-contrast',
          label: 'Контраст…',
          disabled: !canFilter,
          onSelect: () => openFilterDialog('contrast'),
        },
        {
          id: 'filter-saturation',
          label: 'Насиченість…',
          disabled: !canFilter,
          onSelect: () => openFilterDialog('saturation'),
        },
        {
          id: 'filter-blur',
          label: 'Розмиття…',
          disabled: !canFilter,
          onSelect: () => openFilterDialog('blur'),
        },
      ],
    },
  ];

  useEffect(() => {
    if (openId === null) return;

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpenId(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenId(null);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openId]);

  return (
    <header
      ref={rootRef}
      className="relative z-20 col-span-3 col-start-1 row-start-1 flex items-center gap-1 border-b border-neutral-700 bg-neutral-800 px-2 text-sm"
    >
      {menus.map((menu) => (
        <MenuDropdown
          key={menu.id}
          menu={menu}
          open={openId === menu.id}
          onToggle={() => setOpenId(openId === menu.id ? null : menu.id)}
          onHover={() => openId !== null && setOpenId(menu.id)}
          onSelect={(itemId) => {
            setOpenId(null);
            menu.items.find((i) => i.id === itemId)?.onSelect();
          }}
        />
      ))}
    </header>
  );
}
