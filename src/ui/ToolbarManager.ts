import { ShapeType } from '../core/types.js';
import { TransformMode } from '../core/TransformationManager.js';
import { StatusBarManager } from './StatusBarManager.js';

import { CallbackManager } from './toolbar/CallbackManager.js';
import { EventHandlers } from './toolbar/EventHandlers.js';
import { FileMenuManager } from './toolbar/FileMenuManager.js';
import { UIUpdater } from './toolbar/UIUpdater.js';
import { ToolbarSetup, ToolbarElements } from './toolbar/ToolbarSetup.js';
import { setButtonActive } from './toolbar/ButtonFactory.js';

export class ToolbarManager {
  private elements!: ToolbarElements;
  private statusBarManager: StatusBarManager;
  private callbackManager: CallbackManager;
  private eventHandlers!: EventHandlers;
  private fileMenuManager!: FileMenuManager;
  private uiUpdater!: UIUpdater;

  private boundHandlePlacementModeChange!: (event: Event) => void;
  private boundGlobalClickHandler!: (event: Event) => void;
  private boundHandleActiveShapeChanged!: (event: Event) => void;
  private boundHandleTransformModeChange!: (event: Event) => void;
  private boundHandleEditModeChange!: (event: Event) => void;
  private boundHandleBackgroundModeChange!: (event: Event) => void;
  private boundHandleCalibrationModeChange!: (event: Event) => void;

  constructor() {
    const primaryToolbar = document.getElementById('primary-toolbar') as HTMLElement;
    this.statusBarManager = new StatusBarManager();
    this.callbackManager = new CallbackManager();

    if (!primaryToolbar) {
      console.error('Primary toolbar element not found!');
      return;
    }

    this.fileMenuManager = new FileMenuManager(primaryToolbar, this.callbackManager);

    // Initialize event handlers first
    this.eventHandlers = new EventHandlers(this.statusBarManager, {
      updatePlacementUI: () => {
        // Will be replaced after UI setup
      },
      updateEditUI: () => {
        // Will be replaced after UI setup
      },
      updateTransformUI: () => {
        // Will be replaced after UI setup
      },
      updateShapeButtonStyles: () => {
        // Will be replaced after UI setup
      },
    });

    // Setup all toolbars
    this.elements = ToolbarSetup.setupAllToolbars(
      primaryToolbar,
      this.callbackManager,
      this.fileMenuManager,
      this.eventHandlers,
    );

    // Initialize UI updater with actual elements
    this.uiUpdater = new UIUpdater(
      {
        secondaryToolbar: this.elements.secondaryToolbar,
        editToolbar: this.elements.editToolbar,
        backgroundToolbar: this.elements.backgroundToolbar,
        addShapeBtn: this.elements.addShapeBtn,
        editBtn: this.elements.editBtn,
        backgroundBtn: this.elements.backgroundBtn,
        fileBtn: this.elements.fileBtn,
        leafBtn: this.elements.leafBtn,
        triArcBtn: this.elements.triArcBtn,
        moveBtn: this.elements.moveBtn,
        rotateBtn: this.elements.rotateBtn,
        mirrorBtn: this.elements.mirrorBtn,
        jiggleBtn: this.elements.jiggleBtn,
        calibrateBtn: this.elements.calibrateBtn,
      },
      setButtonActive,
      this.fileMenuManager.closeFileMenu.bind(this.fileMenuManager),
    );

    // Update event handlers with actual UI callbacks
    this.eventHandlers = new EventHandlers(this.statusBarManager, {
      updatePlacementUI: this.uiUpdater.updatePlacementUI.bind(this.uiUpdater),
      updateEditUI: this.uiUpdater.updateEditUI.bind(this.uiUpdater),
      updateTransformUI: this.uiUpdater.updateTransformUI.bind(this.uiUpdater),
      updateShapeButtonStyles: this.uiUpdater.updateShapeButtonStyles.bind(this.uiUpdater),
      updateBackgroundUI: this.uiUpdater.updateBackgroundUI.bind(this.uiUpdater),
      updateCalibrationUI: this.uiUpdater.updateCalibrationUI.bind(this.uiUpdater),
    });

    this.boundHandlePlacementModeChange = this.eventHandlers.handlePlacementModeChange.bind(
      this.eventHandlers,
    );
    this.boundHandleActiveShapeChanged = this.eventHandlers.handleActiveShapeChanged.bind(
      this.eventHandlers,
    );
    this.boundHandleTransformModeChange = this.eventHandlers.handleTransformModeChange.bind(
      this.eventHandlers,
    );
    this.boundHandleEditModeChange = this.eventHandlers.handleEditModeChange.bind(
      this.eventHandlers,
    );
    this.boundHandleBackgroundModeChange = this.eventHandlers.handleBackgroundModeChange.bind(
      this.eventHandlers,
    );
    this.boundHandleCalibrationModeChange = this.eventHandlers.handleCalibrationModeChange.bind(
      this.eventHandlers,
    );
    this.boundGlobalClickHandler = this.fileMenuManager.globalClickHandler.bind(
      this.fileMenuManager,
    );

    document.addEventListener('placementModeChanged', this.boundHandlePlacementModeChange);
    document.addEventListener('editModeChanged', this.boundHandleEditModeChange);
    document.addEventListener('backgroundModeChanged', this.boundHandleBackgroundModeChange);
    document.addEventListener('calibrationModeChanged', this.boundHandleCalibrationModeChange);
    document.addEventListener('transformModeChanged', this.boundHandleTransformModeChange);
    // Removed duplicate canvasMouseMove listener - StatusBarManager handles this directly
    document.addEventListener('activeShapeChanged', this.boundHandleActiveShapeChanged);
    document.addEventListener('click', this.boundGlobalClickHandler);

    this.fileMenuManager.createFileMenu();
    this.fileMenuManager.setUpdateFileMenuUI(this.uiUpdater.updateFileMenuUI.bind(this.uiUpdater));
  }

  // Callback setters - delegate to CallbackManager
  public setLoadDesignCallback(callback: () => void): void {
    this.callbackManager.setLoadDesignCallback(callback);
  }

  public setSaveDesignCallback(callback: () => void): void {
    this.callbackManager.setSaveDesignCallback(callback);
  }

  public setSaveAsDesignCallback(callback: () => void): void {
    this.callbackManager.setSaveAsDesignCallback(callback);
  }

  public setCreateShapeCallback(callback: (shapeType: ShapeType) => void): void {
    this.callbackManager.setCreateShapeCallback(callback);
  }

  public setTogglePlacementCallback(callback: () => void): void {
    this.callbackManager.setTogglePlacementCallback(callback);
  }

  public setToggleEditModeCallback(callback: () => void): void {
    this.callbackManager.setToggleEditModeCallback(callback);
  }

  public setMoveCallback(callback: () => void): void {
    this.callbackManager.setMoveCallback(callback);
  }

  public setRotateCallback(callback: () => void): void {
    this.callbackManager.setRotateCallback(callback);
  }

  public setMirrorCallback(callback: () => void): void {
    this.callbackManager.setMirrorCallback(callback);
  }

  public setJiggleCallback(callback: () => void): void {
    this.callbackManager.setJiggleCallback(callback);
  }

  public setDuplicateCallback(callback: () => void): void {
    this.callbackManager.setDuplicateCallback(callback);
  }

  public setDeleteAllCallback(callback: () => void): void {
    this.callbackManager.setDeleteAllCallback(callback);
  }

  public setToggleBackgroundModeCallback(callback: () => void): void {
    this.callbackManager.setToggleBackgroundModeCallback(callback);
  }

  public setLoadBackgroundImageCallback(callback: () => void): void {
    this.callbackManager.setLoadBackgroundImageCallback(callback);
  }

  public setCalibrateImageCallback(callback: () => void): void {
    this.callbackManager.setCalibrateImageCallback(callback);
  }

  public setBackgroundOpacityCallback(callback: (opacity: number) => void): void {
    this.callbackManager.setBackgroundOpacityCallback(callback);
  }

  public getCurrentTransformMode(): TransformMode {
    return this.eventHandlers.getCurrentTransformMode();
  }

  public destroy(): void {
    document.removeEventListener('placementModeChanged', this.boundHandlePlacementModeChange);
    document.removeEventListener('editModeChanged', this.boundHandleEditModeChange);
    document.removeEventListener('backgroundModeChanged', this.boundHandleBackgroundModeChange);
    document.removeEventListener('calibrationModeChanged', this.boundHandleCalibrationModeChange);
    document.removeEventListener('transformModeChanged', this.boundHandleTransformModeChange);
    // Removed duplicate canvasMouseMove listener - StatusBarManager handles this directly
    document.removeEventListener('activeShapeChanged', this.boundHandleActiveShapeChanged);
    document.removeEventListener('click', this.boundGlobalClickHandler);
  }

  public toggleFileMenu(): void {
    this.fileMenuManager.toggleFileMenu();
  }

  public closeFileMenu(): void {
    this.fileMenuManager.closeFileMenu();
  }

  public getFileMenu(): HTMLElement | null {
    return this.fileMenuManager.getFileMenu();
  }
}
