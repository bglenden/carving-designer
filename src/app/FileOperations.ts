import { CanvasManager } from '../canvas/CanvasManager.js';
import { PersistenceManager } from '../persistence/PersistenceManager.js';
import { SelectionManager } from '../core/SelectionManager.js';
import { BackgroundImageManager } from '../background/BackgroundImageManager.js';
import { FileOperationsSaveLoad } from './FileOperationsSaveLoad.js';
import { FileOperationsAutosave } from './FileOperationsAutosave.js';

export class FileOperations {
  private saveLoad: FileOperationsSaveLoad;
  private autosave: FileOperationsAutosave;

  constructor(
    private canvasManager: CanvasManager,
    persistenceManager: PersistenceManager,
    private selectionManager: SelectionManager,
    private backgroundImageManager?: BackgroundImageManager,
  ) {
    this.saveLoad = new FileOperationsSaveLoad(
      canvasManager,
      persistenceManager,
      selectionManager,
      backgroundImageManager,
    );
    this.autosave = new FileOperationsAutosave(canvasManager, backgroundImageManager);
  }

  public async handleSaveDesign(saveAs = false): Promise<void> {
    return this.saveLoad.handleSaveDesign(saveAs);
  }

  public async handleLoadDesign(): Promise<void> {
    return this.saveLoad.handleLoadDesign();
  }

  public loadFromLocalStorage(): void {
    this.autosave.loadFromLocalStorage();
  }

  public setupAutosave(): void {
    this.autosave.setupAutosave();
  }

  public clearDesign(): void {
    this.canvasManager.setShapes([]);

    // Clear background images too
    if (this.backgroundImageManager) {
      this.backgroundImageManager.clear();
    }

    window.localStorage.removeItem('cnc_design_autosave');
    this.selectionManager.clear();
    document.dispatchEvent(
      new CustomEvent('showStatus', {
        detail: {
          message: 'All shapes and background images deleted and autosave cleared.',
          duration: 3000,
        },
      }),
    );
  }
}
