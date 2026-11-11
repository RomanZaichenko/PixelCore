import type Point from '../types/Point';
import type { ShapeKind, ShapeMode } from '../types/Tool';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Segment {
  from: Point;
  to: Point;
}

function normalize(x1: number, y1: number, x2: number, y2: number): Rect {
  const left = Math.round(Math.min(x1, x2));
  const top = Math.round(Math.min(y1, y2));
  const right = Math.round(Math.max(x1, x2));
  const bottom = Math.round(Math.max(y1, y2));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function rectFromDrag(
  start: Point,
  end: Point,
  square: boolean,
  fromCenter: boolean
): Rect {
  let dx = end.x - start.x;
  let dy = end.y - start.y;

  if (square) {
    const side = Math.max(Math.abs(dx), Math.abs(dy));
    dx = Math.sign(dx || 1) * side;
    dy = Math.sign(dy || 1) * side;
  }

  if (fromCenter) {
    return normalize(start.x - dx, start.y - dy, start.x + dx, start.y + dy);
  }
  return normalize(start.x, start.y, start.x + dx, start.y + dy);
}

export function segmentFromDrag(
  start: Point,
  end: Point,
  snapAngle: boolean,
  fromCenter: boolean
): Segment {
  let dx = end.x - start.x;
  let dy = end.y - start.y;

  if (snapAngle) {
    const length = Math.hypot(dx, dy);
    const step = Math.PI / 4;
    const angle = Math.round(Math.atan2(dy, dx) / step) * step;
    dx = Math.cos(angle) * length;
    dy = Math.sin(angle) * length;
  }

  if (fromCenter) {
    return {
      from: { x: start.x - dx, y: start.y - dy },
      to: { x: start.x + dx, y: start.y + dy },
    };
  }
  return { from: start, to: { x: start.x + dx, y: start.y + dy } };
}

function tracePath(
  ctx: CanvasRenderingContext2D,
  kind: ShapeKind,
  r: Rect
): void {
  ctx.beginPath();
  switch (kind) {
    case 'rectangle':
      ctx.rect(r.x, r.y, r.width, r.height);
      break;
    case 'ellipse':
      ctx.ellipse(
        r.x + r.width / 2,
        r.y + r.height / 2,
        r.width / 2,
        r.height / 2,
        0,
        0,
        Math.PI * 2
      );
      break;
    case 'triangle':
      ctx.moveTo(r.x + r.width / 2, r.y);
      ctx.lineTo(r.x + r.width, r.y + r.height);
      ctx.lineTo(r.x, r.y + r.height);
      ctx.closePath();
      break;
  }
}

export function drawShape(
  ctx: CanvasRenderingContext2D,
  kind: ShapeKind,
  rect: Rect,
  mode: ShapeMode,
  color: string,
  lineWidth: number
): void {
  if (rect.width <= 0 || rect.height <= 0) return;

  ctx.save();
  if (mode === 'fill') {
    ctx.fillStyle = color;
    tracePath(ctx, kind, rect);
    ctx.fill();
  } else {
    const inset = Math.min(lineWidth / 2, rect.width / 2, rect.height / 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = kind === 'rectangle' ? 'miter' : 'round';
    tracePath(ctx, kind, {
      x: rect.x + inset,
      y: rect.y + inset,
      width: rect.width - inset * 2,
      height: rect.height - inset * 2,
    });
    ctx.stroke();
  }
  ctx.restore();
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  segment: Segment,
  color: string,
  lineWidth: number
): void {
  const { from, to } = segment;
  if (from.x === to.x && from.y === to.y) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}
