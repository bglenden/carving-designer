import { PlacementManager } from '../core/PlacementManager.js';
import { SelectionManager } from '../core/SelectionManager.js';
import { TransformationManager } from '../core/TransformationManager.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { ShapeType } from '../core/types.js';

/**
 * Manages application modes (edit, placement, background)
 */
export class AppModeManager {
  private isPlacementModeActive = false;
  private isEditMode = false;
  private isBackgroundMode = false;

  constructor(
    private canvasManager: CanvasManager,
    private placementManager: PlacementManager,
    private selectionManager: SelectionManager,
    private transformationManager: TransformationManager,
  ) {}

  public isInEditMode(): boolean {
    return this.isEditMode;
  }

  public isInPlacementMode(): boolean {
    return this.isPlacementModeActive;
  }

  public isInBackgroundMode(): boolean {
    return this.isBackgroundMode;
  }

  public startPlacementMode(shapeType: ShapeType): void {
    if (this.isEditMode) {
      this.toggleEditMode();
    }
    this.placementManager.startPlacement(shapeType);
    document.dispatchEvent(
      new CustomEvent('placementModeChanged', { detail: { active: true, shape: shapeType } }),
    );
  }

  public togglePlacementMode(): void {
    if (this.placementManager.isPlacing()) {
      this.placementManager.cancelPlacement();
      document.dispatchEvent(
        new CustomEvent('placementModeChanged', { detail: { active: false, shape: null } }),
      );
    } else {
      this.startPlacementMode(ShapeType.LEAF);
    }

    if (this.isEditMode) {
      this.isEditMode = false;
      this.selectionManager.clear();
      this.canvasManager.setEditMode(false);
      this.transformationManager.end();
      document.dispatchEvent(new CustomEvent('editModeChanged', { detail: { active: false } }));
    }
  }

  public toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.canvasManager.setEditMode(this.isEditMode);
    this.transformationManager.end(); // Exit any active transform mode

    if (!this.isEditMode) {
      this.selectionManager.clear();
    }

    if (this.placementManager.isPlacing()) {
      this.placementManager.cancelPlacement();
    }

    // Disable background mode if active
    if (this.isBackgroundMode) {
      this.isBackgroundMode = false;
      document.dispatchEvent(
        new CustomEvent('backgroundModeChanged', { detail: { active: false } }),
      );
    }

    document.dispatchEvent(
      new CustomEvent('editModeChanged', { detail: { active: this.isEditMode } }),
    );
  }

  public toggleBackgroundMode(): void {
    this.isBackgroundMode = !this.isBackgroundMode;

    // Update canvas manager
    this.canvasManager.setBackgroundMode(this.isBackgroundMode);

    // Disable other modes
    if (this.isEditMode) {
      this.isEditMode = false;
      this.selectionManager.clear();
      this.canvasManager.setEditMode(false);
      this.transformationManager.end();
      document.dispatchEvent(new CustomEvent('editModeChanged', { detail: { active: false } }));
    }

    if (this.placementManager.isPlacing()) {
      this.placementManager.cancelPlacement();
    }

    document.dispatchEvent(
      new CustomEvent('backgroundModeChanged', { detail: { active: this.isBackgroundMode } }),
    );
  }

  public setPlacementModeActive(active: boolean): void {
    this.isPlacementModeActive = active;
  }
}
