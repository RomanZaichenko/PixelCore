import { useEffect, useRef, useState } from 'react'
import { composite } from '../core/layerPixels'
import { selectActiveDocument, useEditorStore } from '../store/useEditorStore'
import { useViewportStore } from '../store/useViewportStore'

export default function CanvasArea() {
  const doc = useEditorStore(selectActiveDocument)
  const zoom = useViewportStore((s) => s.zoom)
  const offsetX = useViewportStore((s) => s.offsetX)
  const offsetY = useViewportStore((s) => s.offsetY)
  const viewDocId = useViewportStore((s) => s.docId)
  const zoomAt = useViewportStore((s) => s.zoomAt)
  const panBy = useViewportStore((s) => s.panBy)
  const setView = useViewportStore((s) => s.setView)

  const areaRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [area, setArea] = useState({ width: 0, height: 0 })

  const docId = doc?.id
  const width = doc?.width
  const height = doc?.height

  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setArea({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = areaRef.current
    if (!el) return

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : 1
      const deltaX = e.deltaX * unit
      const deltaY = e.deltaY * unit

      if (e.ctrlKey) {
        const rect = el!.getBoundingClientRect()
        const clamped = Math.max(-40, Math.min(40, deltaY))
        const factor = Math.exp(-clamped * 0.01)
        zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor)
        return
      }

      const dx = e.shiftKey && deltaX === 0 ? deltaY : deltaX
      const dy = e.shiftKey ? 0 : deltaY
      panBy(-dx, -dy)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt, panBy])

  useEffect(() => {
    if (!docId || width === undefined || height === undefined) return
    if (viewDocId === docId) return
    if (area.width === 0 || area.height === 0) return

    const fit = Math.min(1, area.width / width, area.height / height)
    setView(
      docId,
      fit,
      (area.width - width * fit) / 2,
      (area.height - height * fit) / 2,
    )
  }, [docId, width, height, viewDocId, area.width, area.height, setView])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!doc || !canvas) return
    composite(doc, canvas)
  }, [doc])

  const ready = doc !== undefined && viewDocId === doc.id
  const checker = 16 / zoom

  return (
    <main
      ref={areaRef}
      className="relative col-start-2 row-start-3 min-h-0 min-w-0 overflow-hidden bg-neutral-700"
    >
      {doc && (
        <canvas
          key={doc.id}
          ref={canvasRef}
          width={doc.width}
          height={doc.height}
          className="checkerboard"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transformOrigin: '0 0',
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
            backgroundSize: `${checker}px ${checker}px`,
            imageRendering: zoom >= 4 ? 'pixelated' : 'auto',
            visibility: ready ? 'visible' : 'hidden',
          }}
        />
      )}
    </main>
  )
}