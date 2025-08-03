/**
 * Validation and geometry utilities
 * Consolidates repeated validation patterns and geometric calculations
 */

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MinMaxBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Validation utility class for common validation patterns
 */
export class ValidationUtils {
  /**
   * Clamp a value between min and max bounds
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Check if a value is within a range (inclusive)
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Check if a point is within rectangular bounds
   */
  static isPointInBounds(point: Point, bounds: Bounds): boolean {
    return (
      this.isInRange(point.x, bounds.x, bounds.x + bounds.width) &&
      this.isInRange(point.y, bounds.y, bounds.y + bounds.height)
    );
  }

  /**
   * Check if a point is within min/max bounds
   */
  static isPointInMinMaxBounds(point: Point, bounds: MinMaxBounds): boolean {
    return (
      this.isInRange(point.x, bounds.minX, bounds.maxX) &&
      this.isInRange(point.y, bounds.minY, bounds.maxY)
    );
  }

  /**
   * Validate that a number is finite and not NaN
   */
  static isValidNumber(value: number): boolean {
    return Number.isFinite(value) && !Number.isNaN(value);
  }

  /**
   * Validate that a point has valid coordinates
   */
  static isValidPoint(point: Point): boolean {
    return this.isValidNumber(point.x) && this.isValidNumber(point.y);
  }

  /**
   * Validate that an array of points are all valid
   */
  static areValidPoints(points: Point[]): boolean {
    return points.length > 0 && points.every((point) => this.isValidPoint(point));
  }

  /**
   * Clamp a point within bounds
   */
  static clampPoint(point: Point, bounds: Bounds): Point {
    return {
      x: this.clamp(point.x, bounds.x, bounds.x + bounds.width),
      y: this.clamp(point.y, bounds.y, bounds.y + bounds.height),
    };
  }

  /**
   * Validate that a value is positive
   */
  static isPositive(value: number): boolean {
    return this.isValidNumber(value) && value > 0;
  }

  /**
   * Validate that a value is non-negative
   */
  static isNonNegative(value: number): boolean {
    return this.isValidNumber(value) && value >= 0;
  }
}

/**
 * Geometry utility class for common geometric calculations
 */
export class GeometryUtils {
  /**
   * Calculate distance between two points
   */
  static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate squared distance (faster when you don't need the actual distance)
   */
  static distanceSquared(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return dx * dx + dy * dy;
  }

  /**
   * Calculate midpoint between two points
   */
  static midpoint(p1: Point, p2: Point): Point {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  /**
   * Calculate bounds from an array of points
   */
  static calculateBounds(points: Point[]): MinMaxBounds | null {
    if (points.length === 0) return null;

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * Convert min/max bounds to rectangle bounds
   */
  static minMaxToBounds(minMax: MinMaxBounds): Bounds {
    return {
      x: minMax.minX,
      y: minMax.minY,
      width: minMax.maxX - minMax.minX,
      height: minMax.maxY - minMax.minY,
    };
  }

  /**
   * Convert rectangle bounds to min/max bounds
   */
  static boundsToMinMax(bounds: Bounds): MinMaxBounds {
    return {
      minX: bounds.x,
      minY: bounds.y,
      maxX: bounds.x + bounds.width,
      maxY: bounds.y + bounds.height,
    };
  }

  /**
   * Expand bounds by a margin
   */
  static expandBounds(bounds: Bounds, margin: number): Bounds {
    return {
      x: bounds.x - margin,
      y: bounds.y - margin,
      width: bounds.width + 2 * margin,
      height: bounds.height + 2 * margin,
    };
  }

  /**
   * Check if two bounds intersect
   */
  static boundsIntersect(a: Bounds, b: Bounds): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  /**
   * Calculate the center point of bounds
   */
  static getBoundsCenter(bounds: Bounds): Point {
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  /**
   * Rotate a point around a center by the given angle (in radians)
   */
  static rotatePoint(point: Point, center: Point, angle: number): Point {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  }

  /**
   * Calculate the angle between two points (in radians)
   */
  static angleToPoint(from: Point, to: Point): number {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  /**
   * Check if two points are approximately equal within tolerance
   */
  static pointsEqual(p1: Point, p2: Point, tolerance = 1e-10): boolean {
    return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
  }

  /**
   * Normalize a vector (point treated as vector from origin)
   */
  static normalize(point: Point): Point {
    const length = Math.sqrt(point.x * point.x + point.y * point.y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: point.x / length, y: point.y / length };
  }

  /**
   * Calculate dot product of two vectors
   */
  static dotProduct(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Linear interpolation between two points
   */
  static lerp(p1: Point, p2: Point, t: number): Point {
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    };
  }
}
