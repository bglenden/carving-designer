import { Point } from './types.js';

/**
 * Base class for all renderer classes providing common canvas operations
 */
export abstract class BaseRenderer {
  /**
   * Save canvas context and apply common transformations
   */
  protected static saveAndTransform(
    ctx: CanvasRenderingContext2D,
    center: Point,
    rotation = 0,
    scale = 1,
    opacity = 1,
  ): void {
    ctx.save();

    if (opacity !== 1) {
      ctx.globalAlpha = opacity;
    }

    if (center.x !== 0 || center.y !== 0) {
      ctx.translate(center.x, center.y);
    }

    if (rotation !== 0) {
      ctx.rotate(rotation);
    }

    if (scale !== 1) {
      ctx.scale(scale, scale);
    }
  }

  /**
   * Restore canvas context
   */
  protected static restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  /**
   * Set common stroke properties
   */
  protected static setStrokeStyle(
    ctx: CanvasRenderingContext2D,
    color: string,
    lineWidth: number,
    isSelected = false,
  ): void {
    ctx.strokeStyle = isSelected ? '#ff0000' : color;
    ctx.lineWidth = lineWidth;
  }

  /**
   * Set common fill properties
   */
  protected static setFillStyle(
    ctx: CanvasRenderingContext2D,
    color: string,
    isSelected = false,
  ): void {
    ctx.fillStyle = isSelected ? '#ff0000' : color;
  }

  /**
   * Draw a selection outline around a rectangular area
   */
  protected static drawSelectionOutline(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    lineWidth = 2,
    color = '#007bff',
  ): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
  }

  /**
   * Draw a handle (small circle) at a specific point
   */
  protected static drawHandle(
    ctx: CanvasRenderingContext2D,
    center: Point,
    radius: number,
    fillColor = '#007bff',
    strokeColor = 'white',
    strokeWidth = 1,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);

    ctx.fillStyle = fillColor;
    ctx.fill();

    if (strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw a dashed line between two points
   */
  protected static drawDashedLine(
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    dashPattern: number[] = [5, 5],
    color = '#ccc',
    lineWidth = 1,
  ): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(dashPattern);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.setLineDash([]); // Reset dash pattern
    ctx.restore();
  }

  /**
   * Draw text centered at a point
   */
  protected static drawCenteredText(
    ctx: CanvasRenderingContext2D,
    text: string,
    center: Point,
    font = '14px Arial',
    color = '#000',
    backgroundColor?: string,
    padding = 2,
  ): void {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (backgroundColor) {
      const metrics = ctx.measureText(text);
      const width = metrics.width + padding * 2;
      const height = parseInt(font) + padding * 2;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(center.x - width / 2, center.y - height / 2, width, height);
    }

    ctx.fillStyle = color;
    ctx.fillText(text, center.x, center.y);
    ctx.restore();
  }

  /**
   * Apply Y-axis flip for coordinate system correction
   */
  protected static applyYFlip(ctx: CanvasRenderingContext2D): void {
    ctx.scale(1, -1);
  }

  /**
   * Calculate scaled line width for consistent appearance
   */
  protected static getScaledLineWidth(baseWidth: number, scale: number): number {
    return baseWidth / scale;
  }

  /**
   * Check if a point is within a circular area
   */
  protected static pointInCircle(point: Point, center: Point, radius: number): boolean {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= radius * radius;
  }

  /**
   * Check if a point is within a rectangular area
   */
  protected static pointInRect(
    point: Point,
    x: number,
    y: number,
    width: number,
    height: number,
  ): boolean {
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  }
}
