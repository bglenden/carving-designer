import { IShape, Point } from './types.js';

export class ActiveShapeChangeEvent extends Event {
  static readonly eventName = 'activeShapeChange';
  public readonly shape: IShape | null;

  constructor(shape: IShape | null) {
    super(ActiveShapeChangeEvent.eventName, { bubbles: true, composed: true });
    this.shape = shape;
  }
}

export class PlacementModeChangeEvent extends CustomEvent<{ active: boolean }> {
  static readonly eventName = 'placementModeChanged';

  constructor(isActive: boolean) {
    super(PlacementModeChangeEvent.eventName, {
      detail: { active: isActive },
      bubbles: true,
      composed: true,
    });
  }
}

export class CanvasMouseMoveEvent extends CustomEvent<{ worldPos: Point }> {
  static readonly eventName = 'canvasMouseMove';

  constructor(worldPos: Point) {
    super(CanvasMouseMoveEvent.eventName, {
      detail: { worldPos },
      bubbles: true,
      composed: true,
    });
  }
}
