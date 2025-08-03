import { IShape, Point, Bounds, ShapeType, HitResult, HitRegion } from '../core/types.js';
import { BaseShapeUtils } from './BaseShapeUtils.js';
import { BaseShapeTransforms } from './BaseShapeTransforms.js';
import { BaseShapeRendering } from './BaseShapeRendering.js';

export abstract class BaseShape implements IShape {
  public static getArcCenterFromVerticesAndOffset =
    BaseShapeUtils.getArcCenterFromVerticesAndOffset;
  public static drawArcBetweenVertices = BaseShapeUtils.drawArcBetweenVertices;

  public id: string;
  public type: ShapeType;
  public selected = false;
  public activeHit: HitResult | null = null;

  /**
   * Returns the geometric center (centroid) of the shape in world coordinates.
   * Must be implemented by subclasses.
   */
  public abstract getCenter(): Point;

  constructor(type: ShapeType, id?: string) {
    this.type = type;
    this.id = id || `${this.type}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public toJSON(): any {
    return {
      id: this.id,
      type: this.type,
      selected: this.selected,
    };
  }

  public fromJSON(json: any): void {
    this.id = json.id ?? this.id;
    this.type = json.type ?? this.type;
    this.selected = json.selected ?? false;
  }

  // --- Abstract Methods for Concrete Shapes to Implement ---

  /**
   * Recalculates the shape's properties. Subclasses must update any derived geometry after mutations.
   * This should be called after any change to the shape's defining geometry.
   */
  protected abstract recalculateProperties(): void;

  /**
   * Returns an array of the shape's vertices.
   */
  public abstract getVertices(): Point[];

  /**
   * Returns an array of the shape's arc midpoints for handle placement.
   * By default, calculates midpoints from vertices and offsets.
   * Subclasses can override for custom arc geometry.
   */
  public getArcMidpoints(): Point[] {
    const vertices = this.getVertices();
    const offsets = this.getArcOffsets();
    const midpoints: Point[] = [];
    for (let arcIndex = 0; arcIndex < offsets.length; arcIndex++) {
      const [ia, ib] = this.getArcVertexIndexes(arcIndex);
      const a = vertices[ia];
      const b = vertices[ib];
      // Chord midpoint
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      // Outward normal (perpendicular to chord)
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < 1e-9) {
        midpoints.push({ x: mx, y: my });
        continue;
      }
      // Normalized outward normal (90deg CCW)
      const nx = -dy / len;
      const ny = dx / len;
      // Move from chord midpoint along normal by offset
      midpoints.push({ x: mx + offsets[arcIndex] * nx, y: my + offsets[arcIndex] * ny });
    }
    return midpoints;
  }

  // This is the concrete draw method that all shapes will use.
  // It handles the rotation of the canvas before calling the shape's specific drawing logic.
  /**
   * Draw the shape. Subclasses should already have their vertices in world
   * space, so no additional canvas rotation is applied.
   */
  public draw(ctx: CanvasRenderingContext2D, scale: number, isSelected: boolean): void {
    ctx.save();
    this._draw(ctx, scale, isSelected);
    ctx.restore();
  }

  // Concrete shapes must implement this to do their specific drawing
  protected abstract _draw(ctx: CanvasRenderingContext2D, scale: number, isSelected: boolean): void;

  public abstract getBoundingBox(): { min: Point; max: Point };

  public abstract contains(point: Point): boolean;

  public abstract moveVertex(vertexIndex: number, newPosition: Point): void;

  /**
   * Returns the indexes of the two vertices that define the endpoints of the given arc.
   * @param arcIndex Index of the arc.
   * @returns [vertexA, vertexB] indexes into getVertices() array.
   */
  public abstract getArcVertexIndexes(arcIndex: number): [number, number];

  /**
   * Returns the offsets (in mm) for each arc, using the same convention as moveArcMidpoint:
   * offset = 0 is a straight segment; negative is inward (concave), positive is outward (convex).
   * The returned array has one entry per arc in the shape.
   */
  public abstract getArcOffsets(): number[];

  /**
   * Adjusts the curvature of an arc by moving its midpoint in or out from the chord.
   * @param arcIndex The index of the arc to modify.
   * @param offset The signed distance (in mm) from the straight line joining the arc's endpoints (the chord). Negative values move the midpoint inward (towards the center of the shape), positive values move outward. This convention allows both concave (TriArc) and convex (Leaf) arcs to be handled consistently.
   */
  public setArcMidpoint(arcIndex: number, offset: number): void {
    // Default implementation logs a warning because subclasses should override this method if they support arc manipulation.
    console.warn(
      `setArcMidpoint not implemented for ${this.constructor.name}. Called with arcIndex: ${arcIndex}, offset: ${offset}.`,
    );
  }

  /**
   * Adjusts the curvature of an arc by moving its midpoint in or out from the chord.
   * @param arcIndex The index of the arc to move.
   * @param offset The signed distance (in mm) from the straight line joining the arc's endpoints (the chord).
   *                Negative values move the midpoint inward (towards the center of the shape), positive values move outward.
   */
  public moveArc(arcIndex: number, offset: number): void {
    // Default implementation delegates to setArcMidpoint
    this.setArcMidpoint(arcIndex, offset);
  }

  /**
   * Unified hit test for vertex and arc handles. Returns closest region or NONE.
   * Uses the same radii as drawHandles for consistency.
   */
  public handleHitTest(point: Point, scale: number): HitResult {
    // Match hit area to the full visible handle: use the maximum of normal and active handle radii
    const handleRadius = 18 / scale;
    const activeHandleRadius = 24 / scale;
    const maxHandleRadius = Math.max(handleRadius, activeHandleRadius);
    const vertices = this.getVertices();
    const arcMidpoints = this.getArcMidpoints();
    let closestVertexDist = Infinity;
    let closestVertexIndex = -1;
    for (let i = 0; i < vertices.length; i++) {
      const dist = Math.hypot(point.x - vertices[i].x, point.y - vertices[i].y);
      if (dist < closestVertexDist) {
        closestVertexDist = dist;
        closestVertexIndex = i;
      }
    }
    let closestArcDist = Infinity;
    let closestArcIndex = -1;
    // For arc handles, use a square hit test (centered at midpoint, side = maxHandleRadius*2)
    for (let i = 0; i < arcMidpoints.length; i++) {
      const mid = arcMidpoints[i];
      const halfSide = maxHandleRadius;
      const inSquare =
        Math.abs(point.x - mid.x) <= halfSide && Math.abs(point.y - mid.y) <= halfSide;
      const dist = Math.hypot(point.x - mid.x, point.y - mid.y); // For tie-breaking
      if (inSquare && dist < closestArcDist) {
        closestArcDist = dist;
        closestArcIndex = i;
      }
    }
    const vertexHit = closestVertexDist <= maxHandleRadius;
    const arcHit = closestArcIndex !== -1;

    let result: HitResult;
    if (vertexHit && arcHit) {
      if (closestVertexDist <= closestArcDist) {
        result = { region: HitRegion.VERTEX, details: { vertexIndex: closestVertexIndex } };
      } else {
        result = { region: HitRegion.ARC, details: { arcIndex: closestArcIndex } };
      }
    } else if (vertexHit) {
      result = { region: HitRegion.VERTEX, details: { vertexIndex: closestVertexIndex } };
    } else if (arcHit) {
      result = { region: HitRegion.ARC, details: { arcIndex: closestArcIndex } };
    } else {
      result = { region: HitRegion.NONE };
    }

    return result;
  }

  public abstract hitTest(point: Point, scale: number): HitResult;

  public abstract getBounds(): Bounds;

  public abstract clone(): IShape;

  public move(delta: Point): void {
    BaseShapeTransforms.move(this, delta);
  }

  public rotate(angle: number, center?: Point): void {
    BaseShapeTransforms.rotate(this, angle, center);
  }

  public mirror(axis: 'horizontal' | 'vertical', center: Point): void {
    BaseShapeTransforms.mirror(this, axis, center);
  }

  public jiggle(positionVariation = 1.0, rotationVariation = 5.0, radiusVariation = 5.0): void {
    BaseShapeTransforms.jiggle(this, positionVariation, rotationVariation, radiusVariation);
  }

  public drawHandles(ctx: CanvasRenderingContext2D, scale: number): void {
    BaseShapeRendering.drawHandles(this, ctx, scale);
  }
}
