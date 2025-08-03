import { BaseShape } from '../shapes/BaseShape.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { PlacementManager } from '../core/PlacementManager.js';
import { SelectionManager } from '../core/SelectionManager.js';
import { TransformationManager } from '../core/TransformationManager.js';
import { BackgroundImageHandler } from '../background/BackgroundImageHandler.js';

export class KeyboardHandlers {
  private clipboard: BaseShape[] = [];

  constructor(
    private canvasManager: CanvasManager,
    private placementManager: PlacementManager,
    private selectionManager: SelectionManager,
    private transformationManager: TransformationManager,
    private isEditMode: () => boolean,
    private isPlacementModeActive: () => boolean,
    private backgroundImageHandler: BackgroundImageHandler,
    private isBackgroundMode: () => boolean,
  ) {}

  public handleKeyDown = (event: KeyboardEvent): void => {
    // console.log('App: handleKeyDown', event.key);

    // Handle background mode keys first
    if (this.isBackgroundMode()) {
      const handled = this.backgroundImageHandler.handleKeyDown(event);
      if (handled) {
        this.canvasManager.render();
        return;
      }
    }

    // Handle destructive actions first
    if ((event.key === 'Delete' || event.key === 'Backspace') && this.isEditMode()) {
      const selectedShapes = this.selectionManager.get();
      if (selectedShapes.size > 0) {
        this.canvasManager.removeShapes(Array.from(selectedShapes));
        this.selectionManager.clear();
      }
      return; // Prevent other handlers from firing
    }

    if (event.key === 'Escape') {
      if (this.isPlacementModeActive()) {
        this.placementManager.cancelPlacement();
      } else if (this.transformationManager.isTransforming()) {
        this.transformationManager.exitCurrentMode(); // Corrected method call
      } else {
        this.selectionManager.clear();
      }
      this.canvasManager.draw();
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCtrlKey = isMac ? event.metaKey : event.ctrlKey;

    if (isCtrlKey && event.key === 'c') {
      event.preventDefault();
      this.handleCopy();
    }

    if (isCtrlKey && event.key === 'v') {
      event.preventDefault();
      this.handlePaste();
    }

    if (isCtrlKey && event.key === 'a') {
      event.preventDefault();
      this.handleSelectAll();
    }
  };

  private handleCopy = (): void => {
    const selectedShapes = this.selectionManager.get();
    if (selectedShapes.size === 0) return;

    this.clipboard = Array.from(selectedShapes);
  };

  private handlePaste = (): void => {
    if (this.clipboard.length === 0) return;

    const newShapes: BaseShape[] = [];
    const offset = 5; // Offset for visibility

    for (const shape of this.clipboard) {
      const newShape = shape.clone() as BaseShape;
      newShape.move({ x: offset, y: offset });
      this.canvasManager.addShape(newShape); // This triggers autosave via patched method
      newShapes.push(newShape);
    }

    this.selectionManager.clear();
    for (const shape of newShapes) {
      this.selectionManager.add(shape);
    }

    this.canvasManager.draw();
  };

  private handleSelectAll = (): void => {
    // Only work in edit mode
    if (!this.isEditMode()) return;

    // Get all shapes from the canvas
    const allShapes = this.canvasManager.getShapes();

    // Clear current selection
    this.selectionManager.clear();

    // Add all shapes to selection
    for (const shape of allShapes) {
      this.selectionManager.add(shape);
    }

    // Redraw to show the new selection
    this.canvasManager.draw();
  };

  public handleDuplicate = (): void => {
    this.handleCopy();
    this.handlePaste();
  };
}
