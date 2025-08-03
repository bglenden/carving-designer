import { Point } from '../core/types.js';

/**
 * Calculate the center point of an arc given two points and an offset (sagitta)
 */
export function getArcCenterFromChordAndOffset(p1: Point, p2: Point, offset: number): Point {
  const midPoint = getChordMidpoint(p1, p2);
  const perpendicular = getPerpendicularNormal(p1, p2);

  return {
    x: midPoint.x + perpendicular.x * offset,
    y: midPoint.y + perpendicular.y * offset,
  };
}

/**
 * Calculate the midpoint between two points
 */
export function getChordMidpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Get the unit normal vector perpendicular to the line from p1 to p2
 * The normal points to the left of the direction from p1 to p2
 */
export function getPerpendicularNormal(p1: Point, p2: Point): Point {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  // Perpendicular to (dx, dy) is (-dy, dx)
  return {
    x: -dy / length,
    y: dx / length,
  };
}

/**
 * Calculate arc parameters from two points and an offset
 */
export interface ArcParameters {
  center: Point;
  radius: number;
  startAngle: number;
  endAngle: number;
  counterClockwise: boolean;
}

export function calculateArcParameters(p1: Point, p2: Point, offset: number): ArcParameters {
  const center = getArcCenterFromChordAndOffset(p1, p2, offset);
  const radius = distance(center, p1);
  const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
  const endAngle = Math.atan2(p2.y - center.y, p2.x - center.x);

  // Determine if we should draw counterclockwise based on offset direction
  const counterClockwise = offset < 0;

  return {
    center,
    radius,
    startAngle,
    endAngle,
    counterClockwise,
  };
}

/**
 * Calculate the distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Calculate sagitta (arc height) from radius and chord length
 */
export function sagittaFromRadiusAndChord(radius: number, chordLength: number): number {
  const halfChord = chordLength / 2;
  if (radius < halfChord) {
    throw new Error('Radius must be greater than or equal to half the chord length');
  }
  return radius - Math.sqrt(radius * radius - halfChord * halfChord);
}

/**
 * Calculate radius from chord length and sagitta
 */
export function radiusFromChordAndSagitta(chordLength: number, sagitta: number): number {
  const halfChord = chordLength / 2;
  return (halfChord * halfChord + sagitta * sagitta) / (2 * sagitta);
}

/**
 * Convert bulge factor to sagitta
 * Bulge is the ratio of sagitta to half chord length
 */
export function bulgeToSagitta(bulge: number, chordLength: number): number {
  return (bulge * chordLength) / 2;
}

/**
 * Convert sagitta to bulge factor
 */
export function sagittaToBulge(sagitta: number, chordLength: number): number {
  return (sagitta * 2) / chordLength;
}

/**
 * Find the intersection point of two arcs
 * Returns null if no intersection exists
 */
export function arcIntersection(
  center1: Point,
  radius1: number,
  center2: Point,
  radius2: number,
): Point | null {
  const d = distance(center1, center2);

  // No intersection if circles are too far apart or one contains the other
  if (d > radius1 + radius2 || d < Math.abs(radius1 - radius2) || d === 0) {
    return null;
  }

  // Calculate intersection using law of cosines
  const a = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d);
  const h = Math.sqrt(radius1 * radius1 - a * a);

  // Point along line between centers
  const dx = center2.x - center1.x;
  const dy = center2.y - center1.y;
  const px = center1.x + (a * dx) / d;
  const py = center1.y + (a * dy) / d;

  // Perpendicular offset to intersection
  const offsetX = (-h * dy) / d;
  const offsetY = (h * dx) / d;

  // Return the first intersection point
  return {
    x: px + offsetX,
    y: py + offsetY,
  };
}
