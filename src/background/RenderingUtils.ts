import { Point } from '../core/types.js';

export class RenderingUtils {
  public static drawImageWithTransform(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    center: Point,
    width: number,
    height: number,
    rotation: number,
    opacity: number,
  ): void {
    ctx.save();

    // Set opacity
    ctx.globalAlpha = opacity;

    // Transform to image position and rotation
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);

    // Flip Y-axis to counteract the world coordinate system Y-inversion
    // This ensures images appear right-side up
    ctx.scale(1, -1);

    // Draw image centered at origin
    ctx.drawImage(img, -width / 2, -height / 2, width, height);

    ctx.restore();
  }

  public static drawSelectionOutline(
    ctx: CanvasRenderingContext2D,
    center: Point,
    width: number,
    height: number,
    rotation: number,
    scale: number,
  ): void {
    ctx.save();

    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);

    // Flip Y-axis for UI elements
    ctx.scale(1, -1);

    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#0078d7';
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    ctx.restore();
  }

  public static drawRotationHandle(
    ctx: CanvasRenderingContext2D,
    center: Point,
    height: number,
    rotation: number,
    scale: number,
    isHovered: boolean,
  ): void {
    ctx.save();

    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);

    // Flip Y-axis for UI elements
    ctx.scale(1, -1);

    const handleDistance = 30 / scale;
    const handleRadius = 18 / scale;

    ctx.beginPath();
    ctx.arc(0, height / 2 + handleDistance, handleRadius, 0, 2 * Math.PI);

    // Change appearance based on hover state
    if (isHovered) {
      ctx.fillStyle = 'rgba(0, 150, 255, 1.0)'; // Brighter blue when hovered
      ctx.shadowColor = 'rgba(0, 150, 255, 0.5)';
      ctx.shadowBlur = 8 / scale;
    } else {
      ctx.fillStyle = 'rgba(0, 120, 215, 0.8)';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1 / scale;
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  public static drawLoadingPlaceholder(
    ctx: CanvasRenderingContext2D,
    center: Point,
    width: number,
    height: number,
    rotation: number,
    scale: number,
    isSelected: boolean,
  ): void {
    ctx.save();

    // Transform to image position and rotation
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);

    // Draw placeholder rectangle
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.7)';
    ctx.lineWidth = 2 / scale;
    ctx.setLineDash([10 / scale, 10 / scale]);

    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Draw loading text
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
    ctx.font = `${Math.max(16 / scale, 12)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Loading...', 0, 0);

    // Draw selection outline if selected
    if (isSelected) {
      ctx.strokeStyle = '#0078d7';
      ctx.lineWidth = 2 / scale;
      ctx.setLineDash([]);
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    }

    ctx.restore();
  }
}
