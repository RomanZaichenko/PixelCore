import type { Tool, ToolType } from '../types/Tool';
import { createColorPickerTool } from './colorPicker';
import { createFillTool } from './fill';
import { createLineTool } from './line';
import { createShapeTool } from './shape';
import { createStrokeTool } from './stroke';

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
  fill: createFillTool(),
  eyedropper: createColorPickerTool(),
  line: createLineTool(),
  rectangle: createShapeTool({
    type: 'rectangle',
    label: 'Прямокутник',
    hotkey: 'U',
  }),
  ellipse: createShapeTool({
    type: 'ellipse',
    label: 'Еліпс',
    hotkey: 'O',
  }),
  triangle: createShapeTool({
    type: 'triangle',
    label: 'Трикутник',
    hotkey: 'T',
  }),
};

export const toolList: Tool[] = Object.values(tools);
