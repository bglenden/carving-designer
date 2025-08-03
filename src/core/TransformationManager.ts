import { Point } from './types.js';
import { BaseShape } from '../shapes/BaseShape.js';
import { JiggleModal } from '../ui/modals/JiggleModal.js';
import { MirrorModal } from '../ui/modals/MirrorModal.js';

export enum TransformMode {
  IDLE,
  MOVE,
  ROTATE,
  MIRROR,
  JIGGLE,
}

export class TransformationManager {
  private currentMode: TransformMode = TransformMode.IDLE;
  private activeShapes: ReadonlySet<BaseShape> | null = null;

  // State for rotation
  private rotationCenter: Point | null = null;
  private lastAngle = 0;

  // Callback to get current selection - will be set by App
  private getSelectedShapes: (() => ReadonlySet<BaseShape>) | null = null;
  private addShapesToSelection: ((shapes: BaseShape[]) => void) | null = null;

  // Modal instances
  private jiggleModal = new JiggleModal();
  private mirrorModal = new MirrorModal();

  // constructor intentionally left empty for interface compliance

  public setSelectionCallbacks(
    getSelectedShapes: () => ReadonlySet<BaseShape>,
    addShapesToSelection: (shapes: BaseShape[]) => void,
  ): void {
    this.getSelectedShapes = getSelectedShapes;
    this.addShapesToSelection = addShapesToSelection;
  }

  private dispatchModeChanged(): void {
    document.dispatchEvent(
      new CustomEvent('transformModeChanged', { detail: { mode: this.currentMode } }),
    );
  }

  private enterMode(mode: TransformMode): void {
    if (this.currentMode === mode) {
      this.currentMode = TransformMode.IDLE;
    } else {
      this.currentMode = mode;
    }
    this.dispatchModeChanged();
  }

  public enterMoveMode(): void {
    this.enterMode(TransformMode.MOVE);
  }
  public enterRotateMode(): void {
    this.enterMode(TransformMode.ROTATE);
  }
  public enterMirrorMode(): void {
    // Mirror mode is immediate - show axis selection modal
    if (!this.getSelectedShapes || !this.addShapesToSelection) {
      console.error('Selection callbacks not set for mirror operation');
      return;
    }

    const selectedShapes = this.getSelectedShapes();
    this.mirrorModal.show(selectedShapes, this.addShapesToSelection);
  }

  public enterJiggleMode(): void {
    // Jiggle mode is immediate - show parameter modal and apply
    if (!this.getSelectedShapes) {
      console.error('Selection callbacks not set for jiggle operation');
      return;
    }

    const selectedShapes = this.getSelectedShapes();
    this.jiggleModal.show(selectedShapes, this.executeJiggle.bind(this), this.getSelectedShapes);
  }

  public start(shapes: ReadonlySet<BaseShape>, startPos: Point, rotationCenter?: Point): void {
    if (this.currentMode === TransformMode.IDLE) return;
    this.activeShapes = shapes;

    if (this.currentMode === TransformMode.ROTATE) {
      if (!rotationCenter) {
        console.error('Rotation center is required for ROTATE mode.');
        return;
      }
      this.rotationCenter = rotationCenter;
      this.lastAngle = Math.atan2(
        startPos.y - this.rotationCenter.y,
        startPos.x - this.rotationCenter.x,
      );
    }
  }

  public exitCurrentMode(): void {
    this.currentMode = TransformMode.IDLE;
    this.activeShapes = null;
    this.dispatchModeChanged();
  }

  public isTransforming(): boolean {
    return this.currentMode !== TransformMode.IDLE && !!this.activeShapes;
  }

  public getCurrentMode(): TransformMode {
    return this.currentMode;
  }

  public transform(delta: Point, currentPos: Point): void {
    if (!this.isTransforming() || !this.activeShapes) return;

    switch (this.currentMode) {
      case TransformMode.MOVE:
        this.activeShapes.forEach((shape) => shape.move(delta));
        break;
      case TransformMode.ROTATE: {
        if (!this.rotationCenter) return;

        const currentAngle = Math.atan2(
          currentPos.y - this.rotationCenter.y,
          currentPos.x - this.rotationCenter.x,
        );
        let angleDelta = currentAngle - this.lastAngle;

        // Handle wraparound from +PI to -PI and vice-versa
        if (angleDelta > Math.PI) {
          angleDelta -= 2 * Math.PI;
        } else if (angleDelta < -Math.PI) {
          angleDelta += 2 * Math.PI;
        }

        this.lastAngle = currentAngle;
        const rotationCenter = this.rotationCenter;
        this.activeShapes.forEach((shape) => {
          shape.rotate(angleDelta, rotationCenter);
        });
        break;
      }
      case TransformMode.MIRROR:
        // Mirror mode is handled immediately via modal, not in transform()
        break;
      case TransformMode.JIGGLE:
        // Jiggle is applied once when the mode is activated, not continuously
        break;
    }
  }

  public end(): void {
    // If we were transforming shapes, trigger autosave
    if (this.activeShapes && this.activeShapes.size > 0) {
      document.dispatchEvent(new CustomEvent('shapesModified'));
    }

    if (this.currentMode === TransformMode.ROTATE) {
      this.rotationCenter = null;
    }
    this.activeShapes = null;
  }

  private executeJiggle(
    selectedShapes: ReadonlySet<BaseShape>,
    positionVariation: number,
    rotationVariation: number,
    radiusVariation: number,
  ): void {
    selectedShapes.forEach((shape) => {
      shape.jiggle(positionVariation, rotationVariation, radiusVariation);
    });

    // Trigger immediate canvas redraw using the selectionChanged event
    // This calls app.handleSelectionChanged() which calls canvasManager.draw()
    document.dispatchEvent(new CustomEvent('selectionChanged'));

    // Trigger autosave after shapes have been modified
    document.dispatchEvent(new CustomEvent('shapesModified'));
  }

  public destroy(): void {
    this.jiggleModal.close();
    // MirrorModal doesn't have a close method - it auto-closes
    this.currentMode = TransformMode.IDLE;
    this.activeShapes = null;
    this.rotationCenter = null;
    this.getSelectedShapes = null;
    this.addShapesToSelection = null;
  }
}
