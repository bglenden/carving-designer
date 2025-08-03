import { Point, HitResult, HitRegion, ShapeType } from '../../core/types.js';
import { BaseShape } from '../../shapes/BaseShape.js';
import { CanvasManager } from '../../canvas/CanvasManager.js';
import { SelectionManager } from '../../core/SelectionManager.js';
import { TransformationManager, TransformMode } from '../../core/TransformationManager.js';
import { BaseMouseHandlerStrategy } from './MouseHandlerStrategy.js';

/**
 * Handles mouse events when in edit mode for shape manipulation
 */
export class EditModeMouseHandler extends BaseMouseHandlerStrategy {
  private activeHit: { shape: BaseShape; result: HitResult } | null = null;

  constructor(
    canvasManager: CanvasManager,
    private selectionManager: SelectionManager,
    private transformationManager: TransformationManager,
  ) {
    super(canvasManager);
  }

  // Expose for tests
  public _setDragState(isDragging: boolean, hasDragged: boolean, dragStartPoint: Point): void {
    this.setDragState(isDragging, hasDragged, dragStartPoint);
  }

  handleMouseDown(screenPos: Point, worldPos: Point, event: MouseEvent): boolean {
    if (event.button !== 0) return false;

    this.isDragging = true;
    this.dragStartPoint = screenPos;
    this.hasDragged = false;

    let hitFound = false;
    this.activeHit = null;

    // Priority 1: Check for handle hits on currently selected shapes.
    // This allows interacting with handles even if they are outside the shape's body.
    for (const shape of this.selectionManager.get()) {
      const hitResult = shape.hitTest(worldPos, this.canvasManager.getScale());
      if (hitResult.region === HitRegion.VERTEX || hitResult.region === HitRegion.ARC) {
        this.activeHit = { shape, result: hitResult };
        hitFound = true;
        break;
      }
    }

    // Priority 2: If no handle was hit, check for a body hit on any shape.
    if (!hitFound) {
      const shape = this.canvasManager.getShapeAtPoint(worldPos);
      if (shape) {
        // getShapeAtPoint implies a body hit, so we can create a synthetic result.
        this.activeHit = { shape, result: { region: HitRegion.BODY } };
      }
    }

    return true;
  }

  handleMouseMove(screenPos: Point, worldPos: Point, _event: MouseEvent): boolean {
    const canvas = this.canvasManager.getCanvas();

    // --- Hover-over hit detection (when not dragging) ---
    if (!this.isDragging) {
      this.canvasManager.getShapes().forEach((s) => (s.activeHit = null)); // Clear old hits
      let cursor: string | null = null;
      let hitFound = false;

      // Priority 1: Check for rotation handle hover.
      if (
        this.transformationManager.getCurrentMode() === TransformMode.ROTATE &&
        this.selectionManager.hitTestRotationHandle(worldPos, this.canvasManager.getScale())
      ) {
        cursor = 'grab';
        hitFound = true;
      }

      // Priority 2: Check for vertex/arc handle hovers on selected shapes.
      if (!hitFound) {
        for (const shape of this.selectionManager.get()) {
          const hitResult = shape.hitTest(worldPos, this.canvasManager.getScale());
          if (hitResult.region === HitRegion.VERTEX || hitResult.region === HitRegion.ARC) {
            shape.activeHit = hitResult;
            cursor = 'pointer';
            hitFound = true;
            break;
          }
        }
      }

      // Priority 3: Check for body hovers on any shape.
      if (!hitFound) {
        const shape = this.canvasManager.getShapeAtPoint(worldPos);
        if (shape) {
          shape.activeHit = { region: HitRegion.BODY };
          cursor = 'move';
        }
      }

      canvas.style.cursor = cursor || 'default';
      this.canvasManager.draw();
      return true;
    }

    // --- Drag Start Logic (first move) ---
    if (!this.hasDragged) {
      this.hasDragged = true;

      // On the first move, determine if we start a transformation
      if (this.activeHit) {
        const { shape, result } = this.activeHit;
        const dragStartWorldPos = this.canvasManager.screenToWorld(this.dragStartPoint);

        // 1. Rotation Start
        if (
          this.transformationManager.getCurrentMode() === TransformMode.ROTATE &&
          this.selectionManager.hitTestRotationHandle(
            dragStartWorldPos,
            this.canvasManager.getScale(),
          )
        ) {
          const rotationCenter = this.selectionManager.getCenter();
          if (rotationCenter) {
            this.transformationManager.start(
              this.selectionManager.get(),
              dragStartWorldPos,
              rotationCenter,
            );
          }
        } else if (
          // 2. Body Drag / Move Start
          this.transformationManager.getCurrentMode() === TransformMode.MOVE &&
          result.region === HitRegion.BODY &&
          this.selectionManager.has(shape)
        ) {
          this.transformationManager.start(this.selectionManager.get(), dragStartWorldPos);
        }
      }
    }

    // --- Dragging Update Logic ---
    const worldLastPos = this.canvasManager.screenToWorld(this.dragStartPoint);
    const delta = { x: worldPos.x - worldLastPos.x, y: worldPos.y - worldLastPos.y };

    if (this.transformationManager.isTransforming()) {
      this.transformationManager.transform(delta, worldPos);
    } else if (this.activeHit) {
      this.handleDirectManipulation(delta, worldPos);
    }

    this.dragStartPoint = screenPos;
    this.canvasManager.draw();
    return true;
  }

  handleMouseUp(_screenPos: Point, _worldPos: Point, event: MouseEvent): boolean {
    if (!this.isDragging) return false;

    // --- Handle Click (no drag) ---
    if (!this.hasDragged) {
      this.handleClick(event);
    }

    // --- End Transformation ---
    if (this.hasDragged && this.transformationManager.isTransforming()) {
      this.transformationManager.end();
    } else if (this.hasDragged && this.activeHit) {
      // Direct manipulation (vertex/arc/body move) completed - trigger autosave
      document.dispatchEvent(new CustomEvent('shapesModified'));
    }

    // --- Reset State ---
    this.resetDragState();
    if (this.activeHit) {
      this.activeHit.shape.activeHit = null;
      this.activeHit = null;
    }
    this.canvasManager.draw();
    return true;
  }

  private handleClick(event: MouseEvent): void {
    const shape = this.activeHit?.shape;
    if (shape) {
      const isMultiSelect = event.metaKey || event.ctrlKey;
      if (!isMultiSelect) {
        // If not multi-selecting, and the shape is not already selected,
        // clear the current selection and select only this shape.
        if (!this.selectionManager.has(shape)) {
          this.selectionManager.clear();
          this.selectionManager.add(shape);
        }
      } else {
        // Toggle selection for multi-select
        if (this.selectionManager.has(shape)) {
          this.selectionManager.remove(shape);
        } else {
          this.selectionManager.add(shape);
        }
      }
    } else {
      // Clicked on empty space, clear selection
      this.selectionManager.clear();
    }
  }

  private handleDirectManipulation(delta: Point, worldPos: Point): void {
    if (!this.activeHit) return;

    const { shape, result } = this.activeHit;
    switch (result.region) {
      case HitRegion.BODY:
        // If multiple items are selected, move them all
        if (this.selectionManager.selection.size > 1 && this.selectionManager.has(shape)) {
          this.selectionManager.get().forEach((s) => s.move(delta));
        } else {
          shape.move(delta);
        }
        break;
      case HitRegion.VERTEX:
        if (result.details?.vertexIndex !== undefined) {
          shape.moveVertex(result.details.vertexIndex, worldPos);
        }
        break;
      case HitRegion.ARC:
        if (result.details?.arcIndex !== undefined) {
          this.handleArcManipulation(shape, result.details.arcIndex, worldPos);
        }
        break;
    }
  }

  private handleArcManipulation(shape: BaseShape, arcIndex: number, worldPos: Point): void {
    // Compute the new offset for the arc handle drag
    const vertices = shape.getVertices();
    const [i1, i2] = shape.getArcVertexIndexes(arcIndex);
    const a = vertices[i1];
    const b = vertices[i2];
    // Chord midpoint
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;

    // Calculate normal direction - use the same logic as the shape's handle positioning
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    let nx = 0,
      ny = 0;
    if (len >= 1e-9) {
      nx = -dy / len;
      ny = dx / len;
    }

    // For TriArc shapes, ensure normal points toward centroid (inward) like in getArcMidpoints()
    if (shape.type === ShapeType.TRI_ARC) {
      const center = shape.getCenter();
      const toCentroid = { x: center.x - mx, y: center.y - my };
      const dot = nx * toCentroid.x + ny * toCentroid.y;
      if (dot < 0) {
        nx = -nx;
        ny = -ny;
      }
    }

    // Project the drag point onto the normal from the chord midpoint
    const px = worldPos.x - mx;
    const py = worldPos.y - my;
    const offset = px * nx + py * ny;

    // For TriArc: inward normal means dragging outward gives negative offset,
    // but we want positive offset to increase curvature, so negate it
    // For other shapes: also negate offset to fix reversed drag direction
    const finalOffset = -offset;

    shape.moveArc(arcIndex, finalOffset);
  }
}
