import { Point } from '../core/types.js';
import { distance } from './ArcGeometry.js';

/**
 * Test if a point is inside a polygon defined by vertices
 * Uses the ray casting algorithm
 */
export function pointInPolygon(point: Point, vertices: Point[]): boolean {
  let inside = false;
  const n = vertices.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;

    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Test if a point is within a certain distance of a line segment
 */
export function pointNearLineSegment(
  point: Point,
  lineStart: Point,
  lineEnd: Point,
  tolerance: number,
): boolean {
  const dist = distanceToLineSegment(point, lineStart, lineEnd);
  return dist <= tolerance;
}

/**
 * Calculate the distance from a point to a line segment
 */
export function distanceToLineSegment(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // Line segment is a point
    return distance(point, lineStart);
  }

  // Calculate projection parameter t
  const t = Math.max(
    0,
    Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared),
  );

  // Find the closest point on the line segment
  const closestPoint = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
  };

  return distance(point, closestPoint);
}

/**
 * Test if a point is inside a circle
 */
export function pointInCircle(point: Point, center: Point, radius: number): boolean {
  return distance(point, center) <= radius;
}

/**
 * Test if a point is on an arc
 * @param point Point to test
 * @param center Arc center
 * @param radius Arc radius
 * @param startAngle Start angle in radians
 * @param endAngle End angle in radians
 * @param counterClockwise Direction of arc
 * @param tolerance Distance tolerance
 */
export function pointOnArc(
  point: Point,
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
  counterClockwise: boolean,
  tolerance: number,
): boolean {
  // Check if point is at the right distance from center
  const dist = distance(point, center);
  if (Math.abs(dist - radius) > tolerance) {
    return false;
  }

  // Check if angle is within arc sweep
  const angle = Math.atan2(point.y - center.y, point.x - center.x);
  return isAngleInArcSweep(angle, startAngle, endAngle, counterClockwise);
}

/**
 * Check if an angle is within an arc sweep
 */
export function isAngleInArcSweep(
  angle: number,
  startAngle: number,
  endAngle: number,
  counterClockwise: boolean,
): boolean {
  // Normalize angles to [0, 2π]
  const normalizeAngle = (a: number) => {
    const result = a % (2 * Math.PI);
    return result < 0 ? result + 2 * Math.PI : result;
  };

  const normalizedAngle = normalizeAngle(angle);
  const normalizedStart = normalizeAngle(startAngle);
  const normalizedEnd = normalizeAngle(endAngle);

  if (counterClockwise) {
    if (normalizedStart <= normalizedEnd) {
      return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd;
    } else {
      return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
    }
  } else {
    if (normalizedStart >= normalizedEnd) {
      return normalizedAngle <= normalizedStart && normalizedAngle >= normalizedEnd;
    } else {
      return normalizedAngle <= normalizedStart || normalizedAngle >= normalizedEnd;
    }
  }
}

/**
 * Calculate bounding box from a set of points
 */
export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function boundsFromPoints(points: Point[]): Bounds {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Test if a point is inside a bounding box
 */
export function pointInBounds(point: Point, bounds: Bounds): boolean {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}

/**
 * Test if two bounding boxes intersect
 */
export function boundsIntersect(bounds1: Bounds, bounds2: Bounds): boolean {
  return (
    bounds1.minX <= bounds2.maxX &&
    bounds1.maxX >= bounds2.minX &&
    bounds1.minY <= bounds2.maxY &&
    bounds1.maxY >= bounds2.minY
  );
}
