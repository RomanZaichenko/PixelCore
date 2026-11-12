import { commitTransform } from '../actions/transform'
import { resetTransform } from '../core/transform'
import { sameBox } from '../core/transformMath'
import { useTransformStore } from '../store/useTransformStore'

const button =
  'rounded border border-neutral-600 px-2 py-1 text-xs hover:border-neutral-400 disabled:opacity-40 disabled:hover:border-neutral-600'

export default function TransformControls() {
  const box = useTransformStore((s) => s.box)
  const origin = useTransformStore((s) => s.origin)

  if (!box || !origin) {
    return (
      <p className="text-neutral-400">
        Шар порожній або прихований, трансформувати нічого.
      </p>
    )
  }

  const dirty = !sameBox(box, origin)
  const degrees = ((((box.rotation * 180) / Math.PI) % 360) + 360) % 360

  return (
    <>
      <output className="tabular-nums">
        {Math.round(box.width)} × {Math.round(box.height)} px
      </output>
      <output className="tabular-nums">{Math.round(degrees)}°</output>
      <div className="flex gap-1">
        <button
          type="button"
          className={button}
          disabled={!dirty}
          onClick={commitTransform}
          title="Enter"
        >
          Застосувати
        </button>
        <button
          type="button"
          className={button}
          disabled={!dirty}
          onClick={resetTransform}
          title="Esc"
        >
          Скинути
        </button>
      </div>
      <span className="text-xs text-neutral-400">
        Shift — пропорції та кут 15°, Alt — від центру
      </span>
    </>
  )
}