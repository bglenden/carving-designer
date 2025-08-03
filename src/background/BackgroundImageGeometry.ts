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
}
