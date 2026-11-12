import { ensureLayerCanvas } from '../core/layerPixels'
import { applyTransform, beginTransform } from '../core/transform'
import { selectActiveDocument, useEditorStore } from '../store/useEditorStore'

let activeKey: string | null = null

function currentTarget() {
  const state = useEditorStore.getState()
  if (state.tool !== 'transform') return null

  const doc = selectActiveDocument(state)
  const layer = doc?.layers.find((l) => l.id === doc.activeLayerId)
  if (!doc || !layer || !layer.visible) return null

  return { doc, layer, key: `${doc.id}:${layer.id}` }
}

function beginForCurrent(): void {
  const target = currentTarget()
  if (!target) return
  const { doc, layer } = target
  beginTransform(
    doc.id,
    layer.id,
    ensureLayerCanvas(layer, doc.width, doc.height),
  )
}

function sync(): void {
  const key = currentTarget()?.key ?? null
  if (key === activeKey) return

  if (activeKey !== null) applyTransform()
  activeKey = key
  if (key !== null) beginForCurrent()
}

export function startTransformController(): () => void {
  sync()
  const unsubscribe = useEditorStore.subscribe(sync)

  return () => {
    unsubscribe()
    if (activeKey !== null) applyTransform()
    activeKey = null
  }
}

export function commitTransform(): void {
  if (activeKey === null) return
  applyTransform()
  beginForCurrent()
}

export function refreshTransform(): void {
  if (activeKey === null) return
  beginForCurrent()
}