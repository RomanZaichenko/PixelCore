import { applyFilter, type AdjustFilter, type FilterSpec } from '../core/filters'
import { ensureLayerCanvas } from '../core/layerPixels'
import { beginPixelChange } from '../core/pixelHistory'
import { setLayerOverride } from '../core/preview'
import { requestRender } from '../core/render'
import { selectActiveDocument, useEditorStore } from '../store/useEditorStore'
import { useFilterDialogStore } from '../store/useFilterDialogStore'
import { commitTransform, refreshTransform } from './transform'

function activeTarget() {
  const doc = selectActiveDocument(useEditorStore.getState())
  const layer = doc?.layers.find((l) => l.id === doc.activeLayerId)
  if (!doc || !layer || !layer.visible) return null
  return {
    doc,
    layer,
    canvas: ensureLayerCanvas(layer, doc.width, doc.height),
  }
}

function runFilter(canvas: HTMLCanvasElement, spec: FilterSpec): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  applyFilter(image, spec)
  ctx.putImageData(image, 0, 0)
}


export function applyFilterToActiveLayer(spec: FilterSpec): void {
  const target = activeTarget()
  if (!target) return

  clearFilterPreview()
  commitTransform()

  const change = beginPixelChange(target.doc.id, target.layer.id, target.canvas)
  runFilter(target.canvas, spec)
  change.commit()

  refreshTransform()
  requestRender()
}

export function showFilterPreview(spec: FilterSpec): void {
  const target = activeTarget()
  if (!target) return

  const preview = document.createElement('canvas')
  preview.width = target.canvas.width
  preview.height = target.canvas.height
  preview.getContext('2d')?.drawImage(target.canvas, 0, 0)
  runFilter(preview, spec)

  setLayerOverride({
    layerId: target.layer.id,
    painter: (ctx) => ctx.drawImage(preview, 0, 0),
  })
  requestRender()
}

export function clearFilterPreview(): void {
  setLayerOverride(null)
  requestRender()
}

export function openFilterDialog(kind: AdjustFilter): void {
  if (!activeTarget()) return
  commitTransform()
  useFilterDialogStore.getState().open(kind)
}

export function canFilterActiveLayer(): boolean {
  return activeTarget() !== null
}