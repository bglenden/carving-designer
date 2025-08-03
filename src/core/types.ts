/**
 * Represents a 2D point with x and y coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents the size of an object with width and height
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Represents a rectangular boundary
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Represents an RGB color
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number; // Optional alpha channel (0-1)
}

/**
 * Represents a shape type
 */
export enum ShapeType {
  LEAF = 'LEAF',
  TRI_ARC = 'TRI_ARC',
  TRIANGLE = 'triangle',
  LINE = 'line',
  // Add more shape types as needed
}

/**
 * Base interface for all shapes
 */
/**
 * Defines the possible regions of a shape that can be hit.
 */
export enum HitRegion {
  BODY = 'body',
  VERTEX = 'vertex',
  ARC = 'arc',
  ROTATION_HANDLE = 'rotation_handle',
  NONE = 'none',
}

/**
 * Represents the result of a hit test on a shape.
 */
export interface HitResult {
  region: HitRegion;
  details?: {
    vertexIndex?: number;
    arcIndex?: number;
  };
}

/**
 * Base interface for all shapes
 */
export interface IShape {
  id: string;
  type: ShapeType;
  selected: boolean;

  /**
   * Draw the shape on the canvas
   */
  draw(ctx: CanvasRenderingContext2D, scale: number, isSelected: boolean): void;
  contains(point: Point): boolean;
  hitTest(point: Point, scale: number): HitResult;
  getBounds(): Bounds;
  getCenter(): Point;
  rotate(angle: number, center?: Point): void;
  mirror(axis: 'horizontal' | 'vertical', center: Point): void;
  jiggle(positionVariation?: number, rotationVariation?: number, radiusVariation?: number): void;
  toJSON(): any;
  fromJSON(json: any): void;
}
