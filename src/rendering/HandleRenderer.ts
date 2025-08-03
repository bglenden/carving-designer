/**
 * Centralized handle rendering utility
 * Consolidates handle drawing logic used across shapes and background images
 */

import { CanvasStyleUtils, HandleStyle } from './CanvasStyleUtils.js';

export interface Point {
  x: number;
  y: number;
}

export interface HandleRenderOptions {
  isActive?: boolean;
  isHovered?: boolean;
  scale: number;
  customRadius?: number;
  customStyle?: HandleStyle;
}

export interface HandleHitTestOptions {
  scale: number;
  customRadius?: number;
}

/**
 * Centralized handle rendering and interaction utility
 */
export class HandleRenderer {
  /**
   * Draw a standard circular handle at the specified position
   */
  static drawHandle(
    ctx: CanvasRenderingContext2D,
    position: Point,
    options: HandleRenderOptions,
  ): void {
    const radius = options.customRadius ?? CanvasStyleUtils.getHandleRadius(options.scale);

    let style: HandleStyle;
    if (options.customStyle) {
      style = options.customStyle;
    } else if (options.isHovered) {
      style = CanvasStyleUtils.getHoverHandleStyle(options.scale);
    } else if (options.isActive) {
      style = CanvasStyleUtils.getActiveHandleStyle(options.scale);
    } else {
      style = CanvasStyleUtils.getInactiveHandleStyle(options.scale);
    }

    CanvasStyleUtils.drawCircleHandle(ctx, position.x, position.y, radius, style);
  }

  /**
   * Draw multiple handles from an array of positions
   */
  static drawHandles(
    ctx: CanvasRenderingContext2D,
    positions: Point[],
    options: HandleRenderOptions,
  ): void {
    positions.forEach((position) => {
      this.drawHandle(ctx, position, options);
    });
  }

  /**
   * Draw handles with individual active/hover states
   */
  static drawHandlesWithStates(
    ctx: CanvasRenderingContext2D,
    handles: Array<{ position: Point; isActive?: boolean; isHovered?: boolean }>,
    baseOptions: Omit<HandleRenderOptions, 'isActive' | 'isHovered'>,
  ): void {
    handles.forEach((handle) => {
      this.drawHandle(ctx, handle.position, {
        ...baseOptions,
        isActive: handle.isActive,
        isHovered: handle.isHovered,
      });
    });
  }

  /**
   * Test if a point is within a handle's interaction area
   */
  static isPointInHandle(
    point: Point,
    handlePosition: Point,
    options: HandleHitTestOptions,
  ): boolean {
    const radius = options.customRadius ?? CanvasStyleUtils.getHandleRadius(options.scale);
    const dx = point.x - handlePosition.x;
    const dy = point.y - handlePosition.y;
    const distanceSquared = dx * dx + dy * dy;
    return distanceSquared <= radius * radius;
  }

  /**
   * Find which handle (if any) contains the given point
   * Returns the index of the first matching handle, or -1 if none match
   */
  static getHandleAtPoint(
    point: Point,
    handlePositions: Point[],
    options: HandleHitTestOptions,
  ): number {
    for (let i = 0; i < handlePositions.length; i++) {
      if (this.isPointInHandle(point, handlePositions[i], options)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Get the bounds of a handle (useful for invalidation rectangles)
   */
  static getHandleBounds(
    position: Point,
    options: HandleHitTestOptions,
  ): { x: number; y: number; width: number; height: number } {
    const radius = options.customRadius ?? CanvasStyleUtils.getHandleRadius(options.scale);
    return {
      x: position.x - radius,
      y: position.y - radius,
      width: radius * 2,
      height: radius * 2,
    };
  }

  /**
   * Get the combined bounds of multiple handles
   */
  static getHandlesBounds(
    positions: Point[],
    options: HandleHitTestOptions,
  ): { x: number; y: number; width: number; height: number } | null {
    if (positions.length === 0) return null;

    const radius = options.customRadius ?? CanvasStyleUtils.getHandleRadius(options.scale);

    let minX = positions[0].x - radius;
    let minY = positions[0].y - radius;
    let maxX = positions[0].x + radius;
    let maxY = positions[0].y + radius;

    for (let i = 1; i < positions.length; i++) {
      const pos = positions[i];
      minX = Math.min(minX, pos.x - radius);
      minY = Math.min(minY, pos.y - radius);
      maxX = Math.max(maxX, pos.x + radius);
      maxY = Math.max(maxY, pos.y + radius);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Draw corner handles for a rectangular area (common pattern)
   */
  static drawCornerHandles(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    options: HandleRenderOptions,
  ): void {
    const corners = [
      { x: bounds.x, y: bounds.y }, // top-left
      { x: bounds.x + bounds.width, y: bounds.y }, // top-right
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // bottom-right
      { x: bounds.x, y: bounds.y + bounds.height }, // bottom-left
    ];

    this.drawHandles(ctx, corners, options);
  }

  /**
   * Draw edge handles for a rectangular area (midpoints of sides)
   */
  static drawEdgeHandles(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    options: HandleRenderOptions,
  ): void {
    const edges = [
      { x: bounds.x + bounds.width / 2, y: bounds.y }, // top
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }, // right
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height }, // bottom
      { x: bounds.x, y: bounds.y + bounds.height / 2 }, // left
    ];

    this.drawHandles(ctx, edges, options);
  }

  /**
   * Draw both corner and edge handles (8 handles total for rectangle)
   */
  static drawAllRectangleHandles(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    options: HandleRenderOptions,
  ): void {
    this.drawCornerHandles(ctx, bounds, options);
    this.drawEdgeHandles(ctx, bounds, options);
  }
}
