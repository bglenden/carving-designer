import { ShapeType } from './core/types.js';
import { MouseEventHandlers } from './app/MouseEventHandlers.js';
import { KeyboardHandlers } from './app/KeyboardHandlers.js';
import { FileOperations } from './app/FileOperations.js';
import { AppDependencyManager } from './app/AppDependencyManager.js';
import { AppModeManager } from './app/AppModeManager.js';
import { AppEventManager } from './app/AppEventManager.js';
import { AppToolbarManager } from './app/AppToolbarManager.js';
import { CanvasManager } from './canvas/CanvasManager.js';
import { PersistenceManager } from './persistence/PersistenceManager.js';
import { ToolbarManager } from './ui/ToolbarManager.js';
import { PlacementManager } from './core/PlacementManager.js';
import { SelectionManager } from './core/SelectionManager.js';
import { TransformationManager } from './core/TransformationManager.js';
import { BackgroundImageManager } from './background/BackgroundImageManager.js';
import { BackgroundImageHandler } from './background/BackgroundImageHandler.js';

export class App {
  private dependencyManager: AppDependencyManager;
  private modeManager: AppModeManager;
  private eventManager: AppEventManager;
  private toolbarManager: AppToolbarManager;
  private mouseEventHandlers: MouseEventHandlers;
  private keyboardHandlers: KeyboardHandlers;
  private fileOperations: FileOperations;

  constructor(
    canvasElement: HTMLCanvasElement,
    // Optional managers for dependency injection in tests
    canvasManager?: CanvasManager,
    selectionManager?: SelectionManager,
    transformationManager?: TransformationManager,
    persistenceManager?: PersistenceManager,
    toolbarManager?: ToolbarManager,
    placementManager?: PlacementManager,
  ) {
    // console.log('App: constructor start');

    // Initialize dependency manager with all core managers
    this.dependencyManager = new AppDependencyManager(
      canvasElement,
      canvasManager,
      selectionManager,
      transformationManager,
      persistenceManager,
      toolbarManager,
      placementManager,
    );

    // Get the mode manager from dependency manager
    this.modeManager = this.dependencyManager.appModeManager;

    // Initialize helper classes
    this.mouseEventHandlers = new MouseEventHandlers(
      this.dependencyManager.canvasManager,
      this.dependencyManager.placementManager,
      this.dependencyManager.selectionManager,
      this.dependencyManager.transformationManager,
      () => this.modeManager.isInEditMode(),
      this.dependencyManager.backgroundImageHandler,
      () => this.modeManager.isInBackgroundMode(),
    );

    this.keyboardHandlers = new KeyboardHandlers(
      this.dependencyManager.canvasManager,
      this.dependencyManager.placementManager,
      this.dependencyManager.selectionManager,
      this.dependencyManager.transformationManager,
      () => this.modeManager.isInEditMode(),
      () => this.modeManager.isInPlacementMode(),
      this.dependencyManager.backgroundImageHandler,
      () => this.modeManager.isInBackgroundMode(),
    );

    this.fileOperations = new FileOperations(
      this.dependencyManager.canvasManager,
      this.dependencyManager.persistenceManager,
      this.dependencyManager.selectionManager,
      this.dependencyManager.backgroundImageManager,
    );

    // Initialize event manager
    this.eventManager = new AppEventManager(
      this.dependencyManager.canvasManager,
      this.mouseEventHandlers,
      this.keyboardHandlers,
      this.handleResize,
      this.handleSelectionChanged,
    );

    // Initialize toolbar manager
    this.toolbarManager = new AppToolbarManager(
      this.dependencyManager.toolbarManager,
      this.dependencyManager.transformationManager,
      this.fileOperations,
      this.keyboardHandlers,
      this.modeManager,
      this.dependencyManager.canvasManager,
      this.dependencyManager.selectionManager,
      this.dependencyManager.backgroundImageHandler,
      this.dependencyManager.backgroundImageManager,
    );
    // console.log('App: constructor end');
  }

  public initialize(): void {
    // // console.log('App: initialize start');
    this.eventManager.setupEventListeners();
    this.toolbarManager.setupToolbar();
    this.dependencyManager.canvasManager.handleResize();
    // Load from localStorage if present
    this.fileOperations.loadFromLocalStorage();
    // Listen for shape changes to autosave
    this.fileOperations.setupAutosave();
  }

  public destroy(): void {
    this.eventManager.removeEventListeners();
    this.dependencyManager.destroyAll();
  }

  private handleResize = (): void => {
    // console.log('App: handleResize');
    this.dependencyManager.canvasManager.handleResize();
  };

  private handleSelectionChanged = (): void => {
    this.dependencyManager.canvasManager.draw();
  };

  public startPlacementMode(shapeType: ShapeType): void {
    this.modeManager.startPlacementMode(shapeType);
  }

  public togglePlacementMode(): void {
    this.modeManager.togglePlacementMode();
  }

  public toggleEditMode(): void {
    this.modeManager.toggleEditMode();
  }

  public toggleBackgroundMode(): void {
    this.modeManager.toggleBackgroundMode();
  }

  // Expose methods for external access (needed by existing code)
  public async handleSaveDesign(saveAs = false): Promise<void> {
    return this.fileOperations.handleSaveDesign(saveAs);
  }

  public async handleLoadDesign(): Promise<void> {
    return this.fileOperations.handleLoadDesign();
  }

  public clearDesign(): void {
    this.fileOperations.clearDesign();
  }

  // Method for tests
  public handleDuplicate(): void {
    this.keyboardHandlers.handleDuplicate();
  }

  // Expose for tests
  public get _mouseEventHandlers(): MouseEventHandlers {
    return this.mouseEventHandlers;
  }

  // Expose managers for backward compatibility
  public get canvasManager(): CanvasManager {
    return this.dependencyManager.canvasManager;
  }

  public get selectionManager(): SelectionManager {
    return this.dependencyManager.selectionManager;
  }

  public get transformationManager(): TransformationManager {
    return this.dependencyManager.transformationManager;
  }

  public get placementManager(): PlacementManager {
    return this.dependencyManager.placementManager;
  }

  public get persistenceManager(): PersistenceManager {
    return this.dependencyManager.persistenceManager;
  }

  public get backgroundImageManager(): BackgroundImageManager {
    return this.dependencyManager.backgroundImageManager;
  }

  public get backgroundImageHandler(): BackgroundImageHandler {
    return this.dependencyManager.backgroundImageHandler;
  }
}
