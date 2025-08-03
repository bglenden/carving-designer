import { Point } from '../core/types.js';
import { CanvasManager } from './CanvasManager.js';

export class CanvasEvents {
  private manager: CanvasManager;

  constructor(manager: CanvasManager) {
    this.manager = manager;
  }

  public handleCanvasClick(screenPos: Point): void {
    const worldPos = this.manager.screenToWorld(screenPos);
    if (this.manager.getPlacementMode()) {
      document.dispatchEvent(new CustomEvent('placementClick', { detail: { worldPos } }));
      return;
    }
    document.dispatchEvent(new CustomEvent('canvasClick', { detail: { worldPos } }));
  }

  public setupCanvas(): void {
    this.manager.resizeCanvas();
    this.manager.drawing.draw();
  }

  public handleResize(): void {
    this.manager.resizeCanvas();
    this.manager.drawing.draw();
  }
}
