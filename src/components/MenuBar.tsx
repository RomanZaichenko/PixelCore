import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import type { Menu } from '../types/Menu';
import MenuDropdown from './MenuDropdown';

export default function MenuBar() {
  const openDialog = useEditorStore((s) => s.openDialog);
  const closeDocument = useEditorStore((s) => s.closeDocument);
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
        { id: 'home', label: 'На головну', onSelect: closeDocument },
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
