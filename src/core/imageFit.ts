import type {Placement} from '../types/Placement';

export function fitInside(
  sourceWidth: number,
  sourceHeight: number,
  destinationWidth: number,
  destinationHeight: number
): Placement {
  const scale = Math.min(
    destinationWidth / sourceWidth,
    destinationHeight / sourceHeight
  );
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  return {
    x: Math.round((destinationWidth - width) / 2),
    y: Math.round((destinationHeight - height) / 2),
    width,
    height,
  };
}
