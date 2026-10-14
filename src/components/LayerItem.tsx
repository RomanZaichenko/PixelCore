import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type Layer from '../types/Layer'

interface NameInputProps {
  initial: string
  onCommit: (name: string) => void
  onCancel: () => void
}

function NameInput({ initial, onCommit, onCancel }: NameInputProps) {
  const [value, setValue] = useState(initial)
  const inputRef = useRef<HTMLInputElement>(null)
  const finished = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  function commit() {
    if (finished.current) return
    finished.current = true
    onCommit(value)
  }

  function cancel() {
    if (finished.current) return
    finished.current = true
    onCancel()
  }

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') cancel()
      }}
      className="min-w-0 flex-1 rounded border border-sky-400 bg-neutral-900 px-1 py-0.5 text-sm outline-none"
    />
  )
}

interface Props {
  layer: Layer
  active: boolean
  editing: boolean
  onSelect: () => void
  onToggleVisible: () => void
  onStartEdit: () => void
  onCommitName: (name: string) => void
  onCancelEdit: () => void
}

export default function LayerItem({
  layer,
  active,
  editing,
  onSelect,
  onToggleVisible,
  onStartEdit,
  onCommitName,
  onCancelEdit,
}: Props) {
  return (
    <li
      className={`flex items-center gap-1 border-l-2 px-1 py-1 ${
        active
          ? 'border-sky-400 bg-neutral-700'
          : 'border-transparent hover:bg-neutral-700/50'
      }`}
    >
      <button
        type="button"
        aria-label={layer.visible ? 'Сховати шар' : 'Показати шар'}
        aria-pressed={layer.visible}
        onClick={onToggleVisible}
        className="grid h-7 w-7 shrink-0 place-items-center rounded text-neutral-400 hover:text-neutral-100"
      >
        {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>

      {editing ? (
        <NameInput
          initial={layer.name}
          onCommit={onCommitName}
          onCancel={onCancelEdit}
        />
      ) : (
        <button
          type="button"
          title="Двічі клікни, щоб перейменувати"
          onClick={onSelect}
          onDoubleClick={onStartEdit}
          className={`min-w-0 flex-1 truncate rounded px-1 py-1 text-left text-sm ${
            layer.visible ? '' : 'opacity-50'
          }`}
        >
          {layer.name}
        </button>
      )}
    </li>
  )
}