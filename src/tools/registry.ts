import type Tool from '../types/Tool'
import type { ToolType } from '../types/Tool'
import { createStrokeTool } from './stroke'

export const tools: Record<ToolType, Tool> = {
  brush: createStrokeTool({
    type: 'brush',
    label: 'Кисть',
    hotkey: 'B',
    erase: false,
  }),
  eraser: createStrokeTool({
    type: 'eraser',
    label: 'Гумка',
    hotkey: 'E',
    erase: true,
  }),
}

export const toolList: Tool[] = Object.values(tools)