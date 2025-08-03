import { Point, Bounds, HitResult, HitRegion } from '../core/types.js';
import { GeometryUtils } from './GeometryUtils.js';
import { BackgroundImageRendering } from './BackgroundImageRendering.js';

export class BackgroundImageInteraction extends BackgroundImageRendering {
  public getBounds(): Bounds {
    const width = this.naturalWidth * this.scale;
    const height = this.naturalHeight * this.scale;
    return GeometryUtils.calculateRotatedBounds(this.position, width, height, this.rotation);
  }

  public contains(point: Point): boolean {
    const center = this.getCenter();
    const width = this.naturalWidth * this.scale;
    const height = this.naturalHeight * this.scale;
    return GeometryUtils.pointInRotatedRect(point, center, width, height, this.rotation);
  }

  public hitTest(point: Point, scale: number): HitResult {
    if (!this.loaded) return { region: HitRegion.NONE };

    // Check for rotation handle hit
    const center = this.getCenter();
    const handleDistance = 30 / scale;
    const handleRadius = 18 / scale;
    const height = this.naturalHeight * this.scale;

    const handlePos = GeometryUtils.calculateRotationHandlePosition(
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
}
