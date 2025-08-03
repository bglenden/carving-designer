import { Point, Bounds, ShapeType, HitResult, HitRegion } from '../core/types.js';
import { BaseShape } from './BaseShape.js';
import * as LeafGeometry from './LeafGeometry.js';
import { rotatePoint } from '../geometry/TransformGeometry.js';
import {
  getChordMidpoint,
  distance,
  sagittaFromRadiusAndChord,
  radiusFromChordAndSagitta,
} from '../geometry/ArcGeometry.js';
import { boundsFromPoints } from '../geometry/HitTestGeometry.js';

export class Leaf extends BaseShape {
  // DEBUG: log when Leaf class loaded
  static {}
  // Geometry is encapsulated: use BaseShape API for all access/manipulation
  #focus1: Point;
  #focus2: Point;
  #radius: number;

  constructor(focus1: Point, focus2: Point, radius: number, id?: string) {
    super(ShapeType.LEAF, id);
    this.#focus1 = { ...focus1 };
    this.#focus2 = { ...focus2 };
    this.#radius = radius;
    this.recalculateProperties();
  }

  public getCenter(): Point {
    // Geometric center (midpoint between foci)
    return getChordMidpoint(this.#focus1, this.#focus2);
  }

  public clone(): Leaf {
    const newLeaf = new Leaf({ ...this.#focus1 }, { ...this.#focus2 }, this.#radius);
    newLeaf.selected = this.selected;
    return newLeaf;
  }

  public move(delta: Point): void {
    this.#focus1.x += delta.x;
    this.#focus1.y += delta.y;
    this.#focus2.x += delta.x;
    this.#focus2.y += delta.y;
    this.recalculateProperties();
  }

  public rotate(angle: number, center?: Point): void {
    // Rotate both foci about the given center (default: geometric center)
    const c = center || this.getCenter();
    this.#focus1 = rotatePoint(this.#focus1, angle, c);
    this.#focus2 = rotatePoint(this.#focus2, angle, c);
    this.recalculateProperties();
  }

  protected recalculateProperties(): void {
    // No derived state required; all geometry is computed on demand from foci and radius.
    // This method remains for API compatibility.
    // (Could validate that the distance between foci is <= 2*radius if desired)
  }

  public hitTest(point: Point, scale: number): HitResult {
    // Use unified handle hit test for vertex/arc
    const handleHit = this.handleHitTest(point, scale);
    if (handleHit.region !== HitRegion.NONE) return handleHit;
    if (this.contains(point)) return { region: HitRegion.BODY };
    return { region: HitRegion.NONE };
  }

  public contains(point: Point): boolean {
    // A point is inside the leaf if it's within both circles defined by (focus1, focus2, radius)
    // Compute arc centers on demand using BaseShape utility
    const focus1 = this.#focus1;
    const focus2 = this.#focus2;
    const dist = distance(focus1, focus2);
    if (dist > 2 * this.#radius || dist < 1e-9) return false;
    const h = Math.sqrt(this.#radius ** 2 - (dist / 2) ** 2);
    const center1 = BaseShape.getArcCenterFromVerticesAndOffset(focus1, focus2, +h);
    const center2 = BaseShape.getArcCenterFromVerticesAndOffset(focus1, focus2, -h);
    const d1 = distance(point, center1);
    const d2 = distance(point, center2);
    const tolerance = 1e-9;
    return d1 <= this.#radius + tolerance && d2 <= this.#radius + tolerance;
  }

  public getBoundingBox(): { min: Point; max: Point } {
    const vertices = this.getVertices();
    const arcMidpoints = this.getArcMidpoints();
    const allPoints = [...vertices, ...arcMidpoints];

    if (allPoints.length === 0) {
      return { min: this.getCenter(), max: this.getCenter() };
    }

    const bounds = boundsFromPoints(allPoints);
    return {
      min: { x: bounds.minX, y: bounds.minY },
      max: { x: bounds.maxX, y: bounds.maxY },
    };
  }

  public getBounds(): Bounds {
    const bbox = this.getBoundingBox();
    return {
      x: bbox.min.x,
      y: bbox.min.y,
      width: bbox.max.x - bbox.min.x,
      height: bbox.max.y - bbox.min.y,
    };
  }

  public toJSON(): any {
    return {
      ...super.toJSON(),
      vertices: [{ ...this.#focus1 }, { ...this.#focus2 }],
      radius: this.#radius,
    };
  }

  public fromJSON(json: any): void {
    super.fromJSON(json);

    // Handle both v2.0 format (vertices) and legacy format (focus1/focus2)
    if (json.vertices && Array.isArray(json.vertices) && json.vertices.length === 2) {
      // v2.0 format
      this.#focus1 = { ...json.vertices[0] };
      this.#focus2 = { ...json.vertices[1] };
    } else {
      // Legacy format - remove after migration
      this.#focus1 = json.focus1 ? { ...json.focus1 } : this.#focus1;
      this.#focus2 = json.focus2 ? { ...json.focus2 } : this.#focus2;
    }

    this.#radius = json.radius !== undefined ? json.radius : this.#radius;
    this.recalculateProperties();
  }

  public getVertices(): Point[] {
    return [this.#focus1, this.#focus2];
  }

  // arcIndex param is required by interface but unused (Leaf has only one arc)
  public getArcVertexIndexes(_arcIndex: number): [number, number] {
    // Both arcs are defined by the two foci
    return [0, 1];
  }

  public getArcOffsets(): number[] {
    // Offset = signed distance from chord midpoint to arc peak (h)
    // For both arcs, the offset is the same magnitude but opposite sign
    const dist = distance(this.#focus1, this.#focus2);
    if (dist < 1e-9) return [0, 0];
    const halfChord = dist / 2;
    const d_center = Math.sqrt(Math.max(0, this.#radius * this.#radius - halfChord * halfChord));
    const h = this.#radius - d_center;
    return [-h, h]; // Convention: negative = inward, positive = outward
  }

  public getArcMidpoints(): Point[] {
    // Arc handles at the peaks of the two arcs (ellipse segments)
    const focus1 = this.#focus1;
    const focus2 = this.#focus2;
    const dist = distance(focus1, focus2);
    if (dist < 1e-9) return [];
    // Check for valid geometry before calculating sagitta
    if (this.#radius < dist / 2) return [];
    const h = sagittaFromRadiusAndChord(this.#radius, dist);
    const perpVec = LeafGeometry.getPerpendicular(focus2.x - focus1.x, focus2.y - focus1.y);
    const midPoint = getChordMidpoint(focus1, focus2);
    const peak1 = { x: midPoint.x - h * perpVec.x, y: midPoint.y - h * perpVec.y };
    const peak2 = { x: midPoint.x + h * perpVec.x, y: midPoint.y + h * perpVec.y };
    return [peak1, peak2];
  }

  public setArcMidpoint(arcIndex: number, offset: number): void {
    // Log curvature handle drag activity
    if (typeof offset !== 'number' || isNaN(offset)) {
      console.warn(`[Leaf] setArcMidpoint: offset is not a number`, offset);
      return;
    }
    console.log(`[Leaf] setArcMidpoint: arcIndex=${arcIndex}, offset=${offset.toFixed(3)}`);
    const dist = distance(this.#focus1, this.#focus2);
    if (dist < 1e-9) return;
    const halfChord = dist / 2;
    const minH = halfChord * 0.001;
    // Clamp offset to avoid degenerate radius
    let h = offset;
    // Clamp magnitude but preserve sign
    if (Math.abs(h) < minH) h = (h < 0 ? -1 : 1) * minH;
    // Calculate new radius to preserve arc peak at offset
    this.#radius = radiusFromChordAndSagitta(dist, Math.abs(h));

    this.recalculateProperties();
  }

  /**
   * Moves the arc handle to a new position (required by BaseShape API)
   */
  public moveArc(arcIndex: number, offset: number): void {
    this.setArcMidpoint(arcIndex, offset);
  }

  /**
   * Moves one of the leaf's vertices (focus points)
   */
  public moveVertex(vertexIndex: number, newPosition: Point): void {
    // Compute original chord length and offset (h)
    const oldDist = distance(this.#focus1, this.#focus2);
    const oldH = oldDist > 1e-9 ? sagittaFromRadiusAndChord(this.#radius, oldDist) : 0;
    // If degenerate, fall back to ratio 0.25 (football)
    const ratio = oldDist > 1e-6 && oldH > 0 ? oldH / oldDist : 0.25;

    // Move the vertex
    if (vertexIndex === 0) {
      this.#focus1 = { ...newPosition };
    } else if (vertexIndex === 1) {
      this.#focus2 = { ...newPosition };
    } else {
      throw new Error('Invalid vertex index for Leaf');
    }

    // Compute new chord length
    const newDist = distance(this.#focus1, this.#focus2);
    const halfNewChord = newDist / 2;
    // Set new offset proportional to newDist
    const newH = ratio * newDist;
    // Calculate new radius to preserve aspect ratio
    const minH = halfNewChord * 0.001;
    const h = Math.max(Math.abs(newH), minH);
    this.#radius = radiusFromChordAndSagitta(newDist, h);
    this.recalculateProperties();
  }

  /**
   * Apply random variation to the radius of the leaf shape
   * @param radiusVariationPercent Percentage variation (±%)
   */
  public jiggleRadius(radiusVariationPercent: number): void {
    if (radiusVariationPercent <= 0) return;

    // Calculate variation as percentage of current radius
    const variationAmount = this.#radius * (radiusVariationPercent / 100);
    const randomVariation = (Math.random() - 0.5) * 2 * variationAmount;

    // Apply the variation
    let newRadius = this.#radius + randomVariation;

    // Ensure radius stays within reasonable bounds
    // Minimum radius should be at least half the distance between foci
    const focusDistance = distance(this.#focus1, this.#focus2);
    const minRadius = Math.max(0.1, focusDistance / 2 + 0.1); // Small buffer above theoretical minimum
    const maxRadius = this.#radius * 3; // Don't let it grow more than 3x original size

    newRadius = Math.max(minRadius, Math.min(newRadius, maxRadius));

    this.#radius = newRadius;
    this.recalculateProperties();
  }

  public draw(ctx: CanvasRenderingContext2D, scale: number, isSelected: boolean): void {
    // Defensive: skip drawing if degenerate
    const focus1 = this.#focus1;
    const focus2 = this.#focus2;
    const dist = distance(focus1, focus2);
    if (dist > 2 * this.#radius || dist < 1e-9) return;
    super.draw(ctx, scale, isSelected);
  }

  protected _draw(ctx: CanvasRenderingContext2D, scale: number, isSelected: boolean): void {
    // Actual Leaf drawing logic goes here.
    // Draw the two arcs that form the vesica/leaf.
    const focus1 = this.#focus1;
    const focus2 = this.#focus2;
    const dx = focus2.x - focus1.x;
    const dy = focus2.y - focus1.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 2 * this.#radius || dist < 1e-9) return;
    // Outward normal (unit)
    const perpVec = { x: -dy / dist, y: dx / dist };
    // Use vesica/football geometry: offset = d_center = sqrt(r^2 - (chord/2)^2)
    const halfChord = dist / 2;
    const d_center = Math.sqrt(this.#radius ** 2 - halfChord ** 2);
    ctx.beginPath();
    // Start at focus1
    ctx.moveTo(focus1.x, focus1.y);
    // Draw arc from focus1 to focus2 (first half)
    BaseShape.drawArcBetweenVertices(ctx, focus1, focus2, perpVec, d_center, this.#radius);
    // Draw arc from focus2 back to focus1 (second half, reverse normal)
    BaseShape.drawArcBetweenVertices(
      ctx,
      focus2,
      focus1,
      { x: -perpVec.x, y: -perpVec.y },
      d_center,
      this.#radius,
    );
    // Explicitly line back to start point to ensure clean closure
    ctx.lineTo(focus1.x, focus1.y);
    ctx.closePath();
    ctx.strokeStyle = isSelected ? '#0078d7' : '#006080';

    // Adaptive line width: use world units at low zoom, but ensure minimum screen pixels at high zoom
    const worldLineWidth = 0.25; // 0.25mm in world units
    const minScreenPixels = 0.8; // Minimum 0.8 pixels on screen for visibility
    const screenLineWidth = Math.max(worldLineWidth, minScreenPixels / scale);

    ctx.lineWidth = screenLineWidth;
    ctx.stroke();
  }
}
