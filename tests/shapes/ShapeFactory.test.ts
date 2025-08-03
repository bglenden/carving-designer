import { vi, describe, it, expect, afterEach, type Mock } from 'vitest';

// Prepare mocks for Leaf
let mockFromJSON: Mock;
let mockLeafInstance: any;

function leafMockFactory() {
  return {
    __esModule: true,
    Leaf: vi.fn(() => {
      mockFromJSON = vi.fn();
      mockLeafInstance = { fromJSON: mockFromJSON };
      return mockLeafInstance;
    }),
  };
}

vi.mock('../../src/shapes/Leaf.js', leafMockFactory);
// mock resolved path for ShapeFactory internal import './Leaf.js'
vi.mock('../../src/shapes/Leaf', leafMockFactory);
// mock relative path after moduleNameMapper rewrite ('./Leaf.js' -> './Leaf')
vi.mock('./Leaf', leafMockFactory);

import { Leaf } from '../../src/shapes/Leaf.js';

vi.unmock('../../src/shapes/ShapeFactory.js');
import { createShape, createShapeFromPlacement } from '../../src/shapes/ShapeFactory.js';
import type { Point, ShapeType } from '../../src/core/types.js';
import { ShapeType as ShapeTypeEnum } from '../../src/core/types.js';

const MockedLeaf = Leaf as unknown as Mock;

describe('ShapeFactory', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createShape', () => {
    it('should create a Leaf instance and then call fromJSON on it', () => {
      const leafData = { type: ShapeTypeEnum.LEAF, id: 'leaf-1' };
      const shape = createShape(leafData);

      expect(MockedLeaf).toHaveBeenCalledWith({ x: 0, y: 0 }, { x: 0, y: 0 }, 1);
      expect(mockFromJSON).toHaveBeenCalledWith(leafData);
      expect(shape).toBe(mockLeafInstance);
    });

    it('should throw an error for an unknown shape type', () => {
      expect(() => createShape({ type: 'UNKNOWN' as ShapeType })).toThrow(
        'Unknown shape type: UNKNOWN',
      );
    });
  });

  describe('createShapeFromPlacement', () => {
    it('should create a Leaf with correct properties from placement', () => {
      const p1: Point = { x: 10, y: 20 };
      const p2: Point = { x: 40, y: 60 };

      const shape = createShapeFromPlacement(ShapeTypeEnum.LEAF, p1, p2);

      expect(MockedLeaf).toHaveBeenCalledTimes(1);
      expect(MockedLeaf).toHaveBeenCalledWith(p1, p2, expect.any(Number));
      expect(shape).toBe(mockLeafInstance);
    });

    it('should return null for an unknown shape type', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const p1: Point = { x: 10, y: 20 };
      const p2: Point = { x: 40, y: 60 };

      const shape = createShapeFromPlacement('UNKNOWN_SHAPE' as ShapeType, p1, p2);

      expect(shape).toBeNull();
      expect(MockedLeaf).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unknown shape type for placement: UNKNOWN_SHAPE',
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
