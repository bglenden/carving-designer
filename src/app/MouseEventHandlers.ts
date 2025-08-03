import { Point } from '../core/types.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { PlacementManager } from '../core/PlacementManager.js';
import { SelectionManager } from '../core/SelectionManager.js';
import { TransformationManager } from '../core/TransformationManager.js';
import { BackgroundImageHandler } from '../background/BackgroundImageHandler.js';
import {
  BackgroundMouseHandler,
  EditModeMouseHandler,
  PlacementMouseHandler,
} from './mouse/index.js';

export class MouseEventHandlers {
  private backgroundHandler: BackgroundMouseHandler;
  private editModeHandler: EditModeMouseHandler;
  private placementHandler: PlacementMouseHandler;

  constructor(
    private canvasManager: CanvasManager,
    placementManager: PlacementManager,
    selectionManager: SelectionManager,
    transformationManager: TransformationManager,
    private isEditMode: () => boolean,
    backgroundImageHandler: BackgroundImageHandler,
    private isBackgroundMode: () => boolean,
  ) {
    this.backgroundHandler = new BackgroundMouseHandler(canvasManager, backgroundImageHandler);
    this.editModeHandler = new EditModeMouseHandler(
      canvasManager,
      selectionManager,
      transformationManager,
    );
    this.placementHandler = new PlacementMouseHandler(canvasManager, placementManager);
  }

  // Expose for tests
  public _setDragState(isDragging: boolean, hasDragged: boolean, dragStartPoint: Point): void {
    this.editModeHandler._setDragState(isDragging, hasDragged, dragStartPoint);
  }

  public handleMouseDown = (event: MouseEvent): void => {
    // If placement manager is active, it handles its own events. App should ignore.
    if (this.placementHandler.isPlacing()) {
      return;
    }

    const { screenPos, worldPos } = this.getEventPositions(event);

    // Try handlers in priority order
    if (this.isBackgroundMode()) {
      if (this.backgroundHandler.handleMouseDown(screenPos, worldPos, event)) {
        return;
      }
    }

    if (this.isEditMode()) {
      this.editModeHandler.handleMouseDown(screenPos, worldPos, event);
    }
  };

  public handleMouseMove = (event: MouseEvent): void => {
    // If placement manager is active, it handles its own events. App should ignore.
    if (this.placementHandler.isPlacing()) {
      return;
    }

    const { screenPos, worldPos } = this.getEventPositions(event);

    // Try handlers in priority order
    if (this.isBackgroundMode()) {
      if (this.backgroundHandler.handleMouseMove(screenPos, worldPos, event)) {
        return;
      }
    }

    if (this.isEditMode()) {
      this.editModeHandler.handleMouseMove(screenPos, worldPos, event);
    }
  };

  public handleMouseUp = (event: MouseEvent): void => {
    const { screenPos, worldPos } = this.getEventPositions(event);

    // Handle background mode first
    if (this.isBackgroundMode()) {
      this.backgroundHandler.handleMouseUp(screenPos, worldPos, event);
    }

    // Handle edit mode
    if (this.isEditMode()) {
      this.editModeHandler.handleMouseUp(screenPos, worldPos, event);
    }
  };

  private getEventPositions(event: MouseEvent): { screenPos: Point; worldPos: Point } {
    const rect = this.canvasManager.getCanvas().getBoundingClientRect();
    const screenPos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const worldPos = this.canvasManager.screenToWorld(screenPos);
    return { screenPos, worldPos };
  }
}
