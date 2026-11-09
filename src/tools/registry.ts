import type { ToolType } from '../types/Tool'
import { createColorPickerTool } from './colorPicker'
import { createFillTool } from './fill'
import { createRectangleTool } from './rectangle'
import { createStrokeTool } from './stroke'
import type Tool from '../types/Tool'

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
  rectangle: createRectangleTool(),
  picker: createColorPickerTool(),
  fill: createFillTool(),
}

export const toolList: Tool[] = Object.values(tools)