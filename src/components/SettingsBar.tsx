import { useEditorStore } from '../store/useEditorStore'
import type { ShapeMode, ToolType } from '../types/Tool'
import TransformControls from './TransformControls'

interface Controls {
  color: boolean
  size: boolean
  mode: boolean
  tolerance: boolean
}

const brushLike: Controls = {
  color: true,
  size: true,
  mode: false,
  tolerance: false,
}
const filledShape: Controls = {
  color: true,
  size: true,
  mode: true,
  tolerance: false,
}

const CONTROLS: Record<ToolType, Controls> = {
  brush: brushLike,
  eraser: { ...brushLike, color: false },
  fill: { color: true, size: false, mode: false, tolerance: true },
  picker: { color: true, size: false, mode: false, tolerance: false },
  line: brushLike,
  rectangle: filledShape,
  ellipse: filledShape,
  triangle: filledShape,
  transform: { color: false, size: false, mode: false, tolerance: false },
}

const MODES: { value: ShapeMode; label: string }[] = [
  { value: 'fill', label: 'Заливка' },
  { value: 'stroke', label: 'Обведення' },
]

export default function SettingsBar() {
  const tool = useEditorStore((s) => s.tool)
  const color = useEditorStore((s) => s.color)
  const brushSize = useEditorStore((s) => s.brushSize)
  const shapeMode = useEditorStore((s) => s.shapeMode)
  const tolerance = useEditorStore((s) => s.tolerance)
  const setColor = useEditorStore((s) => s.setColor)
  const setBrushSize = useEditorStore((s) => s.setBrushSize)
  const setShapeMode = useEditorStore((s) => s.setShapeMode)
  const setTolerance = useEditorStore((s) => s.setTolerance)

  const controls = CONTROLS[tool]
  const showSize = controls.size && (!controls.mode || shapeMode === 'stroke')
  const sizeLabel = tool === 'brush' || tool === 'eraser' ? 'Розмір' : 'Товщина'

  return (
    <div className="col-span-3 col-start-1 row-start-2 flex items-center gap-6 border-b border-neutral-700 bg-neutral-800 px-3 text-sm">
      {tool === 'transform' && <TransformControls />}
      {controls.color && (
        <label className="flex items-center gap-2">
          Колір
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-6 w-10 cursor-pointer rounded border border-neutral-600 bg-transparent p-0"
          />
        </label>
      )}

      {controls.mode && (
        <div role="group" aria-label="Режим фігури" className="flex gap-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={shapeMode === m.value}
              onClick={() => setShapeMode(m.value)}
              className="rounded border border-neutral-600 px-2 py-1 text-xs hover:border-neutral-400 aria-pressed:border-sky-500 aria-pressed:bg-sky-500 aria-pressed:text-neutral-950"
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {showSize && (
        <label className="flex items-center gap-2">
          {sizeLabel}
          <input
            type="range"
            min={1}
            max={200}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-40 accent-sky-500"
          />
          <output className="w-14 tabular-nums">{brushSize} px</output>
        </label>
      )}

      {controls.tolerance && (
        <label className="flex items-center gap-2">
          Допуск
          <input
            type="range"
            min={0}
            max={255}
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            className="w-40 accent-sky-500"
          />
          <output className="w-10 tabular-nums">{tolerance}</output>
        </label>
      )}
    </div>
  )
}