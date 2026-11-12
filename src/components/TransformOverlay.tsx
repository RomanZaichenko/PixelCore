import {
  HANDLES,
  ROTATE_OFFSET_PX,
  handlePoint,
  toWorld,
} from '../core/transformMath'
import { useTransformStore } from '../store/useTransformStore'
import { useViewportStore } from '../store/useViewportStore'
import type Point from '../types/Point'

const HANDLE_SIZE = 9
const ACCENT = '#38bdf8'

function resizeCursor(hx: number, hy: number, rotation: number): string {
  const angle = Math.atan2(hy, hx) + rotation
  const deg = ((((angle * 180) / Math.PI) % 180) + 180) % 180
  const sector = Math.round(deg / 45) % 4
  return ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize'][sector]
}

export default function TransformOverlay() {
  const box = useTransformStore((s) => s.box)
  const zoom = useViewportStore((s) => s.zoom)
  const offsetX = useViewportStore((s) => s.offsetX)
  const offsetY = useViewportStore((s) => s.offsetY)

  if (!box) return null

  const toScreen = (p: Point): Point => ({
    x: offsetX + p.x * zoom,
    y: offsetY + p.y * zoom,
  })

  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([hx, hy]) => toScreen(handlePoint(box, hx, hy)))
  const outline = corners.map((c) => `${c.x},${c.y}`).join(' ')

  const top = toScreen(handlePoint(box, 0, -1))
  const knob = toScreen(
    toWorld(box, { x: 0, y: -box.height / 2 - ROTATE_OFFSET_PX / zoom }),
  )
  const degrees = (box.rotation * 180) / Math.PI

  return (
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible">
      <polygon
        points={outline}
        fill="transparent"
        stroke={ACCENT}
        strokeWidth={1}
        style={{ pointerEvents: 'all', cursor: 'move' }}
      />
      <line
        x1={top.x}
        y1={top.y}
        x2={knob.x}
        y2={knob.y}
        stroke={ACCENT}
        strokeWidth={1}
      />
      <circle
        cx={knob.x}
        cy={knob.y}
        r={5}
        fill="white"
        stroke={ACCENT}
        strokeWidth={1.5}
        style={{ pointerEvents: 'all', cursor: 'grab' }}
      />
      {HANDLES.map((h) => {
        const p = toScreen(handlePoint(box, h.hx, h.hy))
        return (
          <rect
            key={h.id}
            x={p.x - HANDLE_SIZE / 2}
            y={p.y - HANDLE_SIZE / 2}
            width={HANDLE_SIZE}
            height={HANDLE_SIZE}
            transform={`rotate(${degrees} ${p.x} ${p.y})`}
            fill="white"
            stroke={ACCENT}
            strokeWidth={1.5}
            style={{
              pointerEvents: 'all',
              cursor: resizeCursor(h.hx, h.hy, box.rotation),
            }}
          />
        )
      })}
    </svg>
  )
}