import { Point } from '../core/types.js';

/**
 * Rotate a point around a center by a given angle
 * @param p Point to rotate
 * @param angleRad Angle in radians
 * @param center Center of rotation
 */
export function rotatePoint(p: Point, angleRad: number, center: Point): Point {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

/**
 * Rotate a point around a center by a given angle in degrees
 * @param p Point to rotate
 * @param angleDeg Angle in degrees
 * @param center Center of rotation
 */
export function rotatePointDegrees(p: Point, angleDeg: number, center: Point): Point {
  return rotatePoint(p, (angleDeg * Math.PI) / 180, center);
}

/**
 * Mirror a point across a line defined by two points
 * @param p Point to mirror
 * @param lineP1 First point on the mirror line
 * @param lineP2 Second point on the mirror line
 */
export function mirrorPoint(p: Point, lineP1: Point, lineP2: Point): Point {
  // Vector along the line
  const dx = lineP2.x - lineP1.x;
  const dy = lineP2.y - lineP1.y;
  const lineLength = Math.hypot(dx, dy);

  if (lineLength === 0) {
    return { ...p };
  }

  // Normalize line direction
  const nx = dx / lineLength;
  const ny = dy / lineLength;

  // Vector from line point to the point to mirror
  const px = p.x - lineP1.x;
  const py = p.y - lineP1.y;

  // Project point onto line
  const projection = px * nx + py * ny;
  const projectedX = lineP1.x + projection * nx;
  const projectedY = lineP1.y + projection * ny;

  // Mirror is twice the distance from point to projection
  return {
    x: 2 * projectedX - p.x,
    y: 2 * projectedY - p.y,
  };
}

/**
 * Scale a point relative to a center
 * @param p Point to scale
 * @param scale Scale factor
 * @param center Center of scaling
 */
export function scalePoint(p: Point, scale: number, center: Point): Point {
  return {
    x: center.x + (p.x - center.x) * scale,
    y: center.y + (p.y - center.y) * scale,
  };
}

/**
 * Translate a point by a given offset
 * @param p Point to translate
 * @param offset Translation offset
 */
export function translatePoint(p: Point, offset: Point): Point {
  return {
    x: p.x + offset.x,
    y: p.y + offset.y,
  };
}

/**
 * Apply a series of transformations to a point
 */
export interface Transform {
  translation?: Point;
  rotation?: number; // in radians
  scale?: number;
  center?: Point; // center for rotation and scaling
}

export function applyTransform(p: Point, transform: Transform): Point {
  let result = { ...p };
  const center = transform.center || { x: 0, y: 0 };

  // Apply scale first
  if (transform.scale !== undefined) {
    result = scalePoint(result, transform.scale, center);
  }

  // Then rotation
  if (transform.rotation !== undefined) {
    result = rotatePoint(result, transform.rotation, center);
  }

  // Finally translation
  if (transform.translation) {
    result = translatePoint(result, transform.translation);
  }

  return result;
}

/**
 * Calculate the angle between two vectors from a common origin
 * @param origin Common origin point
 * @param p1 End of first vector
 * @param p2 End of second vector
 * @returns Angle in radians (0 to 2π)
 */
export function angleBetweenVectors(origin: Point, p1: Point, p2: Point): number {
  const angle1 = Math.atan2(p1.y - origin.y, p1.x - origin.x);
  const angle2 = Math.atan2(p2.y - origin.y, p2.x - origin.x);
  let diff = angle2 - angle1;

  // Normalize to [0, 2π]
  while (diff < 0) diff += 2 * Math.PI;
  while (diff > 2 * Math.PI) diff -= 2 * Math.PI;

  return diff;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
