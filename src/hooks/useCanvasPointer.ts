import { useEffect, type RefObject } from 'react'
import { screenToCanvas } from '../core/coords'
import { ensureLayerCanvas } from '../core/layerPixels'
import { requestRender } from '../core/render'
import { selectActiveDocument, useEditorStore } from '../store/useEditorStore'
import { useViewportStore } from '../store/useViewportStore'
import { tools } from '../tools/registry'
import type { ToolContext, ToolPointerEvent } from '../types/Tool'
import type Tool from '../types/Tool'

interface Session {
  tool: Tool
  ctx: ToolContext
  pointerId: number
}

export function useCanvasPointer(areaRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const area: HTMLElement = el
    let session: Session | null = null

    function toToolEvent(e: PointerEvent): ToolPointerEvent {
      return {
        point: screenToCanvas(
          e.clientX,
          e.clientY,
          area.getBoundingClientRect(),
          useViewportStore.getState(),
        ),
        pressure: e.pressure,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0 || session) return

      const state = useEditorStore.getState()
      const doc = selectActiveDocument(state)
      if (!doc) return
      const layer = doc.layers.find((l) => l.id === doc.activeLayerId)
      if (!layer || !layer.visible) return

      const tool = tools[state.tool]
      const ctx: ToolContext = {
        layerCanvas: ensureLayerCanvas(layer, doc.width, doc.height),
        color: state.color,
        size: state.brushSize,
        requestRender,
      }

      area.setPointerCapture(e.pointerId)
      session = { tool, ctx, pointerId: e.pointerId }
      tool.onDown(ctx, toToolEvent(e))
    }

    function onPointerMove(e: PointerEvent) {
      const current = session
      if (!current || e.pointerId !== current.pointerId) return

      const coalesced = e.getCoalescedEvents()
      const events = coalesced.length > 0 ? coalesced : [e]
      for (const ev of events) {
        current.tool.onMove(current.ctx, toToolEvent(ev))
      }
    }

    function onPointerEnd(e: PointerEvent) {
      const current = session
      if (!current || e.pointerId !== current.pointerId) return
      session = null
      current.tool.onUp(current.ctx, toToolEvent(e))
      if (area.hasPointerCapture(e.pointerId)) {
        area.releasePointerCapture(e.pointerId)
      }
    }

    area.addEventListener('pointerdown', onPointerDown)
    area.addEventListener('pointermove', onPointerMove)
    area.addEventListener('pointerup', onPointerEnd)
    area.addEventListener('pointercancel', onPointerEnd)
    return () => {
      area.removeEventListener('pointerdown', onPointerDown)
      area.removeEventListener('pointermove', onPointerMove)
      area.removeEventListener('pointerup', onPointerEnd)
      area.removeEventListener('pointercancel', onPointerEnd)
    }
  }, [areaRef])
}