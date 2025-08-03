import { Point, ShapeType } from '../core/types.js';
import { BaseShape } from './BaseShape.js';
import { Leaf } from './Leaf.js';
import { TriArc } from './TriArc.js';

export function createShape(data: any): BaseShape {
  let shape: BaseShape | null = null;

  // Create a dummy instance first, then populate with fromJSON
  // This is because fromJSON is a method on the instance, not static
  switch (data.type) {
    case ShapeType.LEAF:
      // The constructor requires non-null values, so we provide dummies.
      // fromJSON will overwrite them.
      shape = new Leaf({ x: 0, y: 0 }, { x: 0, y: 0 }, 1);
      break;
    case ShapeType.TRI_ARC:
      shape = new TriArc({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.5, y: 1 });
      break;

    // Add cases for other shapes here in the future
    default:
      throw new Error(`Unknown shape type: ${data.type}`);
  }

  shape.fromJSON(data);
  return shape;
}

export function createShapeFromPlacement(
  shapeType: ShapeType,
  p1: Point,
  p2: Point,
): BaseShape | null {
  switch (shapeType) {
    case ShapeType.LEAF: {
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const radius = dist * 0.65;
      return new Leaf(p1, p2, radius);
    }
    default:
      console.error(`Unknown shape type for placement: ${shapeType}`);
      return null;
  }
}

export function createShapeFromPoints(shapeType: string, points: Point[]): BaseShape | null {
  switch (shapeType) {
    case ShapeType.LEAF: {
      if (points.length < 2) return null;
      const [p1, p2] = points;
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const radius = dist * 0.65; // Make the vesica even fatter
      return new Leaf(p1, p2, radius);
    }
    case ShapeType.TRI_ARC: {
      if (points.length < 3) return null;
      const [p1, p2, p3] = points;
      return new TriArc(p1, p2, p3);
    }

    default:
      console.error(`Unknown shape type for placement: ${shapeType}`);
      return null;
  }
}
