import { Point } from '../core/types.js';

export class TriArcManipulation {
  public static mirror(
    v1: Point,
    v2: Point,
    v3: Point,
    axis: 'horizontal' | 'vertical',
    center: Point,
  ): { v1: Point; v2: Point; v3: Point } {
    const mirrorPoint = (p: Point): Point => {
      const result = { ...p };
      if (axis === 'horizontal') {
        result.y = center.y - (p.y - center.y);
      } else {
        result.x = center.x - (p.x - center.x);
      }
      return result;
    };

    return {
      v1: mirrorPoint(v1),
      v2: mirrorPoint(v2),
      v3: mirrorPoint(v3),
    };
  }

  public static move(
    v1: Point,
    v2: Point,
    v3: Point,
    delta: Point,
  ): { v1: Point; v2: Point; v3: Point } {
    return {
      v1: { x: v1.x + delta.x, y: v1.y + delta.y },
      v2: { x: v2.x + delta.x, y: v2.y + delta.y },
      v3: { x: v3.x + delta.x, y: v3.y + delta.y },
    };
  }

  public static jiggle(
    v1: Point,
    v2: Point,
    v3: Point,
    positionVariation = 1.0,
  ): { v1: Point; v2: Point; v3: Point } {
    const jigglePoint = (p: Point): Point => {
      // Validate and clamp position variation to reasonable bounds
      const clampedVariation = Math.max(0, Math.min(positionVariation, 50)); // Max 50mm offset
      const randomOffset = () => (Math.random() - 0.5) * 2 * clampedVariation;
      return {
        x: p.x + randomOffset(),
        y: p.y + randomOffset(),
      };
    };

    return {
      v1: jigglePoint(v1),
      v2: jigglePoint(v2),
      v3: jigglePoint(v3),
    };
  }

  public static moveVertex(
    v1: Point,
    v2: Point,
    v3: Point,
    vertexIndex: number,
    newPosition: Point,
  ): { v1: Point; v2: Point; v3: Point } {
    const result = { v1: { ...v1 }, v2: { ...v2 }, v3: { ...v3 } };

    switch (vertexIndex) {
      case 0:
        result.v1 = { ...newPosition };
        break;
      case 1:
        result.v2 = { ...newPosition };
        break;
      case 2:
        result.v3 = { ...newPosition };
        break;
      default:
        throw new Error('Invalid vertex index');
    }

    return result;
  }

  public static calculateBulgeFromOffset(
    vertices: Point[],
    arcIndex: number,
    offset: number,
  ): number {
    const a = vertices[arcIndex];
    const b = vertices[(arcIndex + 1) % 3];
    const chordLength = Math.hypot(b.x - a.x, b.y - a.y);

    if (chordLength < 1e-6) return -0.01;

    // Calculate bulge so that sagitta (height) = offset
    // bulge = 2 * offset / chordLength (always negative for concave arcs)
    let bulge = (2 * offset) / chordLength;

    // Ensure bulge is always negative (concave arcs only)
    if (bulge >= -0.01) bulge = -0.01;
    if (bulge < -0.99) bulge = -0.99;

    return bulge;
  }
}
