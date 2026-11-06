import type Point from '../types/Point';

export interface View {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export function screenToCanvas(
  clientX: number,
  clientY: number,
  area: DOMRect,
  view: View
): Point {
  return {
    x: (clientX - area.left - view.offsetX) / view.zoom,
    y: (clientY - area.top - view.offsetY) / view.zoom,
  };
}
