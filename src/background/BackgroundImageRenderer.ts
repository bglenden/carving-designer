import { Point } from '../core/types.js';
import { BackgroundImageGeometry } from './BackgroundImageGeometry.js';

export class BackgroundImageRenderer {
  /**
   * Render a background image to the canvas
   */
  static render(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    position: Point,
    naturalWidth: number,
    naturalHeight: number,
    scale: number,
    rotation: number,
    opacity: number,
    selected: boolean,
    loaded: boolean,
    pixelScale: number,
  ): void {
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
    const center = BackgroundImageGeometry.getCenter(position, naturalWidth, naturalHeight, scale);

    ctx.save();

    // Apply opacity
    ctx.globalAlpha = opacity;

    // Move to center and apply rotation
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);

    if (loaded && img.complete) {
      // Draw the actual image
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
    } else {
      // Draw placeholder
      BackgroundImageRenderer.drawPlaceholder(ctx, width, height);
    }

    ctx.restore();

    // Draw selection UI if selected
    if (selected) {
      BackgroundImageRenderer.drawSelectionUI(
        ctx,
        position,
        naturalWidth,
        naturalHeight,
        scale,
        rotation,
        pixelScale,
      );
    }
  }

  /**
   * Draw a placeholder rectangle when image is not loaded
   */
  private static drawPlaceholder(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    // Draw placeholder rectangle
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // Draw border
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Draw loading text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Loading...', 0, 0);
  }

  /**
   * Draw selection UI (handles and outline)
   */
  private static drawSelectionUI(
    ctx: CanvasRenderingContext2D,
    position: Point,
    naturalWidth: number,
    naturalHeight: number,
    scale: number,
    rotation: number,
    pixelScale: number,
  ): void {
    const corners = BackgroundImageGeometry.getCorners(
      position,
      naturalWidth,
      naturalHeight,
      scale,
      rotation,
    );

    ctx.save();

    // Draw outline
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2 / pixelScale;
    ctx.setLineDash([5 / pixelScale, 5 / pixelScale]);

    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    // Draw corner handles
    ctx.setLineDash([]);
    ctx.fillStyle = 'blue';
    const handleSize = 8 / pixelScale;

    for (const corner of corners) {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, handleSize / 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Apply transforms to the canvas context
   */
  static applyTransforms(
    ctx: CanvasRenderingContext2D,
    position: Point,
    naturalWidth: number,
    naturalHeight: number,
    scale: number,
    rotation: number,
    opacity: number,
  ): void {
    const center = BackgroundImageGeometry.getCenter(position, naturalWidth, naturalHeight, scale);

    ctx.globalAlpha = opacity;
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
  }

  /**
   * Draw the background image handles only
   */
  static drawHandles(
    ctx: CanvasRenderingContext2D,
    position: Point,
    naturalWidth: number,
    naturalHeight: number,
    scale: number,
    rotation: number,
    pixelScale: number,
  ): void {
    const corners = BackgroundImageGeometry.getCorners(
      position,
      naturalWidth,
      naturalHeight,
      scale,
      rotation,
    );

    ctx.save();
    ctx.fillStyle = 'blue';
    const handleSize = 8 / pixelScale;

    for (const corner of corners) {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, handleSize / 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();
  }
}
