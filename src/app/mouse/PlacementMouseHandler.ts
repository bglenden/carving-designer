import { Point } from '../../core/types.js';
import { CanvasManager } from '../../canvas/CanvasManager.js';
import { PlacementManager } from '../../core/PlacementManager.js';
import { BaseMouseHandlerStrategy } from './MouseHandlerStrategy.js';

/**
 * Handles mouse events when in placement mode (shape creation)
 */
export class PlacementMouseHandler extends BaseMouseHandlerStrategy {
  constructor(canvasManager: CanvasManager, private placementManager: PlacementManager) {
    super(canvasManager);
  }

  handleMouseDown(_screenPos: Point, _worldPos: Point, _event: MouseEvent): boolean {
    // Placement manager handles its own events, app should ignore
    // Return false to indicate we didn't handle it
    return false;
  }

  handleMouseMove(_screenPos: Point, _worldPos: Point, _event: MouseEvent): boolean {
    // Placement manager handles its own events, app should ignore
    // Return false to indicate we didn't handle it
    return false;
  }

  handleMouseUp(_screenPos: Point, _worldPos: Point, _event: MouseEvent): boolean {
    // Placement manager handles its own events, app should ignore
    // Return false to indicate we didn't handle it
    return false;
  }

  public isPlacing(): boolean {
    return this.placementManager.isPlacing();
  }
}
