import { Point, Bounds, HitResult, HitRegion } from '../core/types.js';
import { BackgroundImageData as BgImageData, IBackgroundImageData } from './BackgroundImageData.js';
import { CanvasStyleUtils } from '../rendering/CanvasStyleUtils.js';
import { HandleRenderer } from '../rendering/HandleRenderer.js';
import { BackgroundImageGeometry } from './BackgroundImageGeometry.js';

// Re-export the interface for backward compatibility
export type BackgroundImageData = IBackgroundImageData;

/**
 * BackgroundImage represents a background image that can be loaded, positioned, rotated,
 * scaled, and drawn on the canvas. It provides methods for interaction (hit testing),
 * transformation (move, rotate, scale), and rendering.
 */
export class BackgroundImage {
  public id: string;
  public selected = false;
  protected img: HTMLImageElement;
  protected imageData: string;
  protected position: Point;
  protected rotation: number;
  protected scale: number;
  protected opacity: number;
  protected naturalWidth: number;
  protected naturalHeight: number;
  protected loaded = false;
  protected restoredFromJSON = false;
  protected lazyLoadInProgress = false;

  constructor(
    imageData: string,
    position: Point = { x: 0, y: 0 },
    id?: string,
    restoredFromJSON = false,
  ) {
    const startTime = performance.now();
    console.log(`[PERF] BackgroundImage constructor started for image ${id || 'new'}`);

    // Use data utility to create default data
    const defaultData = BgImageData.createDefault(imageData, position, id);

    this.id = defaultData.id;
    this.imageData = defaultData.imageData;
    this.position = { ...defaultData.position };
    this.rotation = defaultData.rotation;
    this.scale = defaultData.scale;
    this.opacity = defaultData.opacity;
    this.naturalWidth = defaultData.naturalWidth;
    this.naturalHeight = defaultData.naturalHeight;
    this.restoredFromJSON = restoredFromJSON;

    const imageDataSize = new Blob([imageData]).size;
    console.log(`[PERF] Image data size: ${(imageDataSize / 1024).toFixed(1)}KB`);

    this.img = new Image();

    // Optimization: For restored images, defer image creation until needed
    if (this.restoredFromJSON) {
      console.log(`[PERF] Deferring image decoding for restored image ${this.id}`);
      this.loaded = true; // Mark as loaded since we have dimensions
      // Don't set img.src yet - wait until draw() is called
    } else {
      this.img.onload = () => {
        const loadTime = performance.now();
        console.log(`[PERF] Image ${this.id} loaded in ${(loadTime - startTime).toFixed(2)}ms`);

        this.naturalWidth = this.img.naturalWidth;
        this.naturalHeight = this.img.naturalHeight;
        this.loaded = true;
      };

      const setSrcStartTime = performance.now();
      this.img.src = imageData;
      const setSrcEndTime = performance.now();
      console.log(`[PERF] Setting img.src took ${(setSrcEndTime - setSrcStartTime).toFixed(2)}ms`);
    }
  }

  // =============================================================================
  // BASIC GETTERS/SETTERS
  // =============================================================================

  public getCenter(): Point {
    const width = this.naturalWidth * this.scale;
    const height = this.naturalHeight * this.scale;
    return {
      x: this.position.x + width / 2,
      y: this.position.y + height / 2,
    };
  }

  public setOpacity(opacity: number): void {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  public getRotation(): number {
    return this.rotation;
  }

  public setRotation(rotation: number): void {
    this.rotation = rotation;
  }

  public updateImageData(newImageData: string): void {
    this.imageData = newImageData;
    this.img.src = newImageData;
  }

  // =============================================================================
  // INTERACTION METHODS
  // =============================================================================

  public getBounds(): Bounds {
    const width = this.naturalWidth * this.scale;
    const height = this.naturalHeight * this.scale;
    return BackgroundImageGeometry.calculateRotatedBounds(
      this.position,
      width,
      height,
      this.rotation,
    );
  }

  public contains(point: Point): boolean {
    const center = this.getCenter();
    const width = this.naturalWidth * this.scale;
    const height = this.naturalHeight * this.scale;
    return BackgroundImageGeometry.pointInRotatedRect(point, center, width, height, this.rotation);
  }

  public hitTest(point: Point, scale: number): HitResult {
    if (!this.loaded) return { region: HitRegion.NONE };

    // Check for rotation handle hit
    const center = this.getCenter();
    const handleDistance = 30 / scale;
    const handleRadius = 18 / scale;
    const height = this.naturalHeight * this.scale;

    const handlePos = BackgroundImageGeometry.calculateRotationHandlePosition(
      center,
      height,
      this.rotation,
      handleDistance,
    );

    const distToHandle = Math.hypot(point.x - handlePos.x, point.y - handlePos.y);
    if (distToHandle <= handleRadius) {
      return { region: HitRegion.ROTATION_HANDLE };
    }

    // Check for body hit
    if (this.contains(point)) {
      return { region: HitRegion.BODY };
    }

    return { region: HitRegion.NONE };
  }

  // =============================================================================
  // TRANSFORMATION METHODS
  // =============================================================================

  public move(delta: Point): void {
    this.position.x += delta.x;
    this.position.y += delta.y;
  }

  public rotate(angle: number, center?: Point): void {
    const rotCenter = center || this.getCenter();
    const rotatedPos = BackgroundImageGeometry.rotatePoint(this.position, rotCenter, angle);
    this.position = rotatedPos;
    this.rotation += angle;
  }

  public setScale(scale: number): void {
    const center = this.getCenter();
    const minScale = 0.1;
    const maxScale = 10;
    this.scale = Math.max(minScale, Math.min(maxScale, scale));

    // Adjust position to keep center in place
    const newWidth = this.naturalWidth * this.scale;
    const newHeight = this.naturalHeight * this.scale;
    this.position.x = center.x - newWidth / 2;
    this.position.y = center.y - newHeight / 2;
  }

  public fitToCanvas(
    canvasWorldBounds: { width: number; height: number },
    maxFillRatio = 0.6,
    centerPoint: Point = { x: 0, y: 0 },
  ): void {
    if (!this.loaded) return;

    // Calculate scale to fit within maxFillRatio of canvas bounds
    const scaleX = (canvasWorldBounds.width * maxFillRatio) / this.naturalWidth;
    const scaleY = (canvasWorldBounds.height * maxFillRatio) / this.naturalHeight;

    // Use the smaller scale to ensure the image fits entirely within bounds
    const newScale = Math.min(scaleX, scaleY);
    this.scale = newScale;

    // Position the image so its center is at the specified center point
    const scaledWidth = this.naturalWidth * this.scale;
    const scaledHeight = this.naturalHeight * this.scale;
    this.position.x = centerPoint.x - scaledWidth / 2;
    this.position.y = centerPoint.y - scaledHeight / 2;
  }

  public scaleFromTwoPoints(p1: Point, p2: Point, distanceMM: number): void {
    // Calculate pixel distance between points
    const pixelDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    // Calculate scale factor to make this distance equal to distanceMM
    const scaleFactor = distanceMM / pixelDistance;

    // Apply scale relative to current scale
    this.setScale(this.scale * scaleFactor);
  }

  // =============================================================================
  // RENDERING METHODS
  // =============================================================================

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

  // =============================================================================
  // SERIALIZATION
  // =============================================================================

  protected restoreFromJSONData(data: BackgroundImageData): void {
    this.rotation = data.rotation;
    this.scale = data.scale;
    this.opacity = data.opacity;
    this.naturalWidth = data.naturalWidth;
    this.naturalHeight = data.naturalHeight;
    this.loaded = true;
  }

  public toJSON(): BackgroundImageData {
    return BgImageData.toJSON({
      id: this.id,
      imageData: this.imageData,
      position: this.position,
      rotation: this.rotation,
      scale: this.scale,
      opacity: this.opacity,
      naturalWidth: this.naturalWidth,
      naturalHeight: this.naturalHeight,
    });
  }

  public static fromJSON(data: BackgroundImageData): BackgroundImage {
    const startTime = performance.now();
    console.log(`[PERF] BackgroundImage.fromJSON started for ${data.id}`);

    // Create a new BackgroundImage directly with the data
    const img = new BackgroundImage(data.imageData, data.position, data.id, true);

    // Use the protected method to restore properties from JSON data
    img.restoreFromJSONData(data);

    const endTime = performance.now();
    console.log(
      `[PERF] BackgroundImage.fromJSON completed for ${data.id} in ${(endTime - startTime).toFixed(
        2,
      )}ms`,
    );

    return img;
  }
}
