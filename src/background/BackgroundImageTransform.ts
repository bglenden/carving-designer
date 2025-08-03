import { Point } from '../core/types.js';
import { GeometryUtils } from './GeometryUtils.js';
import { BackgroundImageInteraction } from './BackgroundImageInteraction.js';
import { BackgroundImageData } from './BackgroundImageCore.js';

export class BackgroundImage extends BackgroundImageInteraction {
  public move(delta: Point): void {
    this.position.x += delta.x;
    this.position.y += delta.y;
  }

  public rotate(angle: number, center?: Point): void {
    const rotCenter = center || this.getCenter();
    const rotatedPos = GeometryUtils.rotatePoint(this.position, rotCenter, angle);
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

  public static fromJSON(data: BackgroundImageData): BackgroundImage {
    const startTime = performance.now();
    console.log(`[PERF] BackgroundImage.fromJSON started for ${data.id}`);

    // Call the base class fromJSON to get a core instance
    const coreInstance = BackgroundImageInteraction.fromJSON(data);

    // Create a new BackgroundImage with the same data
    const img = new BackgroundImage(
      coreInstance.imageData,
      coreInstance.position,
      coreInstance.id,
      true,
    );

    // Copy all properties from the core instance
    img.rotation = coreInstance.rotation;
    img.scale = coreInstance.scale;
    img.opacity = coreInstance.opacity;
    img.naturalWidth = coreInstance.naturalWidth;
    img.naturalHeight = coreInstance.naturalHeight;
    img.loaded = coreInstance.loaded;

    const endTime = performance.now();
    console.log(
      `[PERF] BackgroundImage.fromJSON completed for ${data.id} in ${(endTime - startTime).toFixed(
        2,
      )}ms`,
    );

    return img;
  }
}
