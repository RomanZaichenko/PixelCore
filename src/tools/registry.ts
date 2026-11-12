import type { ToolType } from '../types/Tool';
import type Tool from '../types/Tool';
import { createColorPickerTool } from './colorPicker';
import { createFillTool } from './fill';
import { createLineTool } from './line';
import { createShapeTool } from './shape';
import { createStrokeTool } from './stroke';
import { createTransformTool } from './transform';

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
  picker: createColorPickerTool(),
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
  transform: createTransformTool(),
};

export const toolList: Tool[] = Object.values(tools);
