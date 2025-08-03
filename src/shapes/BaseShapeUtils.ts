import { Point } from '../core/types.js';

export class BaseShapeUtils {
  /**
   * Computes the center of the arc passing through two points (a, b) with a given signed offset from the chord midpoint.
   * Offset is the distance from the chord midpoint along the normal (90deg CCW from a->b is positive, 90deg CW is negative).
   * Useful for constructing circular arcs and vesica/leaf shapes.
   * @param a First endpoint of the chord
   * @param b Second endpoint of the chord
   * @param offset Signed distance from chord midpoint to arc center (positive = outward, negative = inward)
   * @returns The center point of the arc
   */
  public static getArcCenterFromVerticesAndOffset(a: Point, b: Point, offset: number): Point {
    // Chord midpoint
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    // Outward normal (unit, 90deg CCW from a->b)
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) return { x: mx, y: my };
    const nx = -dy / len;
    const ny = dx / len;
    // Center is at midpoint + offset * normal
    return {
      x: mx + offset * nx,
      y: my + offset * ny,
    };
  }

  /**
   * Draw a circular arc from a to b, with the arc center offset from the chord midpoint
   * along the provided normal vector (must be unit length, points to the inside of the arc).
   * The arc is always the minor arc from a to b.
   * @param ctx Canvas context
   * @param a First endpoint
   * @param b Second endpoint
   * @param normal Unit vector perpendicular to chord (points inside)
   * @param offset Distance from chord midpoint to arc center (signed)
   * @param radius Arc radius
   */
  public static drawArcBetweenVertices(
    ctx: CanvasRenderingContext2D,
    a: Point,
    b: Point,
    normal: { x: number; y: number },
    offset: number,
    radius: number,
  ) {
    // Chord midpoint
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    // Arc center
    const cx = mx + offset * normal.x;
    const cy = my + offset * normal.y;
    // Start/end angles
    const angleA = Math.atan2(a.y - cy, a.x - cx);
    const angleB = Math.atan2(b.y - cy, b.x - cx);
    // Always draw minor arc
    const delta = ((angleB - angleA + Math.PI * 3) % (Math.PI * 2)) - Math.PI; // [-π, π]
    const anticlockwise = Math.abs(delta) > Math.PI;
    ctx.arc(cx, cy, radius, angleA, angleB, anticlockwise);
  }
}
