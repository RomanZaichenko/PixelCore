import type Layer from './Layer';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayerSnapshot {
  layers: Layer[];
  activeLayerId: string;
}

export interface PixelEntry {
  kind: 'pixels';
  layerId: string;
  rect: Rect;
  before: HTMLCanvasElement;
  after: HTMLCanvasElement;
}

export interface StructureEntry {
  kind: 'structure';
  before: LayerSnapshot;
  after: LayerSnapshot;
  canvases: Map<string, HTMLCanvasElement>;
}

export type HistoryEntry = PixelEntry | StructureEntry;
