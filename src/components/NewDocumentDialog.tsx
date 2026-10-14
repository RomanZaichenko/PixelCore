import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  DEFAULT_DOCUMENT_SIZE,
  DOCUMENT_PRESETS,
  MAX_DOCUMENT_SIZE,
  MIN_DOCUMENT_SIZE,
  isValidSize,
} from '../core/document'
import { useEditorStore } from '../store/useEditorStore'
import type { DocumentBackground } from '../types/EditorDocument'

const DEFAULT_TITLE = 'Без назви'

const BACKGROUNDS: { value: DocumentBackground; label: string }[] = [
  { value: 'white', label: 'Білий' },
  { value: 'transparent', label: 'Прозорий' },
]

const inputClass =
  'w-full rounded border border-neutral-600 bg-neutral-900 px-2 py-1.5 outline-none focus:border-sky-400'

function NewDocumentForm({ onDone }: { onDone: () => void }) {
  const addDocument = useEditorStore((s) => s.addDocument)
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [width, setWidth] = useState(DEFAULT_DOCUMENT_SIZE.width)
  const [height, setHeight] = useState(DEFAULT_DOCUMENT_SIZE.height)
  const [background, setBackground] = useState<DocumentBackground>('white')

  const valid = isValidSize(width) && isValidSize(height)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return
    addDocument(title.trim() || DEFAULT_TITLE, width, height, background)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-96 flex-col gap-4 p-5">
      <h2 className="text-base font-semibold">Новий документ</h2>

      <label className="flex flex-col gap-1 text-sm">
        Назва
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {DOCUMENT_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="rounded border border-neutral-600 px-2 py-1 text-xs hover:border-neutral-400"
            onClick={() => {
              setWidth(p.width)
              setHeight(p.height)
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Ширина, px
          <input
            type="number"
            min={MIN_DOCUMENT_SIZE}
            max={MAX_DOCUMENT_SIZE}
            className={inputClass}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Висота, px
          <input
            type="number"
            min={MIN_DOCUMENT_SIZE}
            max={MAX_DOCUMENT_SIZE}
            className={inputClass}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1">Фон</legend>
        <div className="flex gap-4">
          {BACKGROUNDS.map((b) => (
            <label key={b.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="background"
                value={b.value}
                checked={background === b.value}
                onChange={() => setBackground(b.value)}
                className="accent-sky-500"
              />
              {b.label}
            </label>
          ))}
        </div>
      </fieldset>

      {!valid && (
        <p className="text-xs text-red-400">
          Розмір має бути цілим числом від {MIN_DOCUMENT_SIZE} до{' '}
          {MAX_DOCUMENT_SIZE}.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded border border-neutral-600 px-3 py-1.5 text-sm hover:border-neutral-400"
          onClick={onDone}
        >
          Скасувати
        </button>
        <button
          type="submit"
          disabled={!valid}
          className="rounded bg-sky-500 px-3 py-1.5 text-sm font-medium text-neutral-950 disabled:opacity-40"
        >
          Створити
        </button>
      </div>
    </form>
  )
}

export default function NewDocumentDialog() {
  const open = useEditorStore((s) => s.activeDialog === 'newDocument')
  const closeDialog = useEditorStore((s) => s.closeDialog)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={closeDialog}
      className="m-auto rounded-lg border border-neutral-700 bg-neutral-800 p-0 text-neutral-200 backdrop:bg-black/60"
    >
      {open && <NewDocumentForm onDone={closeDialog} />}
    </dialog>
  )
}