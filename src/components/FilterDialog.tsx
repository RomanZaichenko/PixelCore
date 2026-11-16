import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  applyFilterToActiveLayer,
  clearFilterPreview,
  showFilterPreview,
} from '../actions/filters';
import {
  ADJUST_RANGES,
  FILTER_LABELS,
  type AdjustFilter,
} from '../core/filters';
import { useFilterDialogStore } from '../store/useFilterDialogStore';

function FilterForm({
  kind,
  onDone,
}: {
  kind: AdjustFilter;
  onDone: () => void;
}) {
  const range = ADJUST_RANGES[kind];
  const [amount, setAmount] = useState(range.default);
  const [livePreview, setLivePreview] = useState(true);

  useEffect(() => {
    if (!livePreview) {
      clearFilterPreview();
      return;
    }
    const id = requestAnimationFrame(() => showFilterPreview({ kind, amount }));
    return () => cancelAnimationFrame(id);
  }, [kind, amount, livePreview]);

  useEffect(() => clearFilterPreview, []);

  function handleChange(value: number) {
    if (Number.isNaN(value)) return;
    setAmount(Math.min(range.max, Math.max(range.min, value)));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    applyFilterToActiveLayer({ kind, amount });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-96 flex-col gap-4 p-5">
      <h2 className="text-base font-semibold">{FILTER_LABELS[kind]}</h2>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={range.step}
          value={amount}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="flex-1 accent-sky-500"
          aria-label={FILTER_LABELS[kind]}
        />
        <label className="flex items-center gap-1 text-sm">
          <input
            type="number"
            min={range.min}
            max={range.max}
            step={range.step}
            value={amount}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="w-16 rounded border border-neutral-600 bg-neutral-900 px-2 py-1 outline-none focus:border-sky-400"
          />
          <span className="text-neutral-400">{range.unit}</span>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={livePreview}
          onChange={(e) => setLivePreview(e.target.checked)}
          className="accent-sky-500"
        />
        Попередній перегляд
      </label>

      <div className="flex justify-between gap-2">
        <button
          type="button"
          className="rounded border border-neutral-600 px-3 py-1.5 text-sm hover:border-neutral-400"
          onClick={() => setAmount(range.default)}
        >
          Скинути
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border border-neutral-600 px-3 py-1.5 text-sm hover:border-neutral-400"
            onClick={onDone}
          >
            Скасувати
          </button>
          <button
            type="submit"
            className="rounded bg-sky-500 px-3 py-1.5 text-sm font-medium text-neutral-950"
          >
            Застосувати
          </button>
        </div>
      </div>
    </form>
  );
}

export default function FilterDialog() {
  const kind = useFilterDialogStore((s) => s.kind);
  const close = useFilterDialogStore((s) => s.close);
  const ref = useRef<HTMLDialogElement>(null);
  const open = kind !== null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={close}
      className="m-auto rounded-lg border border-neutral-700 bg-neutral-800 p-0 text-neutral-200 backdrop:bg-black/60"
    >
      {kind && <FilterForm key={kind} kind={kind} onDone={close} />}
    </dialog>
  );
}
