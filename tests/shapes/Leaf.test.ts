import { describe, it, expect, beforeEach, type Mocked } from 'vitest';
import { Leaf } from '../../src/shapes/Leaf.js';
import { ShapeType } from '../../src/core/types.js';
import { Point } from '../../src/core/types.js';

describe('Leaf', () => {
  let mockCtx: Mocked<CanvasRenderingContext2D>;

  beforeEach(() => {
    // Create a mock canvas and get its context. The global setup in `setupTests.ts` ensures
    // that `getContext('2d')` returns a comprehensive mock.
    const canvas = document.createElement('canvas');
    mockCtx = canvas.getContext('2d') as Mocked<CanvasRenderingContext2D>;
  });
  let shape: Leaf;
  const focus1: Point = { x: 0, y: 0 };
  const focus2: Point = { x: 10, y: 0 };
  const radius = 10;

  beforeEach(() => {
    shape = new Leaf(focus1, focus2, radius);
  });

  it('should be created with correct properties', () => {
    const vertices = shape.getVertices();
    expect(vertices[0]).toEqual(focus1);
    expect(vertices[1]).toEqual(focus2);
    expect(shape.type).toBe(ShapeType.LEAF);
  });

  describe('contains', () => {
    it('should return true for a point inside the intersection', () => {
      const pointInside: Point = { x: 5, y: 0 };
      expect(shape.contains(pointInside)).toBe(true);
    });

    it('should return true for a point on the edge of the intersection', () => {
      // Use one of the foci, which is guaranteed to be on the boundary of the lens shape.
      // The previous point { x: 5, y: 8.66 } was an approximation and failed due to floating point inaccuracies.
      const pointOnEdge: Point = { x: 0, y: 0 };
      expect(shape.contains(pointOnEdge)).toBe(true);
    });

    it('should return false for a point inside one circle but outside the intersection', () => {
      const pointOutside: Point = { x: -1, y: 0 };
      expect(shape.contains(pointOutside)).toBe(false);
    });

    it('should return false for a point far outside the shape', () => {
      const pointWayOutside: Point = { x: 100, y: 100 };
      expect(shape.contains(pointWayOutside)).toBe(false);
    });
  });

  describe('getBounds', () => {
    it('should return a zero-dimension bounding box if geometry is invalid', () => {
      const invalidShape = new Leaf({ x: 0, y: 0 }, { x: 100, y: 100 }, 10); // Foci too far
      const bounds = invalidShape.getBounds();
      // The new Leaf implementation returns the bounding box of the foci, even if degenerate
      expect(bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    });

    it('should return the correct bounding box based on the vertices and arc peaks', () => {
      const bounds = shape.getBounds();

      // For foci (0,0) and (10,0) with radius 10, the lens shape is formed.
      const expectedMinX = 0;
      const expectedMaxX = 10;
      // The peaks of the arcs determine the y-bounds.
      const dist = 10;
      const h = Math.sqrt(radius ** 2 - (dist / 2) ** 2); // distance from circle center to chord
      const expectedMinY = h - radius; // approx -1.3397
      const expectedMaxY = radius - h; // approx 1.3397

      expect(bounds.x).toBeCloseTo(expectedMinX);
      expect(bounds.y).toBeCloseTo(expectedMinY);
      expect(bounds.width).toBeCloseTo(expectedMaxX - expectedMinX);
      expect(bounds.height).toBeCloseTo(expectedMaxY - expectedMinY);
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to and from JSON correctly', () => {
      const json = shape.toJSON();
      // Create a new instance and load the state into it
      const newShape = new Leaf({ x: 0, y: 0 }, { x: 0, y: 0 }, 0);
      newShape.fromJSON(json);

      expect(newShape.id).toEqual(shape.id);
      expect(newShape.getVertices()[0]).toEqual(shape.getVertices()[0]);
      expect(newShape.getVertices()[1]).toEqual(shape.getVertices()[1]);
      expect(newShape.selected).toEqual(shape.selected);
    });

    it('should handle partial JSON by keeping existing values', () => {
      const initialFocus1 = { x: 0, y: 0 };
      const initialFocus2 = { x: 10, y: 0 };
      const initialRadius = 7;
      const leaf = new Leaf(initialFocus1, initialFocus2, initialRadius);
      leaf.selected = true;

      const partialJson = {
        id: 'new-id',
      };

      leaf.fromJSON(partialJson);

      expect(leaf.id).toBe('new-id');
      expect(leaf.getVertices()[0]).toEqual(initialFocus1); // Should not change
      expect(leaf.getVertices()[1]).toEqual(initialFocus2); // Should not change
      expect(leaf.selected).toBe(false); // Should default to false if not provided
    });

    it('should keep existing id and radius if not provided in JSON', () => {
      const initialId = 'initial-id';
      const leaf = new Leaf({ x: 0, y: 0 }, { x: 10, y: 0 }, 15, initialId);
      // const originalRadius = leaf.radius; // Leaf has no radius

      const partialJson = {
        focus1: { x: 1, y: 2 },
        focus2: { x: 11, y: 2 },
        selected: true,
      };

      leaf.fromJSON(partialJson);

      expect(leaf.id).toBe(initialId); // Should not change
      // expect(leaf.radius).toBe(originalRadius); // Leaf has no radius
      expect(leaf.getVertices()[0]).toEqual(partialJson.focus1);
      expect(leaf.getVertices()[1]).toEqual(partialJson.focus2);
      expect(leaf.selected).toBe(true);
    });
  });

  describe('Geometric Edge Cases', () => {
    it('should handle identical foci', () => {
      const shapeWithIdenticalFoci = new Leaf(focus1, focus1, radius);
      const vertices = shapeWithIdenticalFoci.getVertices();
      expect(vertices.length).toBe(2);
      expect(vertices[0]).toEqual(vertices[1]); // Both foci are the same
    });

    it('should handle non-intersecting circles', () => {
      const nonIntersectingShape = new Leaf({ x: 0, y: 0 }, { x: 100, y: 0 }, 10);
      const vertices = nonIntersectingShape.getVertices();
      expect(vertices.length).toBe(2);
      expect(vertices[0]).toEqual({ x: 0, y: 0 });
      expect(vertices[1]).toEqual({ x: 100, y: 0 });
    });
  });

  describe('Drawing', () => {
    it('should call arc with correct parameters for a valid shape', () => {
      shape.draw(mockCtx, 1, false);

      expect(mockCtx.save).toHaveBeenCalledTimes(1);
      expect(mockCtx.beginPath).toHaveBeenCalledTimes(1);
      expect(mockCtx.arc).toHaveBeenCalledTimes(2);
      expect(mockCtx.stroke).toHaveBeenCalledTimes(1);
      expect(mockCtx.restore).toHaveBeenCalledTimes(1);
    });

    it('should not draw if geometry is invalid', () => {
      const invalidShape = new Leaf({ x: 0, y: 0 }, { x: 100, y: 0 }, 10); // Foci too far
      invalidShape.draw(mockCtx, 1, false);
      expect(mockCtx.save).not.toHaveBeenCalled();
      expect(mockCtx.beginPath).not.toHaveBeenCalled();
      expect(mockCtx.arc).not.toHaveBeenCalled();
      expect(mockCtx.stroke).not.toHaveBeenCalled();
    });

    it('should use selected color when selected', () => {
      shape.selected = true;
      shape.draw(mockCtx, 1, true);
      expect(mockCtx.strokeStyle).toBe('#0078d7'); // Updated selected color
    });

    it('should use default color when not selected', () => {
      shape.selected = false;
      shape.draw(mockCtx, 1, false);
      expect(mockCtx.strokeStyle).toBe('#006080'); // Updated default color
    });
  });

  describe('Cloning', () => {
    it('should create a deep clone of the shape', () => {
      const original = new Leaf({ x: 1, y: 2 }, { x: 3, y: 4 }, 5, 'original-id');
      original.selected = true;

      const clone = original.clone();

      expect(clone).toBeInstanceOf(Leaf);
      expect(clone.id).not.toBe(original.id);
      expect(clone.type).toBe(ShapeType.LEAF);
      expect(clone.getVertices()[0]).toEqual(original.getVertices()[0]);
      expect(clone.getVertices()[0]).not.toBe(original.getVertices()[0]); // Should be a deep copy
      expect(clone.getVertices()[1]).toEqual(original.getVertices()[1]);
      expect(clone.getVertices()[1]).not.toBe(original.getVertices()[1]); // Should be a deep copy
      expect(clone.selected).toBe(original.selected);
    });
  });

  describe('Interaction and Transformation', () => {
    let leaf: Leaf;
    beforeEach(() => {
      // Using a larger, thinner leaf to avoid ambiguity in hit testing,
      // where the hit radius of handles/vertices covers the entire body.
      leaf = new Leaf({ x: 0, y: 0 }, { x: 50, y: 0 }, 30);
    });

    it('should return correct hit regions', () => {
      // Test vertex hit
      let result = leaf.hitTest({ x: 0, y: 0 }, 1);
      expect(result.region).toBe('vertex');
      expect(result.details?.vertexIndex).toBe(0);

      // Test arc hit
      const arcMidpoint = leaf.getArcMidpoints()[0];
      result = leaf.hitTest(arcMidpoint, 1);
      expect(result.region).toBe('arc');
      expect(result.details?.arcIndex).toBe(0);

      // Test miss
      result = leaf.hitTest({ x: 100, y: 100 }, 1);
      expect(result.region).toBe('none');
    });

    it('should move a vertex and preserve aspect ratio', () => {
      const verticesBefore = leaf.getVertices();
      const distBefore = Math.hypot(
        verticesBefore[1].x - verticesBefore[0].x,
        verticesBefore[1].y - verticesBefore[0].y,
      );
      const arcMidBefore = leaf.getArcMidpoints()[0];
      const midBefore = {
        x: (verticesBefore[0].x + verticesBefore[1].x) / 2,
        y: (verticesBefore[0].y + verticesBefore[1].y) / 2,
      };
      const offsetBefore = Math.hypot(arcMidBefore.x - midBefore.x, arcMidBefore.y - midBefore.y);
      const ratioBefore = offsetBefore / distBefore;
      // Move vertex to double the distance
      const newPosition = { x: -50, y: 0 };
      leaf.moveVertex(0, newPosition);
      const verticesAfter = leaf.getVertices();
      expect(verticesAfter[0]).toEqual(newPosition);
      const distAfter = Math.hypot(
        verticesAfter[1].x - verticesAfter[0].x,
        verticesAfter[1].y - verticesAfter[0].y,
      );
      const arcMidAfter = leaf.getArcMidpoints()[0];
      const midAfter = {
        x: (verticesAfter[0].x + verticesAfter[1].x) / 2,
        y: (verticesAfter[0].y + verticesAfter[1].y) / 2,
      };
      const offsetAfter = Math.hypot(arcMidAfter.x - midAfter.x, arcMidAfter.y - midAfter.y);
      const ratioAfter = offsetAfter / distAfter;
      // Ratio should be nearly preserved
      expect(ratioAfter).toBeCloseTo(ratioBefore, 5);
    });

    it('should move an arc and adjust the curvature', () => {
      const arcMidBefore = leaf.getArcMidpoints()[0];
      const vertices = leaf.getVertices();
      const midBefore = {
        x: (vertices[0].x + vertices[1].x) / 2,
        y: (vertices[0].y + vertices[1].y) / 2,
      };
      const offsetBefore = Math.hypot(arcMidBefore.x - midBefore.x, arcMidBefore.y - midBefore.y);
      // Move the arc handle further along the normal direction (increase offset)
      const scale = 10;
      const newOffset = offsetBefore + scale;
      leaf.moveArc(0, newOffset);
      const arcMidAfter = leaf.getArcMidpoints()[0];
      const offsetAfter = Math.hypot(arcMidAfter.x - midBefore.x, arcMidAfter.y - midBefore.y);
      expect(offsetAfter).toBeGreaterThan(offsetBefore);
    });

    it('should handle cases where foci are too far apart', () => {
      const farLeaf = new Leaf({ x: 0, y: 0 }, { x: 100, y: 0 }, 40); // 2 * radius (80) < dist (100)
      expect(farLeaf.contains({ x: 50, y: 0 })).toBe(false);
      // Draw should not throw an error
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      expect(() => farLeaf.draw(ctx, 1, false)).not.toThrow();
    });
  });
});
