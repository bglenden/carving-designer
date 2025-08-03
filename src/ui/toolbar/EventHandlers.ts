import { ShapeType } from '../../core/types.js';
import { CanvasMouseMoveEvent } from '../../core/events.js';
import { TransformMode } from '../../core/TransformationManager.js';
import { StatusBarManager } from '../StatusBarManager.js';

export class EventHandlers {
  private activePlacementShape: ShapeType | null = null;
  private isEditModeActive = false;
  private currentTransformMode: TransformMode = TransformMode.IDLE;

  constructor(
    private statusBarManager: StatusBarManager,
    private updateUICallbacks: {
      updatePlacementUI: (isActive: boolean, shapeType: ShapeType | null) => void;
      updateEditUI: (isActive: boolean) => void;
      updateTransformUI: (mode: TransformMode) => void;
      updateShapeButtonStyles: (shapeType: ShapeType | null) => void;
      updateBackgroundUI?: (isActive: boolean) => void;
      updateCalibrationUI?: (isCalibrating: boolean) => void;
    },
  ) {}

  public handleEditModeChange(event: Event): void {
    const { active } = (event as CustomEvent).detail;
    this.isEditModeActive = active;
    this.updateUICallbacks.updateEditUI(active);
  }

  public handleTransformModeChange(event: Event): void {
    const { mode } = (event as CustomEvent).detail;
    this.currentTransformMode = mode || TransformMode.IDLE;
    this.updateUICallbacks.updateTransformUI(this.currentTransformMode);
  }

  public handlePlacementModeChange(event: Event): void {
    const { active, shape } = (event as CustomEvent).detail;
    this.activePlacementShape = active ? shape : null;
    this.updateUICallbacks.updatePlacementUI(active, shape);
  }

  public handleActiveShapeChanged(event: Event): void {
    const detail = (event as CustomEvent).detail;
    this.activePlacementShape = detail?.shapeType || null;
    this.updateUICallbacks.updateShapeButtonStyles(this.activePlacementShape);
  }

  public handleCanvasMouseMove(event: Event): void {
    const detail = (event as CanvasMouseMoveEvent).detail;
    if (detail && detail.worldPos) {
      this.statusBarManager.updateCoordinateDisplay(detail.worldPos);
    }
  }

  public handleBackgroundModeChange(event: Event): void {
    const { active } = (event as CustomEvent).detail;
    this.updateUICallbacks.updateBackgroundUI?.(active);
  }

  public handleCalibrationModeChange(event: Event): void {
    const { active } = (event as CustomEvent).detail;
    this.updateUICallbacks.updateCalibrationUI?.(active);
  }

  public getCurrentTransformMode(): TransformMode {
    return this.currentTransformMode;
  }

  public getActivePlacementShape(): ShapeType | null {
    return this.activePlacementShape;
  }

  public getIsEditModeActive(): boolean {
    return this.isEditModeActive;
  }
}
