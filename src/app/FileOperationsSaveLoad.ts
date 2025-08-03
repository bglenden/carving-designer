import { BaseShape } from '../shapes/BaseShape.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { PersistenceManager, DesignData } from '../persistence/PersistenceManager.js';
import { SelectionManager } from '../core/SelectionManager.js';
import { BackgroundImageManager } from '../background/BackgroundImageManager.js';

export class FileOperationsSaveLoad {
  constructor(
    private canvasManager: CanvasManager,
    private persistenceManager: PersistenceManager,
    private selectionManager: SelectionManager,
    private backgroundImageManager?: BackgroundImageManager,
  ) {}

  public async handleSaveDesign(saveAs = false): Promise<void> {
    try {
      const designData: DesignData = {
        shapes: this.canvasManager.getShapes().map((shape) => shape.toJSON()),
        backgroundImages: this.backgroundImageManager?.toJSON() || [],
        version: '2.0',
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          description: 'CNC chip carving design',
        },
      };
      await this.persistenceManager.save(designData, saveAs);
      document.dispatchEvent(
        new CustomEvent('showStatus', {
          detail: { message: 'Design saved successfully.', duration: 3000 },
        }),
      );
    } catch (error) {
      console.error('Failed to save design:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      document.dispatchEvent(
        new CustomEvent('showStatus', {
          detail: { message: `Error saving design: ${message}`, isError: true },
        }),
      );
    }
  }

  public async handleLoadDesign(): Promise<void> {
    try {
      const designData = await this.persistenceManager.load();
      this.canvasManager.setShapes(designData.shapes as BaseShape[]);

      // Load background images if available
      if (this.backgroundImageManager && designData.backgroundImages.length > 0) {
        this.backgroundImageManager.fromJSON(designData.backgroundImages);
      }

      this.selectionManager.clear();

      // Show metadata info if available
      let statusMessage = 'Design loaded successfully.';
      if (designData.metadata?.name) {
        statusMessage = `Design "${designData.metadata.name}" loaded successfully.`;
      } else if (designData.metadata?.description) {
        statusMessage = `Design loaded: ${designData.metadata.description}`;
      }

      document.dispatchEvent(
        new CustomEvent('showStatus', {
          detail: { message: statusMessage, duration: 3000 },
        }),
      );
    } catch (error) {
      console.error('Failed to load design:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      document.dispatchEvent(
        new CustomEvent('showStatus', {
          detail: { message: `Error loading design: ${message}`, isError: true },
        }),
      );
    }
  }
}
