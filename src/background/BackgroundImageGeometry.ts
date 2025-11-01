import { Point, Bounds, HitResult, HitRegion } from '../core/types.js';
import { rotatePoint } from '../geometry/TransformGeometry.js';
import { boundsFromPoints } from '../geometry/HitTestGeometry.js';

export class BackgroundImageGeometry {
  /**
   * Calculate the center point of a background image
   */
  static getCenter(
    position: Point,
    naturalWidth: number,
    naturalHeight: number,
    scale: number,
  ): Point {
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
    return {
      x: position.x + width / 2,
      y: position.y + height / 2,
    };
  }

  /**
   * Get the four corner points of the background image
   */
  static getCorners(
    position: Point,
    naturalWidth: number,
    naturalHeight: number,
    scale: number,
    rotation: number,
  ): Point[] {
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
    const center = BackgroundImageGeometry.getCenter(position, naturalWidth, naturalHeight, scale);

    // Define corners relative to center
    const corners = [
      { x: -width / 2, y: -height / 2 }, // Top-left
      { x: width / 2, y: -height / 2 }, // Top-right
      { x: width / 2, y: height / 2 }, // Bottom-right
      { x: -width / 2, y: height / 2 }, // Bottom-left
    ];

    // Rotate corners around center and translate to world position
    return corners.map((corner) => {
      const rotated = rotatePoint(corner, rotation, { x: 0, y: 0 });
      return {
        x: center.x + rotated.x,
        y: center.y + rotated.y,
      };
    });
  }

  /**
   * Get the bounding box of the background image
   */
  static getBounds(
    position: Point,
    naturalWidth: number,
    naturalHeight: number,
    scale: number,
    rotation: number,
  ): Bounds {
    const corners = BackgroundImageGeometry.getCorners(
      position,
      naturalWidth,
      naturalHeight,
      scale,
      rotation,
    );
    const bounds = boundsFromPoints(corners);

    return {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
    };
  }

  /**
   * Test if a point is inside the background image
   */
  static containsPoint(
    point: Point,
    position: Point,
    naturalWidth: number,
    naturalHeight: number,
    scale: number,
    rotation: number,
  ): boolean {
    const center = BackgroundImageGeometry.getCenter(position, naturalWidth, naturalHeight, scale);

    // Transform point to image coordinate system
    const relativePoint = {
      x: point.x - center.x,
      y: point.y - center.y,
    };

    // Rotate point by negative rotation to align with image axes
    const rotatedPoint = rotatePoint(relativePoint, -rotation, { x: 0, y: 0 });

    // Check if point is within image bounds
    const halfWidth = (naturalWidth * scale) / 2;
    const halfHeight = (naturalHeight * scale) / 2;

    return (
      rotatedPoint.x >= -halfWidth &&
      rotatedPoint.x <= halfWidth &&
      rotatedPoint.y >= -halfHeight &&
      rotatedPoint.y <= halfHeight
    );
  }

  /**
   * Perform hit testing for handles and body
   */
  static hitTest(
    point: Point,
    position: Point,
    naturalWidth: number,
    naturalHeight: number,
    scale: number,
    rotation: number,
    selected: boolean,
    pixelScale: number,
  ): HitResult {
    if (selected) {
      // Test for rotation handle when selected
      const center = BackgroundImageGeometry.getCenter(
        position,
        naturalWidth,
        naturalHeight,
        scale,
      );
      const handleDistance = 30 / pixelScale;
      const handleRadius = 18 / pixelScale;
      const height = naturalHeight * scale;

      // Calculate rotation handle position
      const handlePos = {
        x: center.x + Math.sin(rotation) * (height / 2 + handleDistance),
        y: center.y + Math.cos(rotation) * (height / 2 + handleDistance),
      };

      const distToHandle = Math.hypot(point.x - handlePos.x, point.y - handlePos.y);
      if (distToHandle <= handleRadius) {
        return { region: HitRegion.ROTATION_HANDLE };
      }
    }

    // Test for body
    if (
      BackgroundImageGeometry.containsPoint(
        point,
        position,
        naturalWidth,
        naturalHeight,
        scale,
        rotation,
      )
    ) {
      return { region: HitRegion.BODY };
    }

    return { region: HitRegion.NONE };
  }

  /**
   * Calculate scale from two points (for resizing)
   */
  static scaleFromTwoPoints(
    startPoint: Point,
    endPoint: Point,
    center: Point,
    originalScale: number,
  ): number {
    const startDistance = Math.sqrt(
      Math.pow(startPoint.x - center.x, 2) + Math.pow(startPoint.y - center.y, 2),
    );
    const endDistance = Math.sqrt(
      Math.pow(endPoint.x - center.x, 2) + Math.pow(endPoint.y - center.y, 2),
    );

    if (startDistance === 0) return originalScale;

    const scaleFactor = endDistance / startDistance;
    return originalScale * scaleFactor;
  }

  /**
   * Fit image to canvas while maintaining aspect ratio
   */
  static fitToCanvas(
    canvasWidth: number,
    canvasHeight: number,
    naturalWidth: number,
    naturalHeight: number,
  ): { scale: number; position: Point } {
    const margin = 50;
    const availableWidth = canvasWidth - 2 * margin;
    const availableHeight = canvasHeight - 2 * margin;

    const scaleX = availableWidth / naturalWidth;
    const scaleY = availableHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = naturalWidth * scale;
    const scaledHeight = naturalHeight * scale;

    const position = {
      x: (canvasWidth - scaledWidth) / 2,
      y: (canvasHeight - scaledHeight) / 2,
    };

    return { scale, position };
  }

  /**
   * Calculate center point from position and dimensions
   */
  static calculateCenter(position: Point, width: number, height: number): Point {
    return {
      x: position.x + width / 2,
      y: position.y + height / 2,
    };
  }

  /**
   * Rotate a point around a center by an angle
   */
  static rotatePoint(point: Point, center: Point, angle: number): Point {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  }

  /**
   * Calculate the rotated bounding box
   */
  static calculateRotatedBounds(
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

  /**
   * Check if a point is inside a rotated rectangle
   */
  static pointInRotatedRect(
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

  /**
   * Calculate the position of the rotation handle
   */
  static calculateRotationHandlePosition(
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
