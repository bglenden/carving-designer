import { Point } from '../../core/types.js';
import { CanvasManager } from '../../canvas/CanvasManager.js';
import { BackgroundImageHandler } from '../../background/BackgroundImageHandler.js';
import { BaseMouseHandlerStrategy } from './MouseHandlerStrategy.js';

/**
 * Handles mouse events when in background image mode
 */
export class BackgroundMouseHandler extends BaseMouseHandlerStrategy {
  constructor(
    canvasManager: CanvasManager,
    private backgroundImageHandler: BackgroundImageHandler,
  ) {
    super(canvasManager);
  }

  handleMouseDown(_screenPos: Point, worldPos: Point, event: MouseEvent): boolean {
    if (event.button !== 0) return false;

    const handled = this.backgroundImageHandler.handleMouseDown(
      worldPos,
      this.canvasManager.getScale(),
    );

    if (handled) {
      this.canvasManager.render();
      return true;
    }

    return false;
  }

  handleMouseMove(_screenPos: Point, worldPos: Point, _event: MouseEvent): boolean {
    const handled = this.backgroundImageHandler.handleMouseMove(
      worldPos,
      this.canvasManager.getScale(),
    );

    if (handled) {
      this.canvasManager.render();
      return true;
    }

    return false;
  }

  handleMouseUp(_screenPos: Point, _worldPos: Point, _event: MouseEvent): boolean {
    this.backgroundImageHandler.handleMouseUp();
    this.canvasManager.render();
    return true;
  }
}
