import { CanvasManager } from '../canvas/CanvasManager.js';
import { PersistenceManager } from '../persistence/PersistenceManager.js';
import { ToolbarManager } from '../ui/ToolbarManager.js';
import { PlacementManager, PlacementState } from '../core/PlacementManager.js';
import { SelectionManager } from '../core/SelectionManager.js';
import { TransformationManager } from '../core/TransformationManager.js';
import { BackgroundImageManager } from '../background/BackgroundImageManager.js';
import { BackgroundImageHandler } from '../background/BackgroundImageHandler.js';
import { AppModeManager } from './AppModeManager.js';

/**
 * Manages initialization and dependency injection for all application managers
 */
export class AppDependencyManager {
  public canvasManager: CanvasManager;
  public persistenceManager: PersistenceManager;
  public toolbarManager: ToolbarManager;
  public placementManager: PlacementManager;
  public selectionManager: SelectionManager;
  public transformationManager: TransformationManager;
  public backgroundImageManager: BackgroundImageManager;
  public backgroundImageHandler: BackgroundImageHandler;
  public appModeManager: AppModeManager;

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
    // Initialize managers, allowing for dependency injection in tests.
    // The order is important to resolve dependencies correctly.
    this.selectionManager = selectionManager || new SelectionManager();
    this.transformationManager = transformationManager || new TransformationManager();
    this.persistenceManager = persistenceManager || new PersistenceManager();
    this.backgroundImageManager = new BackgroundImageManager();
    this.canvasManager =
      canvasManager ||
      new CanvasManager(
        canvasElement,
        this.selectionManager,
        this.transformationManager,
        this.backgroundImageManager,
      );
    this.backgroundImageHandler = new BackgroundImageHandler(
      this.backgroundImageManager,
      this.canvasManager,
    );

    // Set background image handler if the method exists (backward compatibility for tests)
    if (typeof this.canvasManager.setBackgroundImageHandler === 'function') {
      this.canvasManager.setBackgroundImageHandler(this.backgroundImageHandler);
    }
    this.toolbarManager = toolbarManager || new ToolbarManager();

    // Create placement manager first, then mode manager
    this.placementManager =
      placementManager ||
      new PlacementManager(this.canvasManager, (state, shapeType) => {
        // This callback will be updated after mode manager is created
        if (this.appModeManager) {
          const isActive = state === PlacementState.PLACING_POINTS;
          this.appModeManager.setPlacementModeActive(isActive);

          document.dispatchEvent(
            new CustomEvent('placementModeChanged', {
              detail: { active: isActive, shape: shapeType },
            }),
          );
        }
      });

    // Initialize mode manager with all dependencies available
    this.appModeManager = new AppModeManager(
      this.canvasManager,
      this.placementManager,
      this.selectionManager,
      this.transformationManager,
    );
  }

  public destroyAll(): void {
    this.toolbarManager.destroy();
    this.canvasManager.destroy();
    this.placementManager.cleanup();
    this.selectionManager.cleanup();
    this.transformationManager.destroy();
  }
}
