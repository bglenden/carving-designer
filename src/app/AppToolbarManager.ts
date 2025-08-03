import { ToolbarManager } from '../ui/ToolbarManager.js';
import { TransformationManager } from '../core/TransformationManager.js';
import { FileOperations } from './FileOperations.js';
import { KeyboardHandlers } from './KeyboardHandlers.js';
import { AppModeManager } from './AppModeManager.js';
import { ShapeType } from '../core/types.js';
import { BaseShape } from '../shapes/BaseShape.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { SelectionManager } from '../core/SelectionManager.js';
import {
  BackgroundImageHandler,
  BackgroundImageMode,
} from '../background/BackgroundImageHandler.js';
import { BackgroundImageManager } from '../background/BackgroundImageManager.js';

/**
 * Manages toolbar callback setup and coordination
 */
export class AppToolbarManager {
  constructor(
    private toolbarManager: ToolbarManager,
    private transformationManager: TransformationManager,
    private fileOperations: FileOperations,
    private keyboardHandlers: KeyboardHandlers,
    private appModeManager: AppModeManager,
    private canvasManager: CanvasManager,
    private selectionManager: SelectionManager,
    private backgroundImageHandler: BackgroundImageHandler,
    private backgroundImageManager: BackgroundImageManager,
  ) {}

  public setupToolbar(): void {
    this.toolbarManager.setLoadDesignCallback(() => this.fileOperations.handleLoadDesign());
    this.toolbarManager.setSaveDesignCallback(() => this.fileOperations.handleSaveDesign(false));
    this.toolbarManager.setSaveAsDesignCallback(() => this.fileOperations.handleSaveDesign(true));
    this.toolbarManager.setCreateShapeCallback((shapeType: ShapeType) => {
      // console.log('[App.ts][placement-debug] createShapeCallback called with', shapeType);
      this.appModeManager.startPlacementMode(shapeType);
    });
    this.toolbarManager.setTogglePlacementCallback(() => this.appModeManager.togglePlacementMode());
    this.toolbarManager.setToggleEditModeCallback(() => this.appModeManager.toggleEditMode());
    this.toolbarManager.setMoveCallback(() => this.transformationManager.enterMoveMode());
    this.toolbarManager.setRotateCallback(() => this.transformationManager.enterRotateMode());
    this.toolbarManager.setMirrorCallback(() => this.transformationManager.enterMirrorMode());
    this.toolbarManager.setJiggleCallback(() => this.transformationManager.enterJiggleMode());
    this.toolbarManager.setDuplicateCallback(this.keyboardHandlers.handleDuplicate);
    this.toolbarManager.setDeleteAllCallback(() => this.fileOperations.clearDesign());

    // Set up selection callbacks for transformation manager (mirror functionality)
    this.transformationManager.setSelectionCallbacks(
      () => this.selectionManager.get(),
      (shapes: BaseShape[]) => {
        // Add shapes to canvas and select them
        shapes.forEach((shape) => {
          this.canvasManager.addShape(shape);
          this.selectionManager.add(shape);
        });
        this.canvasManager.render();
      },
    );

    // Background image callbacks (optional for backward compatibility)
    if (this.toolbarManager.setToggleBackgroundModeCallback) {
      this.toolbarManager.setToggleBackgroundModeCallback(() =>
        this.appModeManager.toggleBackgroundMode(),
      );
    }
    if (this.toolbarManager.setLoadBackgroundImageCallback) {
      this.toolbarManager.setLoadBackgroundImageCallback(() =>
        this.backgroundImageHandler.loadImage(),
      );
    }
    if (this.toolbarManager.setCalibrateImageCallback) {
      this.toolbarManager.setCalibrateImageCallback(() => {
        this.backgroundImageHandler.setMode(BackgroundImageMode.CALIBRATING);
      });
    }
    if (this.toolbarManager.setBackgroundOpacityCallback) {
      this.toolbarManager.setBackgroundOpacityCallback((opacity: number) => {
        this.backgroundImageManager.setGlobalOpacity(opacity);
        this.canvasManager.render();
      });
    }
  }
}
