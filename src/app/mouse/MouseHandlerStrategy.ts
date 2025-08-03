import { Point } from '../../core/types.js';
import { CanvasManager } from '../../canvas/CanvasManager.js';

/**
 * Strategy interface for different mouse interaction modes
 */
export interface MouseHandlerStrategy {
  handleMouseDown(screenPos: Point, worldPos: Point, event: MouseEvent): boolean;
  handleMouseMove(screenPos: Point, worldPos: Point, event: MouseEvent): boolean;
  handleMouseUp(screenPos: Point, worldPos: Point, event: MouseEvent): boolean;
}

/**
 * Base class providing common functionality for mouse handler strategies
 */
export abstract class BaseMouseHandlerStrategy implements MouseHandlerStrategy {
  protected isDragging = false;
  protected hasDragged = false;
  protected dragStartPoint: Point = { x: 0, y: 0 };

  constructor(protected canvasManager: CanvasManager) {}

  protected setDragState(isDragging: boolean, hasDragged: boolean, dragStartPoint: Point): void {
    this.isDragging = isDragging;
    this.hasDragged = hasDragged;
    this.dragStartPoint = dragStartPoint;
  }

  protected resetDragState(): void {
    this.isDragging = false;
    this.hasDragged = false;
  }

  abstract handleMouseDown(screenPos: Point, worldPos: Point, event: MouseEvent): boolean;
  abstract handleMouseMove(screenPos: Point, worldPos: Point, event: MouseEvent): boolean;
  abstract handleMouseUp(screenPos: Point, worldPos: Point, event: MouseEvent): boolean;
}
