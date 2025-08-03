import { CanvasManager } from '../canvas/CanvasManager.js';
import { MouseEventHandlers } from './MouseEventHandlers.js';
import { KeyboardHandlers } from './KeyboardHandlers.js';

/**
 * Manages application event listeners setup and cleanup
 */
export class AppEventManager {
  constructor(
    private canvasManager: CanvasManager,
    private mouseEventHandlers: MouseEventHandlers,
    private keyboardHandlers: KeyboardHandlers,
    private handleResize: () => void,
    private handleSelectionChanged: () => void,
  ) {}

  public setupEventListeners(): void {
    const canvas = this.canvasManager.getCanvas();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.keyboardHandlers.handleKeyDown);

    // Use capture phase to prevent event stopping propagation.
    canvas.addEventListener('mousedown', this.mouseEventHandlers.handleMouseDown, true);
    canvas.addEventListener('mousemove', this.mouseEventHandlers.handleMouseMove, true);
    canvas.addEventListener('mouseup', this.mouseEventHandlers.handleMouseUp, true);

    document.addEventListener('selectionChanged', this.handleSelectionChanged);
  }

  public removeEventListeners(): void {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.keyboardHandlers.handleKeyDown);
    const canvas = this.canvasManager.getCanvas();
    canvas.removeEventListener('mousedown', this.mouseEventHandlers.handleMouseDown, true);
    canvas.removeEventListener('mousemove', this.mouseEventHandlers.handleMouseMove, true);
    canvas.removeEventListener('mouseup', this.mouseEventHandlers.handleMouseUp, true);
    document.removeEventListener('selectionChanged', this.handleSelectionChanged);
  }
}
