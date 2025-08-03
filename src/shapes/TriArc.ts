import { Point, Bounds, ShapeType, HitResult, HitRegion } from '../core/types.js';
import { BaseShape } from './BaseShape.js';
import { outwardNormal, barycentricSign, drawTriArcPath } from './TriArcGeometry.js';
import { TriArcManipulation } from './TriArcManipulation.js';
import { boundsFromPoints } from '../geometry/HitTestGeometry.js';
import { getChordMidpoint, distance, getPerpendicularNormal } from '../geometry/ArcGeometry.js';

export class TriArc extends BaseShape {
  // DEBUG: log when TriArc class loaded
  static {}
  private bulgeFactors: [number, number, number];

  /**
   * Returns the centroid (average) of the three vertices in world coordinates.
   */
  public getCenter(): Point {
    const verts = this.getVertices();
    return {
      x: (verts[0].x + verts[1].x + verts[2].x) / 3,
      y: (verts[0].y + verts[1].y + verts[2].y) / 3,
    };
  }

  /**
   * Returns the indexes of the two vertices that define the endpoints of the given arc.
   * Arc 0: v1-v2, Arc 1: v2-v3, Arc 2: v3-v1
   */
  public getArcVertexIndexes(arcIndex: number): [number, number] {
    if (arcIndex === 0) return [0, 1];
    if (arcIndex === 1) return [1, 2];
    if (arcIndex === 2) return [2, 0];
    throw new Error(`Invalid arcIndex for TriArc: ${arcIndex}`);
  }

  /**
   * Returns the offset (bulge/sagitta) for each arc, in mm. Negative is concave (inward), 0 is straight, positive is convex (outward).
   */
  public getArcOffsets(): number[] {
    // For TriArc, bulgeFactors are negative (concave) by convention.
    return [this.bulgeFactors[0], this.bulgeFactors[1], this.bulgeFactors[2]];
  }

  constructor(
    private v1: Point,
    private v2: Point,
    private v3: Point,
    bulgeFactors?: [number, number, number],
    id?: string,
  ) {
    super(ShapeType.TRI_ARC, id);

    this.v1 = { ...v1 };
    this.v2 = { ...v2 };
    this.v3 = { ...v3 };
    // Log the initial bulge factors for debugging
    const initialBulges: [number, number, number] = bulgeFactors ?? [-0.125, -0.125, -0.125];

    // Enforce concavity: clamp all bulge factors to [-0.99, -0.01]
    this.bulgeFactors = initialBulges.map((b) => {
      if (b >= -0.01) return -0.01;
      if (b < -0.99) return -0.99;
      return b;
    }) as [number, number, number];

    this.recalculateProperties();
  }

  protected recalculateProperties(): void {
    // This method is required for interface compliance but is not used in this implementation.
  }

  public clone(): TriArc {
    return new TriArc({ ...this.v1 }, { ...this.v2 }, { ...this.v3 }, this.bulgeFactors, this.id);
  }

  public contains(point: Point): boolean {
    // Use barycentric coordinates on world geometry
    const verts = this.getVertices();
    const d1 = barycentricSign(point, verts[0], verts[1]);
    const d2 = barycentricSign(point, verts[1], verts[2]);
    const d3 = barycentricSign(point, verts[2], verts[0]);
    const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
    const has_pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(has_neg && has_pos);
  }

  public getBounds(): Bounds {
    const verts = this.getVertices();
    const bounds = boundsFromPoints(verts);

    return {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
    };
  }

  public toJSON(): any {
    return {
      ...super.toJSON(),
      vertices: [{ ...this.v1 }, { ...this.v2 }, { ...this.v3 }],
      curvatures: [...this.bulgeFactors],
    };
  }

  public fromJSON(json: any): void {
    super.fromJSON(json);

    // Handle both v2.0 format (vertices/curvatures) and legacy format (v1/v2/v3/bulgeFactors)
    if (json.vertices && Array.isArray(json.vertices) && json.vertices.length === 3) {
      // v2.0 format
      this.v1 = { ...json.vertices[0] };
      this.v2 = { ...json.vertices[1] };
      this.v3 = { ...json.vertices[2] };
    } else {
      // Legacy format - remove after migration
      this.v1 = json.v1 ? { ...json.v1 } : this.v1;
      this.v2 = json.v2 ? { ...json.v2 } : this.v2;
      this.v3 = json.v3 ? { ...json.v3 } : this.v3;
    }

    if (json.curvatures && Array.isArray(json.curvatures) && json.curvatures.length === 3) {
      // v2.0 format
      this.bulgeFactors = [...json.curvatures] as [number, number, number];
    } else if (json.bulgeFactors) {
      // Legacy format - remove after migration
      this.bulgeFactors = json.bulgeFactors;
    }

    this.recalculateProperties();
  }

  public getVertices(): Point[] {
    return [this.v1, this.v2, this.v3];
  }

  private _getOutwardNormal(p1: Point, p2: Point): Point {
    return outwardNormal(p1, p2);
  }

  public getArcMidpoints(): Point[] {
    // For each arc, place the handle at the peak of the arc: chord midpoint plus sagitta along inward normal
    const verts = this.getVertices();
    const bulges = this.getArcOffsets();
    const midpoints: Point[] = [];
    // Removed empty for loop block at line 37; not needed.
    for (let i = 0; i < 3; i++) {
      const a = verts[i];
      const b = verts[(i + 1) % 3];
      const bulge = bulges[i];
      const chordMid = getChordMidpoint(a, b);
      let outward = this._getOutwardNormal(a, b);
      // Ensure normal points toward centroid (inside)
      const centroid = this.getCenter();
      const toCentroid = { x: centroid.x - chordMid.x, y: centroid.y - chordMid.y };
      if (outward.x * toCentroid.x + outward.y * toCentroid.y < 0) {
        outward = { x: -outward.x, y: -outward.y };
      }
      const sideLength = distance(a, b);
      const sagitta = Math.abs((bulge * sideLength) / 2); // Always positive for inward placement
      midpoints.push({
        x: chordMid.x + outward.x * sagitta,
        y: chordMid.y + outward.y * sagitta,
      }); // Handle is always placed on the arc (inward normal, positive sagitta)
    }
    return midpoints;
  }

  public getArcParameters(
    p1: Point,
    p2: Point,
    bulgeFactor: number,
  ): {
    center: Point;
    radius: number;
    startAngle: number;
    endAngle: number;
    sweepDirectionCCW: boolean;
  } | null {
    const offset = Math.abs((bulgeFactor * distance(p1, p2)) / 2); // Always positive for inward placement
    // Patch: ensure normal (for offset) points toward centroid
    const chordMid = getChordMidpoint(p1, p2);
    const centroid = this.getCenter();
    let normal = getPerpendicularNormal(p1, p2);
    const toCentroid = { x: centroid.x - chordMid.x, y: centroid.y - chordMid.y };
    if (normal.x * toCentroid.x + normal.y * toCentroid.y < 0) {
      normal = { x: -normal.x, y: -normal.y };
    }
    // Instead of changing getArcCenterFromVerticesAndOffset, adjust offset sign
    const center = { x: chordMid.x + offset * normal.x, y: chordMid.y + offset * normal.y };

    const radius = distance(p1, center);
    const isConcave = bulgeFactor < 0;
    const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
    const endAngle = Math.atan2(p2.y - center.y, p2.x - center.x);

    return {
      center,
      radius,
      startAngle,
      endAngle,
      sweepDirectionCCW: !isConcave, // Convex arcs sweep CCW, concave sweep CW.
    };
  }

  public hitTest(point: Point, scale: number): HitResult {
    // Use unified handle hit test for vertex/arc
    const handleHit = this.handleHitTest(point, scale);
    if (handleHit.region !== HitRegion.NONE) return handleHit;
    if (this.contains(point)) return { region: HitRegion.BODY };
    return { region: HitRegion.NONE };
  }

  protected _draw(ctx: CanvasRenderingContext2D, scale: number, isSelected: boolean): void {
    this.drawShapePath(ctx);

    // Adaptive line width: use world units at low zoom, but ensure minimum screen pixels at high zoom
    const worldLineWidth = 0.25; // 0.25mm in world units
    const minScreenPixels = 0.8; // Minimum 0.8 pixels on screen for visibility
    const screenLineWidth = Math.max(worldLineWidth, minScreenPixels / scale);

    ctx.lineWidth = screenLineWidth;
    ctx.strokeStyle = isSelected ? '#0078d7' : '#006080';
    ctx.stroke();
  }

  public drawShapePath(ctx: CanvasRenderingContext2D): void {
    const vertices = this.getVertices();
    ctx.beginPath();
    drawTriArcPath(ctx, vertices, this.bulgeFactors);
    ctx.closePath();
  }

  public getBoundingBox(): { min: Point; max: Point } {
    const vertices = this.getVertices();
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    vertices.forEach((v) => {
      minX = Math.min(minX, v.x);
      minY = Math.min(minY, v.y);
      maxX = Math.max(maxX, v.x);
      maxY = Math.max(maxY, v.y);
    });
    return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
  }

  public mirror(axis: 'horizontal' | 'vertical', center: Point): void {
    const result = TriArcManipulation.mirror(this.v1, this.v2, this.v3, axis, center);
    this.v1 = result.v1;
    this.v2 = result.v2;
    this.v3 = result.v3;
    this.recalculateProperties();
  }

  public move(delta: Point): void {
    const result = TriArcManipulation.move(this.v1, this.v2, this.v3, delta);
    this.v1 = result.v1;
    this.v2 = result.v2;
    this.v3 = result.v3;
    this.recalculateProperties();
  }

  // Removed unused rotateBy method to fix lint
  // No rotation property; logic now uses world coordinates only.

  // Removed unused rotateBy method to fix lint
  // No rotation property; logic now uses world coordinates only.

  public jiggle(positionVariation = 1.0, rotationVariation = 5.0, radiusVariation = 5.0): void {
    // Use the BaseShape implementation which applies proper position and rotation jiggle
    super.jiggle(positionVariation, rotationVariation, radiusVariation);
  }

  /**
   * Apply random variation to the radius of curvature (bulge factors)
   * @param radiusVariationPercent Percentage variation (±%)
   */
  public jiggleRadius(radiusVariationPercent: number): void {
    if (radiusVariationPercent <= 0) return;

    // Apply variation to each bulge factor
    this.bulgeFactors = this.bulgeFactors.map((bulge) => {
      // Calculate variation as percentage of the total possible range
      // For TriArc concave shapes, range is from -0.99 to -0.01 (total range = 0.98)
      const totalRange = 0.98; // From -0.99 to -0.01
      const variationAmount = totalRange * (radiusVariationPercent / 100);
      const randomVariation = (Math.random() - 0.5) * 2 * variationAmount;

      let newBulge = bulge + randomVariation;

      // Ensure we maintain concavity constraints for TriArc: clamp to [-0.99, -0.01]
      newBulge = Math.max(-0.99, Math.min(newBulge, -0.01));

      return newBulge;
    }) as [number, number, number];

    // Recalculate the shape properties after bulge modification
    this.recalculateProperties();
  }

  public moveVertex(vertexIndex: number, newPosition: Point): void {
    const result = TriArcManipulation.moveVertex(
      this.v1,
      this.v2,
      this.v3,
      vertexIndex,
      newPosition,
    );
    this.v1 = result.v1;
    this.v2 = result.v2;
    this.v3 = result.v3;
    this.recalculateProperties();
  }

  public moveArc(arcIndex: number, offset: number): void {
    const verts = this.getVertices();
    const chordLength = Math.hypot(
      verts[(arcIndex + 1) % 3].x - verts[arcIndex].x,
      verts[(arcIndex + 1) % 3].y - verts[arcIndex].y,
    );
    if (chordLength < 1e-6) return;

    this.bulgeFactors[arcIndex] = TriArcManipulation.calculateBulgeFromOffset(
      verts,
      arcIndex,
      offset,
    );
    this.recalculateProperties();
  }
}
