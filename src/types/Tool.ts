import type Point from './Point';

export type ShapeKind = 'rectangle' | 'ellipse' | 'triangle';

export type ToolType =
  'brush' | 'eraser' | 'picker' | 'fill' | 'line' | ShapeKind;

export type ShapeMode = 'fill' | 'stroke';

export type PreviewPainter = (ctx: CanvasRenderingContext2D) => void;

export interface ToolPointerEvent {
  point: Point;
  pressure: number;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
}

export interface ToolContext {
  layerCanvas: HTMLCanvasElement;
  color: string;
  size: number;
  shapeMode: ShapeMode;
  tolerance: number;
  requestRender: () => void;
  setPreview: (painter: PreviewPainter | null) => void;
  sampleColor: (point: Point) => string | null;
  setColor: (color: string) => void;
}

export default interface Tool {
  type: ToolType;
  label: string;
  hotkey: string;
  cursor: string;
  isModifiesPixels: boolean;
  onDown: (ctx: ToolContext, e: ToolPointerEvent) => void;
  onMove?: (ctx: ToolContext, e: ToolPointerEvent) => void;
  onUp?: (ctx: ToolContext, e: ToolPointerEvent) => void;
  onCancel?: (ctx: ToolContext) => void;
}
