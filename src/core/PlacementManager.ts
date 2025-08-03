import { Point, ShapeType } from './types.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { createShapeFromPoints } from '../shapes/ShapeFactory.js';
import { StatefulManager } from './StatefulManager.js';

export enum PlacementState {
  IDLE,
  PLACING_POINTS,
  PLACING = PLACING_POINTS,
  PLACED,
  CANCELLED,
}

export class PlacementManager extends StatefulManager<PlacementState> {
  private shapeType: ShapeType | null = null;
  private placementPoints: Point[] = [];
  private pointsNeeded = 0;

  private canvasManager: CanvasManager;
  private onStateChangeCallback:
    | ((state: PlacementState, shapeType: ShapeType | null) => void)
    | null = null;

  private boundHandleMouseDown: (e: MouseEvent) => void;
  private boundHandleMouseMove: (e: MouseEvent) => void;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;

  constructor(
    canvasManager: CanvasManager,
    onStateChange?: (state: PlacementState, shapeType: ShapeType | null) => void,
  ) {
    super(PlacementState.IDLE);
    this.canvasManager = canvasManager;
    this.onStateChangeCallback = onStateChange || null;

    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
  }

  protected onInitialize(): void {
    // Setup any initial state if needed
  }

  protected onCleanup(): void {
    this.removeEventListeners();
  }

  protected onStateEnter(state: PlacementState, _previousState: PlacementState): void {
    console.log(`[PlacementManager] Entering state: ${PlacementState[state]}`);

    switch (state) {
      case PlacementState.PLACING_POINTS:
        this.addEventListeners();
        break;
      case PlacementState.IDLE:
      case PlacementState.PLACED:
      case PlacementState.CANCELLED:
        this.removeEventListeners();
        break;
    }

    // Notify external callback
    this.onStateChangeCallback?.(state, this.shapeType);
  }

  protected onStateExit(state: PlacementState): void {
    console.log(`[PlacementManager] Exiting state: ${PlacementState[state]}`);
  }

  protected canTransitionTo(newState: PlacementState, currentState: PlacementState): boolean {
    // Define valid state transitions
    switch (currentState) {
      case PlacementState.IDLE:
        return newState === PlacementState.PLACING_POINTS;
      case PlacementState.PLACING_POINTS:
        return (
          newState === PlacementState.PLACED ||
          newState === PlacementState.CANCELLED ||
          newState === PlacementState.IDLE
        );
      case PlacementState.PLACED:
      case PlacementState.CANCELLED:
        return newState === PlacementState.IDLE || newState === PlacementState.PLACING_POINTS;
      default:
        return false;
    }
  }

  public resetToInitialState(): void {
    this.shapeType = null;
    this.placementPoints = [];
    this.pointsNeeded = 0;
    this.setState(PlacementState.IDLE);
  }

  public startPlacement(shapeType: ShapeType): void {
    console.log('[PlacementManager.ts][placement-debug] startPlacement called for', shapeType);

    if (this.isInState(PlacementState.PLACING_POINTS) && this.shapeType === shapeType) {
      // Already placing this shape, do nothing.
      return;
    }

    this.cancelPlacement(); // Cancel any previous placement.

    this.shapeType = shapeType;
    this.placementPoints = [];
    this.pointsNeeded = this.getPointsNeededForShape(shapeType);

    this.setState(PlacementState.PLACING_POINTS);
  }

  public cancelPlacement(): void {
    if (this.isInState(PlacementState.PLACING_POINTS)) {
      this.setState(PlacementState.CANCELLED);
      this.resetState();
    }
  }

  public isPlacing(): boolean {
    return this.isInState(PlacementState.PLACING_POINTS);
  }

  public getShapeType(): ShapeType | null {
    return this.shapeType;
  }

  public getPlacementPoints(): ReadonlyArray<Point> {
    return [...this.placementPoints];
  }

  private resetState(): void {
    this.shapeType = null;
    this.placementPoints = [];
    this.pointsNeeded = 0;
    // Clear preview lines when exiting placement mode
    this.canvasManager.setPreviewLines([]);
    this.setState(PlacementState.IDLE);
  }

  private getPointsNeededForShape(shapeType: ShapeType): number {
    switch (shapeType) {
      case ShapeType.LEAF:
        return 2;
      case ShapeType.TRI_ARC:
        return 3;
      default:
        return 2;
    }
  }

  private addEventListeners(): void {
    const canvas = this.canvasManager.getCanvas();
    canvas.addEventListener('mousedown', this.boundHandleMouseDown);
    canvas.addEventListener('mousemove', this.boundHandleMouseMove);
    document.addEventListener('keydown', this.boundHandleKeyDown);
  }

  private removeEventListeners(): void {
    const canvas = this.canvasManager.getCanvas();
    canvas.removeEventListener('mousedown', this.boundHandleMouseDown);
    canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
    document.removeEventListener('keydown', this.boundHandleKeyDown);
  }

  private handleMouseDown(event: MouseEvent): void {
    if (!this.isPlacing() || !this.isEnabled()) return;

    const rect = this.canvasManager.getCanvas().getBoundingClientRect();
    const screenPos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const worldPos = this.canvasManager.screenToWorld(screenPos);

    this.placementPoints.push(worldPos);
    console.log(
      `[PlacementManager] Added point ${this.placementPoints.length}/${this.pointsNeeded}:`,
      worldPos,
    );

    // Check if we have enough points to create the shape
    if (this.placementPoints.length >= this.pointsNeeded) {
      this.completePlacement();
    }

    this.canvasManager.draw();
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isPlacing()) return;

    // Get current mouse position in world coordinates
    const rect = this.canvasManager.getCanvas().getBoundingClientRect();
    const screenPos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const worldPos = this.canvasManager.screenToWorld(screenPos);

    // Update preview lines to show placement progress
    this.updatePreviewLines(worldPos);

    this.canvasManager.draw();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isPlacing()) return;

    if (event.key === 'Escape') {
      console.log('[PlacementManager] Cancelled via Escape key');
      this.cancelPlacement();
      this.canvasManager.draw();
    }
  }

  private completePlacement(): void {
    if (!this.shapeType) return;

    try {
      const shape = createShapeFromPoints(this.shapeType, this.placementPoints);
      if (shape) {
        this.canvasManager.addShape(shape);
        console.log(
          `[PlacementManager] Created ${this.shapeType} with points:`,
          this.placementPoints,
        );

        this.setState(PlacementState.PLACED);
        this.dispatchCustomEvent('shapeCreated', { shape, shapeType: this.shapeType });

        // Reset points for next shape but stay in placement mode
        this.placementPoints = [];
        // Clear preview lines since we're starting fresh
        this.canvasManager.setPreviewLines([]);
        // Transition back to placing state to allow continuous placement
        this.setState(PlacementState.PLACING_POINTS);
      } else {
        console.error('[PlacementManager] Failed to create shape');
        this.setState(PlacementState.CANCELLED);
        this.resetState();
      }
    } catch (error) {
      console.error('[PlacementManager] Error creating shape:', error);
      this.setState(PlacementState.CANCELLED);
      this.resetState();
    }
  }

  private updatePreviewLines(currentMousePos: Point): void {
    const previewLines: { start: Point; end: Point }[] = [];

    if (this.placementPoints.length === 0) {
      // No points placed yet, no preview lines to show
      this.canvasManager.setPreviewLines([]);
      return;
    }

    // For shapes that need multiple points, show lines from placed points to cursor
    if (this.shapeType === ShapeType.LEAF && this.placementPoints.length === 1) {
      // Leaf needs 2 points - show line from first point to cursor
      previewLines.push({
        start: this.placementPoints[0],
        end: currentMousePos,
      });
    } else if (this.shapeType === ShapeType.TRI_ARC) {
      if (this.placementPoints.length === 1) {
        // First point placed - show line to cursor
        previewLines.push({
          start: this.placementPoints[0],
          end: currentMousePos,
        });
      } else if (this.placementPoints.length === 2) {
        // Two points placed - show lines from both points to cursor to form triangle preview
        previewLines.push({
          start: this.placementPoints[0],
          end: currentMousePos,
        });
        previewLines.push({
          start: this.placementPoints[1],
          end: currentMousePos,
        });
        // Also show the line between the two placed points
        previewLines.push({
          start: this.placementPoints[0],
          end: this.placementPoints[1],
        });
      }
    }

    this.canvasManager.setPreviewLines(previewLines);
  }
}
