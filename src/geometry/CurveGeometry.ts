import { Point } from '../core/types.js';

/**
 * Convert a quadratic Bezier curve to a series of arcs
 * This is used for approximating smooth curves with circular arcs
 */
export interface BezierArc {
  start: Point;
  end: Point;
  radius: number;
  center: Point;
  counterClockwise: boolean;
}

export function bezierToArcs(start: Point, control: Point, end: Point, numArcs = 3): BezierArc[] {
  const arcs: BezierArc[] = [];

  // Divide the curve into segments
  for (let i = 0; i < numArcs; i++) {
    const t1 = i / numArcs;
    const t2 = (i + 1) / numArcs;

    // Calculate points on the Bezier curve
    const p1 = evaluateBezier(start, control, end, t1);
    const p2 = evaluateBezier(start, control, end, t2);
    const midT = (t1 + t2) / 2;
    const pMid = evaluateBezier(start, control, end, midT);

    // Fit an arc through these three points
    const arc = fitArcThroughPoints(p1, pMid, p2);
    if (arc) {
      arcs.push(arc);
    }
  }

  return arcs;
}

/**
 * Evaluate a point on a quadratic Bezier curve at parameter t
 */
export function evaluateBezier(start: Point, control: Point, end: Point, t: number): Point {
  const oneMinusT = 1 - t;
  const oneMinusTSquared = oneMinusT * oneMinusT;
  const tSquared = t * t;

  return {
    x: oneMinusTSquared * start.x + 2 * oneMinusT * t * control.x + tSquared * end.x,
    y: oneMinusTSquared * start.y + 2 * oneMinusT * t * control.y + tSquared * end.y,
  };
}

/**
 * Fit a circular arc through three points
 * Returns null if points are collinear
 */
export function fitArcThroughPoints(p1: Point, p2: Point, p3: Point): BezierArc | null {
  // Calculate the center of the circle passing through all three points
  const center = circleCenterFromThreePoints(p1, p2, p3);
  if (!center) {
    return null;
  }

  const radius = Math.hypot(p1.x - center.x, p1.y - center.y);

  // Determine if arc should be drawn counterclockwise
  // by checking if p2 is to the left of the line from p1 to p3
  const cross = (p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x);
  const counterClockwise = cross > 0;

  return {
    start: p1,
    end: p3,
    radius,
    center,
    counterClockwise,
  };
}

/**
 * Calculate the center of a circle passing through three points
 * Returns null if points are collinear
 */
export function circleCenterFromThreePoints(p1: Point, p2: Point, p3: Point): Point | null {
  const d = 2 * (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));

  if (Math.abs(d) < 1e-10) {
    // Points are collinear
    return null;
  }

  const p1Squared = p1.x * p1.x + p1.y * p1.y;
  const p2Squared = p2.x * p2.x + p2.y * p2.y;
  const p3Squared = p3.x * p3.x + p3.y * p3.y;

  const x = (p1Squared * (p2.y - p3.y) + p2Squared * (p3.y - p1.y) + p3Squared * (p1.y - p2.y)) / d;
  const y = (p1Squared * (p3.x - p2.x) + p2Squared * (p1.x - p3.x) + p3Squared * (p2.x - p1.x)) / d;

  return { x, y };
}

/**
 * Calculate the derivative (tangent) of a quadratic Bezier curve at parameter t
 */
export function bezierDerivative(start: Point, control: Point, end: Point, t: number): Point {
  const oneMinusT = 1 - t;

  return {
    x: 2 * oneMinusT * (control.x - start.x) + 2 * t * (end.x - control.x),
    y: 2 * oneMinusT * (control.y - start.y) + 2 * t * (end.y - control.y),
  };
}

/**
 * Calculate the curvature of a quadratic Bezier curve at parameter t
 */
export function bezierCurvature(start: Point, control: Point, end: Point, t: number): number {
  const d1 = bezierDerivative(start, control, end, t);
  const d2 = bezierSecondDerivative(start, control, end);

  const cross = d1.x * d2.y - d1.y * d2.x;
  const denominator = Math.pow(d1.x * d1.x + d1.y * d1.y, 1.5);

  if (denominator === 0) {
    return 0;
  }

  return cross / denominator;
}

/**
 * Calculate the second derivative of a quadratic Bezier curve
 * For quadratic Beziers, this is constant
 */
export function bezierSecondDerivative(start: Point, control: Point, end: Point): Point {
  return {
    x: 2 * (end.x - 2 * control.x + start.x),
    y: 2 * (end.y - 2 * control.y + start.y),
  };
}
