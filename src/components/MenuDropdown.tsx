import type { Menu } from '../types/Menu'

interface Props {
  menu: Menu
  open: boolean
  onToggle: () => void
  onHover: () => void
  onSelect: (itemId: string) => void
}

export default function MenuDropdown({
  menu,
  open,
  onToggle,
  onHover,
  onSelect,
}: Props) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
        onPointerEnter={onHover}
        className="rounded px-3 py-1 hover:bg-neutral-700 aria-expanded:bg-neutral-700"
      >
        {menu.label}
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute left-0 top-full z-30 mt-1 min-w-56 rounded-md border border-neutral-700 bg-neutral-800 py-1 shadow-xl"
        >
          {menu.items.map((item) => (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => onSelect(item.id)}
                className="flex w-full items-center justify-between gap-6 px-3 py-1.5 text-left hover:bg-neutral-700 disabled:cursor-default disabled:text-neutral-500 disabled:hover:bg-transparent"
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-neutral-500">
                    {item.shortcut}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}