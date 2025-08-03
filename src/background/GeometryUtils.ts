import { Point, Bounds } from '../core/types.js';

export class GeometryUtils {
  public static calculateCenter(position: Point, width: number, height: number): Point {
    return {
      x: position.x + width / 2,
      y: position.y + height / 2,
    };
  }

  public static rotatePoint(point: Point, center: Point, angle: number): Point {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  }

  public static calculateRotatedBounds(
    position: Point,
    width: number,
    height: number,
    rotation: number,
  ): Bounds {
    if (rotation === 0) {
      return {
        x: position.x,
        y: position.y,
        width,
        height,
      };
    }

    // Calculate bounds for rotated image
    const center = this.calculateCenter(position, width, height);
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    // Get corners relative to center
    const corners = [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
      { x: -width / 2, y: height / 2 },
    ];

    // Rotate corners and find bounds
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    for (const corner of corners) {
      const rotX = corner.x * cos - corner.y * sin + center.x;
      const rotY = corner.x * sin + corner.y * cos + center.y;

      minX = Math.min(minX, rotX);
      minY = Math.min(minY, rotY);
      maxX = Math.max(maxX, rotX);
      maxY = Math.max(maxY, rotY);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  public static pointInRotatedRect(
    point: Point,
    center: Point,
    width: number,
    height: number,
    rotation: number,
  ): boolean {
    // Transform point to image's local coordinate system
    const dx = point.x - center.x;
    const dy = point.y - center.y;

    // Rotate point backwards
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    // Check if point is within image bounds
    return Math.abs(localX) <= width / 2 && Math.abs(localY) <= height / 2;
  }

  public static calculateRotationHandlePosition(
    center: Point,
    height: number,
    rotation: number,
    handleDistance: number,
  ): Point {
    const handleOffset = height / 2 + handleDistance;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    // Handle is positioned above center in world coordinates (positive Y direction)
    return {
      x: center.x + sin * handleOffset,
      y: center.y + cos * handleOffset,
    };
  }
}
