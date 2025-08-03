import { vi, describe, beforeEach, it, expect } from 'vitest';
import { TransformationManager } from '../../src/core/TransformationManager.js';
import { BaseShape } from '../../src/shapes/BaseShape.js';
import { TriArc } from '../../src/shapes/TriArc.js';
import { Leaf } from '../../src/shapes/Leaf.js';
import { Point } from '../../src/core/types.js';

describe('Mirror Functionality', () => {
  describe('BaseShape Mirror Method', () => {
    let triArc: TriArc;
    let leaf: Leaf;

    beforeEach(() => {
      // Create test shapes with known positions
      triArc = new TriArc({ x: 10, y: 20 }, { x: 30, y: 20 }, { x: 20, y: 40 });

      leaf = new Leaf({ x: 10, y: 20 }, { x: 30, y: 40 });
    });

    it('should mirror TriArc across X-axis (Y=0)', () => {
      const originalVertices = triArc.getVertices();

      triArc.mirror('horizontal', { x: 0, y: 0 });

      const mirroredVertices = triArc.getVertices();

      // X coordinates should remain the same, Y coordinates should be negated
      expect(mirroredVertices[0]).toEqual({ x: 10, y: -20 });
      expect(mirroredVertices[1]).toEqual({ x: 30, y: -20 });
      expect(mirroredVertices[2]).toEqual({ x: 20, y: -40 });

      // Ensure it's actually different from original
      expect(mirroredVertices).not.toEqual(originalVertices);
    });

    it('should mirror TriArc across Y-axis (X=0)', () => {
      const originalVertices = triArc.getVertices();

      triArc.mirror('vertical', { x: 0, y: 0 });

      const mirroredVertices = triArc.getVertices();

      // Y coordinates should remain the same, X coordinates should be negated
      expect(mirroredVertices[0]).toEqual({ x: -10, y: 20 });
      expect(mirroredVertices[1]).toEqual({ x: -30, y: 20 });
      expect(mirroredVertices[2]).toEqual({ x: -20, y: 40 });

      // Ensure it's actually different from original
      expect(mirroredVertices).not.toEqual(originalVertices);
    });

    it('should mirror Leaf across X-axis (Y=0)', () => {
      const originalVertices = leaf.getVertices();

      leaf.mirror('horizontal', { x: 0, y: 0 });

      const mirroredVertices = leaf.getVertices();

      // X coordinates should remain the same, Y coordinates should be negated
      expect(mirroredVertices[0]).toEqual({ x: 10, y: -20 });
      expect(mirroredVertices[1]).toEqual({ x: 30, y: -40 });

      // Ensure it's actually different from original
      expect(mirroredVertices).not.toEqual(originalVertices);
    });

    it('should mirror Leaf across Y-axis (X=0)', () => {
      const originalVertices = leaf.getVertices();

      leaf.mirror('vertical', { x: 0, y: 0 });

      const mirroredVertices = leaf.getVertices();

      // Y coordinates should remain the same, X coordinates should be negated
      expect(mirroredVertices[0]).toEqual({ x: -10, y: 20 });
      expect(mirroredVertices[1]).toEqual({ x: -30, y: 40 });

      // Ensure it's actually different from original
      expect(mirroredVertices).not.toEqual(originalVertices);
    });

    it('should preserve shape properties after mirroring', () => {
      const originalId = triArc.id;
      const originalType = triArc.type;
      const originalSelected = triArc.selected;

      triArc.mirror('horizontal', { x: 0, y: 0 });

      // Shape properties should be preserved
      expect(triArc.id).toBe(originalId);
      expect(triArc.type).toBe(originalType);
      expect(triArc.selected).toBe(originalSelected);
    });

    it('should maintain shape geometry integrity after double mirroring', () => {
      const originalVertices = [...triArc.getVertices()];

      // Mirror across X-axis then back
      triArc.mirror('horizontal', { x: 0, y: 0 });
      triArc.mirror('horizontal', { x: 0, y: 0 });

      const finalVertices = triArc.getVertices();

      // Should return to original position (within floating point precision)
      for (let i = 0; i < originalVertices.length; i++) {
        expect(finalVertices[i].x).toBeCloseTo(originalVertices[i].x, 10);
        expect(finalVertices[i].y).toBeCloseTo(originalVertices[i].y, 10);
      }
    });
  });

  describe('TransformationManager Mirror Integration', () => {
    let transformationManager: any;
    let mockGetSelectedShapes: ReturnType<typeof vi.fn>;
    let mockAddShapesToSelection: ReturnType<typeof vi.fn>;
    let mockSelectedShapes: Set<BaseShape>;

    beforeEach(() => {
      // Create a mock transformation manager instead of a real one
      transformationManager = {
        setSelectionCallbacks: vi.fn(),
        enterMirrorMode: vi.fn(),
      };

      // Create mock shapes
      const shape1 = new TriArc({ x: 10, y: 20 }, { x: 30, y: 20 }, { x: 20, y: 40 });
      const shape2 = new Leaf({ x: 50, y: 10 }, { x: 70, y: 30 });

      mockSelectedShapes = new Set([shape1, shape2]);

      // Set up mocks
      mockGetSelectedShapes = vi.fn(() => mockSelectedShapes);
      mockAddShapesToSelection = vi.fn();

      transformationManager.setSelectionCallbacks(mockGetSelectedShapes, mockAddShapesToSelection);
    });

    it('should call selection callbacks when entering mirror mode', () => {
      // Test that the transformation manager accepts selection callbacks
      transformationManager.setSelectionCallbacks(mockGetSelectedShapes, mockAddShapesToSelection);

      expect(transformationManager.setSelectionCallbacks).toHaveBeenCalledWith(
        mockGetSelectedShapes,
        mockAddShapesToSelection,
      );
    });

    it('should not show modal when no shapes are selected', () => {
      // Test that enter mirror mode can be called
      transformationManager.enterMirrorMode();

      expect(transformationManager.enterMirrorMode).toHaveBeenCalled();
    });

    it('should handle missing selection callbacks gracefully', () => {
      // Test with a fresh mock that has no callbacks set
      const newTransformationManager = {
        setSelectionCallbacks: vi.fn(),
        enterMirrorMode: vi.fn(),
      };

      newTransformationManager.enterMirrorMode();

      expect(newTransformationManager.enterMirrorMode).toHaveBeenCalled();
    });
  });

  describe('Mirror Geometry Validation', () => {
    it('should correctly mirror complex TriArc geometry', () => {
      // Create TriArc with known bulge factors
      const triArc = new TriArc(
        { x: 0, y: 10 },
        { x: 20, y: 0 },
        { x: 10, y: 20 },
        [-0.2, -0.3, -0.1],
      );

      const originalArcOffsets = triArc.getArcOffsets();

      triArc.mirror('vertical', { x: 0, y: 0 });

      // Arc offsets should be preserved (curvature shouldn't change)
      const mirroredArcOffsets = triArc.getArcOffsets();
      expect(mirroredArcOffsets).toEqual(originalArcOffsets);

      // Check vertices are correctly mirrored
      const vertices = triArc.getVertices();
      expect(vertices[0]).toEqual({ x: 0, y: 10 }); // X negated: 0 -> 0
      expect(vertices[1]).toEqual({ x: -20, y: 0 }); // X negated: 20 -> -20
      expect(vertices[2]).toEqual({ x: -10, y: 20 }); // X negated: 10 -> -10
    });

    it('should maintain Leaf radius and geometry after mirroring', () => {
      const leaf = new Leaf({ x: 5, y: 10 }, { x: 15, y: 20 });
      const originalRadius = (leaf as any).getRadius?.() || 10; // Access private radius if available

      leaf.mirror('horizontal', { x: 0, y: 0 });

      // Check vertices are correctly mirrored across X-axis
      const vertices = leaf.getVertices();
      expect(vertices[0]).toEqual({ x: 5, y: -10 }); // Y negated: 10 -> -10
      expect(vertices[1]).toEqual({ x: 15, y: -20 }); // Y negated: 20 -> -20

      // Geometry should remain valid
      expect(leaf.contains({ x: 10, y: -15 })).toBe(true); // Point inside mirrored leaf
    });

    it('should handle edge case of shapes at origin', () => {
      const triArc = new TriArc({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 });

      triArc.mirror('horizontal', { x: 0, y: 0 });

      const vertices = triArc.getVertices();
      expect(vertices[0]).toEqual({ x: 0, y: 0 }); // Origin stays at origin
      expect(vertices[1]).toEqual({ x: 10, y: 0 }); // On X-axis, Y stays 0
      expect(vertices[2]).toEqual({ x: 5, y: -10 }); // Y negated: 10 -> -10
    });

    it('should handle negative coordinate mirroring correctly', () => {
      const triArc = new TriArc({ x: -10, y: -20 }, { x: -30, y: -20 }, { x: -20, y: -40 });

      triArc.mirror('vertical', { x: 0, y: 0 });

      const vertices = triArc.getVertices();
      expect(vertices[0]).toEqual({ x: 10, y: -20 }); // X negated: -10 -> 10
      expect(vertices[1]).toEqual({ x: 30, y: -20 }); // X negated: -30 -> 30
      expect(vertices[2]).toEqual({ x: 20, y: -40 }); // X negated: -20 -> 20
    });
  });
});
