import type { Point } from '../core/types.js';
import { getChordMidpoint } from '../geometry/ArcGeometry.js';

export function getLeafCenter(focus1: Point, focus2: Point): Point {
  return getChordMidpoint(focus1, focus2);
}

export function getPerpendicular(dx: number, dy: number): Point {
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return { x: 0, y: 0 };
  return { x: -dy / len, y: dx / len };
}
