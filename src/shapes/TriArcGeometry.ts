import type { Point } from '../core/types.js';
import { getChordMidpoint, distance } from '../geometry/ArcGeometry.js';

export function getTriangleCenter(v1: Point, v2: Point, v3: Point): Point {
  return {
    x: (v1.x + v2.x + v3.x) / 3,
    y: (v1.y + v2.y + v3.y) / 3,
  };
}

export function outwardNormal(p1: Point, p2: Point): Point {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return { x: 0, y: 0 };
  return { x: -dy / len, y: dx / len };
}

export function barycentricSign(p: Point, a: Point, b: Point): number {
  return (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
}

export function drawTriArcPath(
  ctx: CanvasRenderingContext2D,
  vertices: Point[],
  bulgeFactors: [number, number, number],
) {
  for (let i = 0; i < 3; i++) {
    if (bulgeFactors[i] >= 0) {
      throw new Error(
        `TriArc rendering error: bulge factor at edge ${i} is ${bulgeFactors[i]}, but must be < 0 for concave arcs.`,
      );
    }
  }
  const centroid = {
    x: (vertices[0].x + vertices[1].x + vertices[2].x) / 3,
    y: (vertices[0].y + vertices[1].y + vertices[2].y) / 3,
  };

  // Start with a fresh path
  ctx.moveTo(vertices[0].x, vertices[0].y);

  for (let i = 0; i < 3; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % 3];
    const bulge = bulgeFactors[i];
    const chordLength = distance(p1, p2);

    if (Math.abs(bulge) < 1e-9 || chordLength < 1e-9) {
      // Straight line case
      ctx.lineTo(p2.x, p2.y);
      continue;
    }

    const sagitta = Math.abs((bulge * chordLength) / 2);
    const radius = sagitta / 2 + (chordLength * chordLength) / (8 * sagitta);
    const isConcave = bulge < 0;
    let outward = outwardNormal(p1, p2);
    const mid = getChordMidpoint(p1, p2);
    const distMidToCenter = radius - sagitta;
    const toCentroid = { x: centroid.x - mid.x, y: centroid.y - mid.y };
    const dot = outward.x * toCentroid.x + outward.y * toCentroid.y;
    if (dot < 0) {
      outward = { x: -outward.x, y: -outward.y };
    }
    const sign = isConcave ? -1 : 1;
    const center = {
      x: mid.x + outward.x * distMidToCenter * sign,
      y: mid.y + outward.y * distMidToCenter * sign,
    };
    const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
    const endAngle = Math.atan2(p2.y - center.y, p2.x - center.x);
    const angleDiff = (endAngle - startAngle + Math.PI * 2) % (Math.PI * 2);
    const anticlockwise = angleDiff > Math.PI;

    // Draw the arc - the current path position should already be at p1
    ctx.arc(center.x, center.y, radius, startAngle, endAngle, anticlockwise);
  }
}
