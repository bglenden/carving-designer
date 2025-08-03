import { CanvasManager } from '../canvas/CanvasManager.js';
import { DesignData } from '../persistence/PersistenceManager.js';
import { BackgroundImageManager } from '../background/BackgroundImageManager.js';
import { FileOperationsStorage } from './FileOperationsStorage.js';

export class FileOperationsAutosave {
  private storage: FileOperationsStorage;

  constructor(
    private canvasManager: CanvasManager,
    private backgroundImageManager?: BackgroundImageManager,
  ) {
    this.storage = new FileOperationsStorage(canvasManager, backgroundImageManager);
  }

  public setupAutosave(): void {
    // Clean up storage on initialization
    this.storage.cleanupLocalStorage();

    const save = () => {
      try {
        const saveStartTime = performance.now();
        console.log('[PERF] Autosave started');

        const designData: DesignData = {
          shapes: this.canvasManager.getShapes().map((s: any) => (s.toJSON ? s.toJSON() : s)),
          backgroundImages: this.backgroundImageManager?.toJSON() || [],
          version: '2.0',
          metadata: {
            modified: new Date().toISOString(),
            description: 'CNC chip carving design (autosave)',
          },
        };

        const jsonStartTime = performance.now();
        const json = JSON.stringify(designData);
        const jsonEndTime = performance.now();
        console.log(`[PERF] JSON.stringify took ${(jsonEndTime - jsonStartTime).toFixed(2)}ms`);

        // Check if the data is too large and handle gracefully
        const sizeInMB = new Blob([json]).size / (1024 * 1024);
        console.log(`Autosave data size: ${sizeInMB.toFixed(2)}MB`);

        // Check actual localStorage usage and limits
        let totalStorageUsed = 0;
        for (const key in localStorage) {
          if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            totalStorageUsed += new Blob([localStorage[key]]).size;
          }
        }
        const totalUsedMB = totalStorageUsed / (1024 * 1024);
        console.log(`Total localStorage usage: ${totalUsedMB.toFixed(2)}MB`);

        // Always try to save the full data - localStorage limits vary by browser (5-10MB typically)
        const setItemStartTime = performance.now();
        window.localStorage.setItem('cnc_design_autosave', json);
        const setItemEndTime = performance.now();
        console.log(
          `[PERF] localStorage.setItem took ${(setItemEndTime - setItemStartTime).toFixed(2)}ms`,
        );

        const totalSaveTime = performance.now() - saveStartTime;
        console.log(`[PERF] Total autosave took ${totalSaveTime.toFixed(2)}ms`);
        console.log('Successfully saved complete design to localStorage');
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded');
          document.dispatchEvent(
            new CustomEvent('showStatus', {
              detail: {
                message:
                  'Browser storage full - unable to auto-save. Use File → Save to preserve your work.',
                isError: true,
                duration: 8000,
              },
            }),
          );
        } else {
          console.error('Autosave to localStorage failed:', e);
        }
      }
    };
    // Patch CanvasManager methods to call save
    const origAdd = this.canvasManager.addShape.bind(this.canvasManager) as (
      ...args: unknown[]
    ) => void;
    this.canvasManager.addShape = (...args: unknown[]) => {
      origAdd(...args);
      save();
    };
    const origRemove = this.canvasManager.removeShapes.bind(this.canvasManager) as (
      ...args: unknown[]
    ) => void;
    this.canvasManager.removeShapes = (...args: unknown[]) => {
      origRemove(...args);
      save();
    };
    const origSet = this.canvasManager.setShapes.bind(this.canvasManager) as (
      ...args: unknown[]
    ) => void;
    this.canvasManager.setShapes = (...args: unknown[]) => {
      origSet(...args);
      save();
    };

    // Patch BackgroundImageManager methods to call save
    if (this.backgroundImageManager) {
      const origAddImage = this.backgroundImageManager.addImage.bind(
        this.backgroundImageManager,
      ) as (...args: unknown[]) => any;
      this.backgroundImageManager.addImage = (...args: unknown[]) => {
        const result = origAddImage(...args);
        // Don't autosave immediately here - wait for image to be fully loaded and positioned
        return result;
      };

      const origRemoveImage = this.backgroundImageManager.removeImage.bind(
        this.backgroundImageManager,
      ) as (...args: unknown[]) => void;
      this.backgroundImageManager.removeImage = (...args: unknown[]) => {
        origRemoveImage(...args);
        save();
      };

      // Listen for background image changes to trigger autosave
      document.addEventListener('backgroundImageChanged', () => {
        console.log('Background image changed, triggering autosave');
        save();
      });
    }

    // Listen for shape modifications to trigger autosave (e.g., jiggle, manual transformations)
    document.addEventListener('shapesModified', () => {
      console.log('Shapes modified, triggering autosave');
      save();
    });
  }

  public loadFromLocalStorage(): void {
    this.storage.loadFromLocalStorage();
  }
}
