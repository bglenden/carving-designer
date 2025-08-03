import { BaseShape } from '../shapes/BaseShape.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { createShape } from '../shapes/ShapeFactory.js';
import { BackgroundImageManager } from '../background/BackgroundImageManager.js';

export class FileOperationsStorage {
  constructor(
    private canvasManager: CanvasManager,
    private backgroundImageManager?: BackgroundImageManager,
  ) {}

  public loadFromLocalStorage(): void {
    const startTime = performance.now();
    console.log('[PERF] loadFromLocalStorage started');

    const saved = window.localStorage.getItem('cnc_design_autosave');
    const getItemTime = performance.now();
    console.log(`[PERF] localStorage.getItem took ${(getItemTime - startTime).toFixed(2)}ms`);
    console.log(
      'loadFromLocalStorage called, saved data:',
      saved ? `found (${(saved.length / 1024).toFixed(1)}KB)` : 'not found',
    );

    if (saved) {
      try {
        const parseStartTime = performance.now();
        const data = JSON.parse(saved);
        const parseEndTime = performance.now();
        console.log(`[PERF] JSON.parse took ${(parseEndTime - parseStartTime).toFixed(2)}ms`);
        console.log('Loading from localStorage:', data);

        // Handle both old format (just shapes array) and new format (DesignData object)
        let shapes: BaseShape[] = [];
        let hasBackgroundImages = false;

        if (Array.isArray(data)) {
          // Old format - just shapes
          if (data.length > 0) {
            shapes = data.map((d: any) => createShape(d));
          }
        } else {
          // New format - DesignData object
          if (data.shapes && Array.isArray(data.shapes)) {
            shapes = data.shapes.map((d: any) => createShape(d));
          }

          // Load background images if available
          if (
            this.backgroundImageManager &&
            data.backgroundImages &&
            Array.isArray(data.backgroundImages) &&
            data.backgroundImages.length > 0
          ) {
            const bgRestoreStartTime = performance.now();
            console.log(
              `[PERF] Starting background image restore: ${data.backgroundImages.length} images`,
            );
            console.log('Restoring background images:', data.backgroundImages);
            this.backgroundImageManager.fromJSON(data.backgroundImages);
            hasBackgroundImages = true;
            const bgRestoreEndTime = performance.now();
            console.log(
              `[PERF] Background image restore took ${(
                bgRestoreEndTime - bgRestoreStartTime
              ).toFixed(2)}ms`,
            );
            console.log(
              'Background images after restore:',
              this.backgroundImageManager.getImages(),
            );
          }
        }

        if (shapes.length > 0 || hasBackgroundImages) {
          const setShapesStartTime = performance.now();
          this.canvasManager.setShapes(shapes);
          const setShapesEndTime = performance.now();
          console.log(
            `[PERF] setShapes took ${(setShapesEndTime - setShapesStartTime).toFixed(2)}ms`,
          );

          // Force a render to ensure background images are visible
          const renderStartTime = performance.now();
          this.canvasManager.render();
          const renderEndTime = performance.now();
          console.log(`[PERF] render took ${(renderEndTime - renderStartTime).toFixed(2)}ms`);

          const totalTime = performance.now() - startTime;
          console.log(`[PERF] Total loadFromLocalStorage took ${totalTime.toFixed(2)}ms`);

          document.dispatchEvent(
            new CustomEvent('showStatus', {
              detail: { message: 'Design auto-restored from browser storage.', duration: 3000 },
            }),
          );
        }
      } catch (e) {
        console.error('Failed to load autosaved design from localStorage:', e);
      }
    }
  }

  public cleanupLocalStorage(): void {
    try {
      console.log('Cleaning up localStorage...');

      // List of keys to keep (only our current autosave)
      const keepKeys = ['cnc_design_autosave'];

      // Get all localStorage keys
      const allKeys = Object.keys(localStorage);
      console.log('Found localStorage keys:', allKeys);

      // Remove any old/unknown keys that might be taking up space
      let removedCount = 0;
      let freedSpace = 0;

      for (const key of allKeys) {
        if (!keepKeys.includes(key)) {
          const value = localStorage.getItem(key);
          if (value) {
            freedSpace += new Blob([value]).size;
          }
          localStorage.removeItem(key);
          removedCount++;
          console.log(`Removed localStorage key: ${key}`);
        }
      }

      console.log(
        `Cleanup complete: removed ${removedCount} items, freed ${(
          freedSpace /
          (1024 * 1024)
        ).toFixed(2)}MB`,
      );

      if (removedCount > 0) {
        document.dispatchEvent(
          new CustomEvent('showStatus', {
            detail: {
              message: `Storage cleanup: removed ${removedCount} old items, freed ${(
                freedSpace /
                (1024 * 1024)
              ).toFixed(1)}MB`,
              duration: 4000,
            },
          }),
        );
      }
    } catch (e) {
      console.error('Storage cleanup failed:', e);
    }
  }
}
