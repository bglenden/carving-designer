import { BaseShape } from '../shapes/BaseShape.js';
import { Point } from './types.js';
import { BaseManager } from './BaseManager.js';

const ROTATION_HANDLE_OFFSET = 30; // pixels above the selection center
export const ROTATION_HANDLE_RADIUS = 8; // pixels

export class SelectionManager extends BaseManager {
  private selectedShapes: Set<BaseShape> = new Set();

  protected onInitialize(): void {
    // No specific initialization needed for SelectionManager
  }

  protected onCleanup(): void {
    this.selectedShapes.clear();
  }

  public add(shape: BaseShape): void {
    if (!this.isEnabled()) return;

    this.selectedShapes.add(shape);
    this.dispatchSelectionChanged();
  }

  public remove(shape: BaseShape): void {
    if (!this.isEnabled()) return;

    this.selectedShapes.delete(shape);
    this.dispatchSelectionChanged();
  }

  public has(shape: BaseShape): boolean {
    return this.selectedShapes.has(shape);
  }

  public clear(): void {
    if (!this.isEnabled()) return;

    this.selectedShapes.clear();
    this.dispatchSelectionChanged();
  }

  public get selection(): ReadonlySet<BaseShape> {
    return this.selectedShapes;
  }

  public get(): ReadonlySet<BaseShape> {
    return this.selectedShapes;
  }

  public getRotationHandlePosition(scale: number): Point | null {
    const center = this.getCenter();
    if (!center || this.selectedShapes.size === 0) {
      return null;
    }

    // The offset is in screen pixels, so we convert it to world units by dividing by scale
    const worldOffset = ROTATION_HANDLE_OFFSET / scale;

    // Use the rotation of the first selected shape to determine the handle's orientation.
    // This is a simplification for multi-select scenarios but correct for single selection.
    // Rotation is now handled via geometry, so all shapes are considered to have 0 rotation for handle placement.
    const rotationInRadians = 0;

    // The handle is initially positioned vertically above the center (+Y direction).
    // We rotate this position vector around the origin and then add it to the center.
    const rotatedOffsetX = -(worldOffset * Math.sin(rotationInRadians));
    const rotatedOffsetY = worldOffset * Math.cos(rotationInRadians);

    return {
      x: center.x + rotatedOffsetX,
      y: center.y + rotatedOffsetY,
    };
  }

  public hitTestRotationHandle(worldPos: Point, scale: number): boolean {
    const handlePos = this.getRotationHandlePosition(scale);
    if (!handlePos) {
      console.log('[SelectionManager] No handle position found.');
      return false;
    }

    const dx = worldPos.x - handlePos.x;
    const dy = worldPos.y - handlePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const hitRadius = ROTATION_HANDLE_RADIUS / scale;
    const isHit = distance < hitRadius;

    console.log(`[SelectionManager.hitTestRotationHandle]
      Mouse World Pos: { x: ${worldPos.x.toFixed(2)}, y: ${worldPos.y.toFixed(2)} }
      Handle World Pos: { x: ${handlePos.x.toFixed(2)}, y: ${handlePos.y.toFixed(2)} }
      Distance: ${distance.toFixed(2)}
      Hit Radius (World): ${hitRadius.toFixed(2)}
      Is Hit: ${isHit}`);

    return isHit;
  }

  public getCenter(): Point | null {
    if (this.selectedShapes.size === 0) {
      return null;
    }

    let totalX = 0;
    let totalY = 0;
    this.selectedShapes.forEach((shape) => {
      const center = shape.getCenter();
      totalX += center.x;
      totalY += center.y;
    });

    return {
      x: totalX / this.selectedShapes.size,
      y: totalY / this.selectedShapes.size,
    };
  }

  public destroy(): void {
    this.cleanup();
  }

  private dispatchSelectionChanged(): void {
    this.dispatchCustomEvent('selectionChanged', { selectedShapes: this.selectedShapes });
  }
}
