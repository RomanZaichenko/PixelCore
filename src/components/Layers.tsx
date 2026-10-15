import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { selectActiveDocument, useEditorStore } from '../store/useEditorStore'
import LayerItem from './LayerItem'

const footerButton =
  'grid h-8 w-8 place-items-center rounded border border-neutral-600 hover:border-neutral-400 disabled:opacity-40 disabled:hover:border-neutral-600'

export default function Layers() {
  const doc = useEditorStore(selectActiveDocument)
  const addLayer = useEditorStore((s) => s.addLayer)
  const removeLayer = useEditorStore((s) => s.removeLayer)
  const setActiveLayer = useEditorStore((s) => s.setActiveLayer)
  const toggleLayerVisible = useEditorStore((s) => s.toggleLayerVisible)
  const renameLayer = useEditorStore((s) => s.renameLayer)
  const moveLayer = useEditorStore((s) => s.moveLayer)
  const reorderLayer = useEditorStore((s) => s.reorderLayer)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  if (!doc) return null

  const activeIndex = doc.layers.findIndex((l) => l.id === doc.activeLayerId)
  const ordered = [...doc.layers].reverse()

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      reorderLayer(String(active.id), String(over.id))
    }
  }

  return (
    <aside className="col-start-3 row-start-3 flex min-h-0 flex-col border-l border-neutral-700 bg-neutral-800">
      <h2 className="border-b border-neutral-700 px-3 py-2 text-sm font-medium">
        Шари
      </h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={ordered.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {ordered.map((layer) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                active={layer.id === doc.activeLayerId}
                editing={layer.id === editingId}
                onSelect={() => setActiveLayer(layer.id)}
                onToggleVisible={() => toggleLayerVisible(layer.id)}
                onStartEdit={() => setEditingId(layer.id)}
                onCommitName={(name) => {
                  renameLayer(layer.id, name)
                  setEditingId(null)
                }}
                onCancelEdit={() => setEditingId(null)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="flex gap-2 border-t border-neutral-700 p-2">
        <button
          type="button"
          className={footerButton}
          aria-label="Додати шар"
          title="Додати шар"
          onClick={addLayer}
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          className={footerButton}
          aria-label="Шар вище"
          title="Шар вище"
          disabled={activeIndex === -1 || activeIndex >= doc.layers.length - 1}
          onClick={() => moveLayer(doc.activeLayerId, 'up')}
        >
          <ArrowUp size={16} />
        </button>
        <button
          type="button"
          className={footerButton}
          aria-label="Шар нижче"
          title="Шар нижче"
          disabled={activeIndex <= 0}
          onClick={() => moveLayer(doc.activeLayerId, 'down')}
        >
          <ArrowDown size={16} />
        </button>
        <button
          type="button"
          className={`${footerButton} ml-auto`}
          aria-label="Видалити шар"
          title="Видалити шар"
          disabled={doc.layers.length <= 1}
          onClick={() => removeLayer(doc.activeLayerId)}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </aside>
  )
}