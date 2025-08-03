import { Point } from '../core/types.js';
import { BackgroundImageCore } from './BackgroundImageCore.js';
import { CanvasStyleUtils } from '../rendering/CanvasStyleUtils.js';
import { HandleRenderer } from '../rendering/HandleRenderer.js';

export class BackgroundImageRendering extends BackgroundImageCore {
  public draw(
    ctx: CanvasRenderingContext2D,
    scale: number,
    isSelected: boolean,
    isHandleHovered = false,
  ): void {
    if (!this.loaded) return;

    const center = this.getCenter();
    const width = this.naturalWidth * this.scale;
    const height = this.naturalHeight * this.scale;

    // Handle lazy loading for restored images
    if (this.restoredFromJSON && !this.img.src && !this.lazyLoadInProgress) {
      this.startLazyLoad();
      this.drawLoadingPlaceholder(ctx, center, width, height, scale, isSelected);
      return;
    }

    // Show placeholder while loading or if no source set
    if (this.lazyLoadInProgress || (this.restoredFromJSON && !this.img.src)) {
      this.drawLoadingPlaceholder(ctx, center, width, height, scale, isSelected);
      return;
    }

    // Draw the actual image
    this.drawImageWithTransform(ctx, center, width, height);

    // Draw selection UI if selected
    if (isSelected) {
      this.drawSelectionOutline(ctx, center, width, height, scale);
      this.drawRotationHandle(ctx, center, height, scale, isHandleHovered);
    }
  }

  protected startLazyLoad(): void {
    this.lazyLoadInProgress = true;
    const loadStartTime = performance.now();
    console.log(
      `[PERF] Starting lazy load of image ${this.id} (${(
        new Blob([this.imageData]).size / 1024
      ).toFixed(1)}KB)`,
    );

    // Use requestAnimationFrame to make the loading async
    requestAnimationFrame(() => {
      this.img.onload = () => {
        const loadEndTime = performance.now();
        console.log(
          `[PERF] Lazy load completed for ${this.id} in ${(loadEndTime - loadStartTime).toFixed(
            2,
          )}ms`,
        );
        this.lazyLoadInProgress = false;
        // Trigger a re-render to show the loaded image
        document.dispatchEvent(new CustomEvent('backgroundImageLoaded'));
      };

      this.img.onerror = () => {
        console.error(`[PERF] Failed to lazy load image ${this.id}`);
        this.lazyLoadInProgress = false;
      };

      this.img.src = this.imageData;
    });
  }

  protected drawLoadingPlaceholder(
    ctx: CanvasRenderingContext2D,
    center: Point,
    width: number,
    height: number,
    scale: number,
    isSelected: boolean,
  ): void {
    ctx.save();

    // Transform to image position and rotation
    ctx.translate(center.x, center.y);
    ctx.rotate(this.rotation);

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

  protected drawImageWithTransform(
    ctx: CanvasRenderingContext2D,
    center: Point,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Set opacity
    ctx.globalAlpha = this.opacity;

    // Transform to image position and rotation
    ctx.translate(center.x, center.y);
    ctx.rotate(this.rotation);

    // Flip Y-axis to counteract the world coordinate system Y-inversion
    // This ensures images appear right-side up
    ctx.scale(1, -1);

    // Draw image centered at origin
    ctx.drawImage(this.img, -width / 2, -height / 2, width, height);

    ctx.restore();
  }

  protected drawSelectionOutline(
    ctx: CanvasRenderingContext2D,
    center: Point,
    width: number,
    height: number,
    scale: number,
  ): void {
    ctx.save();

    ctx.translate(center.x, center.y);
    ctx.rotate(this.rotation);

    // Flip Y-axis for UI elements
    ctx.scale(1, -1);

    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#0078d7';
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    ctx.restore();
  }

  protected drawRotationHandle(
    ctx: CanvasRenderingContext2D,
    center: Point,
    height: number,
    scale: number,
    isHovered: boolean,
  ): void {
    ctx.save();

    ctx.translate(center.x, center.y);
    ctx.rotate(this.rotation);

    // Flip Y-axis for UI elements
    ctx.scale(1, -1);

    const handleDistance = 30 / scale;
    const handlePosition = { x: 0, y: height / 2 + handleDistance };

    // Use HandleRenderer for consistent handle appearance
    const customStyle = isHovered
      ? CanvasStyleUtils.getHoverHandleStyle(scale)
      : {
          fillColor: 'rgba(0, 120, 215, 0.8)',
          strokeColor: 'white',
          lineWidth: CanvasStyleUtils.getScaledLineWidth(scale),
        };

    HandleRenderer.drawHandle(ctx, handlePosition, {
      scale,
      isHovered,
      customStyle,
    });

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}
