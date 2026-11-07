import { Brush, Eraser, type LucideIcon } from 'lucide-react'
import { useEditorStore } from '../store/useEditorStore'
import { toolList } from '../tools/registry'
import type {ToolType}  from '../types/Tool'

const ICONS: Record<ToolType, LucideIcon> = {
  brush: Brush,
  eraser: Eraser,
}

export default function Toolbar() {
  const activeTool = useEditorStore((s) => s.tool)
  const setTool = useEditorStore((s) => s.setTool)

  return (
    <nav
      aria-label="Інструменти"
      className="col-start-1 row-start-3 flex flex-col items-center gap-1 border-r border-neutral-700 bg-neutral-800 py-2"
    >
      {toolList.map((tool) => {
        const Icon = ICONS[tool.type]
        return (
          <button
            key={tool.type}
            type="button"
            aria-label={tool.label}
            aria-pressed={activeTool === tool.type}
            title={`${tool.label} (${tool.hotkey})`}
            onClick={() => setTool(tool.type)}
            className="grid h-9 w-9 place-items-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100 aria-pressed:bg-sky-500 aria-pressed:text-neutral-950"
          >
            <Icon size={18} strokeWidth={1.75} />
          </button>
        )
      })}
    </nav>
  )
}