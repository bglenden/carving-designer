/**
 * Canvas styling utilities for consistent visual appearance
 * Consolidates repeated styling patterns across the application
 */

export interface HandleStyle {
  fillColor: string;
  strokeColor: string;
  lineWidth: number;
  shadowColor?: string;
  shadowBlur?: number;
}

export interface RenderScale {
  scale: number;
  pixelScale?: number;
}

/**
 * Standard visual constants used throughout the application
 */
export class VisualConstants {
  // Handle dimensions
  static readonly HANDLE_BASE_RADIUS = 18;

  // Standard colors
  static readonly COLORS = {
    SELECTION: '#0078d7',
    ACTIVE_HANDLE: 'rgba(200, 0, 0, 0.9)',
    INACTIVE_HANDLE: 'rgba(255, 0, 0, 0.5)',
    HOVER_HANDLE: 'rgba(0, 150, 255, 1.0)',
    HANDLE_STROKE: 'rgba(0, 0, 0, 1)',
    HANDLE_STROKE_ALT: 'white',
    PLACEHOLDER: 'rgba(200, 200, 200, 0.3)',
    SHADOW_BLUE: 'rgba(0, 150, 255, 0.5)',
  } as const;

  // Standard opacity values
  static readonly OPACITY = {
    FULL: 1.0,
    SEMI_TRANSPARENT: 0.5,
    LIGHT: 0.3,
  } as const;
}

/**
 * Canvas styling utility class for consistent visual operations
 */
export class CanvasStyleUtils {
  /**
   * Calculate handle radius based on current scale
   */
  static getHandleRadius(scale: number): number {
    return VisualConstants.HANDLE_BASE_RADIUS / scale;
  }

  /**
   * Calculate line width based on current scale (for consistent pixel width)
   */
  static getScaledLineWidth(scale: number, baseWidth = 1): number {
    return baseWidth / scale;
  }

  /**
   * Get standard handle style for active state
   */
  static getActiveHandleStyle(scale: number): HandleStyle {
    return {
      fillColor: VisualConstants.COLORS.ACTIVE_HANDLE,
      strokeColor: VisualConstants.COLORS.HANDLE_STROKE,
      lineWidth: this.getScaledLineWidth(scale),
    };
  }

  /**
   * Get standard handle style for inactive state
   */
  static getInactiveHandleStyle(scale: number): HandleStyle {
    return {
      fillColor: VisualConstants.COLORS.INACTIVE_HANDLE,
      strokeColor: VisualConstants.COLORS.HANDLE_STROKE,
      lineWidth: this.getScaledLineWidth(scale),
    };
  }

  /**
   * Get standard handle style for hover state with shadow
   */
  static getHoverHandleStyle(scale: number): HandleStyle {
    return {
      fillColor: VisualConstants.COLORS.HOVER_HANDLE,
      strokeColor: VisualConstants.COLORS.HANDLE_STROKE_ALT,
      lineWidth: this.getScaledLineWidth(scale),
      shadowColor: VisualConstants.COLORS.SHADOW_BLUE,
      shadowBlur: 8 / scale,
    };
  }

  /**
   * Apply handle style to canvas context
   */
  static applyHandleStyle(ctx: CanvasRenderingContext2D, style: HandleStyle): void {
    ctx.fillStyle = style.fillColor;
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.lineWidth;

    if (style.shadowColor && style.shadowBlur) {
      ctx.shadowColor = style.shadowColor;
      ctx.shadowBlur = style.shadowBlur;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
  }

  /**
   * Clear shadow effects from canvas context
   */
  static clearShadow(ctx: CanvasRenderingContext2D): void {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  /**
   * Perform standard canvas transformation pattern
   * Common pattern: save -> translate -> rotate -> scale -> draw -> restore
   */
  static withTransform<T>(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    drawFunction: () => T,
  ): T {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.scale(scaleX, scaleY);

    try {
      return drawFunction();
    } finally {
      ctx.restore();
    }
  }

  /**
   * Standard transformation with Y-axis flip (common for images)
   */
  static withFlippedTransform<T>(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    rotation: number,
    drawFunction: () => T,
  ): T {
    return this.withTransform(ctx, centerX, centerY, rotation, 1, -1, drawFunction);
  }

  /**
   * Draw a standard circle handle
   */
  static drawCircleHandle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    style: HandleStyle,
  ): void {
    this.applyHandleStyle(ctx, style);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    this.clearShadow(ctx);
  }

  /**
   * Set basic stroke style for shapes
   */
  static applyShapeStroke(ctx: CanvasRenderingContext2D, color: string, width: number): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  /**
   * Get selection highlight color
   */
  static getSelectionColor(): string {
    return VisualConstants.COLORS.SELECTION;
  }
}
