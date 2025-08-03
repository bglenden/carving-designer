import { describe, it, expect } from 'vitest';
import {
  createShape,
  createShapeFromPlacement,
  createShapeFromPoints,
} from '../../src/shapes/ShapeFactory.js';

vi.unmock('../../src/shapes/ShapeFactory.js');
import { ShapeType } from '../../src/core/types.js';

describe('ShapeFactory utility functions', () => {
  it('createShape throws on unknown type', () => {
    expect(() => createShape({ type: 'unknown' })).toThrow();
  });

  it('createShape creates LEAF and calls fromJSON', () => {
    const data = {
      type: ShapeType.LEAF,
      id: 'id',
      position: { x: 1, y: 2 },
      rotation: 0,
      selected: false,
    };
    const shape = createShape(data);
    expect(shape.type).toBe(ShapeType.LEAF);
    expect(shape.id).toBe('id');
  });

  it('createShape creates TRI_ARC', () => {
    const data = {
      type: ShapeType.TRI_ARC,
      id: 'id2',
      position: { x: 0, y: 0 },
      rotation: 0,
      selected: false,
    };
    const shape = createShape(data);
    expect(shape.type).toBe(ShapeType.TRI_ARC);
    expect(shape.id).toBe('id2');
  });

  it('createShapeFromPlacement returns null for unknown', () => {
    expect(createShapeFromPlacement('unknown' as any, { x: 0, y: 0 }, { x: 1, y: 1 })).toBeNull();
  });

  it('createShapeFromPlacement creates LEAF', () => {
    const shape = createShapeFromPlacement(ShapeType.LEAF, { x: 0, y: 0 }, { x: 10, y: 0 });
    expect(shape?.type).toBe(ShapeType.LEAF);
  });

  it('createShapeFromPoints returns null for unknown', () => {
    expect(createShapeFromPoints('unknown', [])).toBeNull();
  });

  it('createShapeFromPoints returns null for not enough points', () => {
    expect(createShapeFromPoints(ShapeType.LEAF, [{ x: 0, y: 0 }])).toBeNull();
    expect(
      createShapeFromPoints(ShapeType.TRI_ARC, [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]),
    ).toBeNull();
  });

  it('createShapeFromPoints creates LEAF and TRI_ARC', () => {
    const leaf = createShapeFromPoints(ShapeType.LEAF, [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
    expect(leaf?.type).toBe(ShapeType.LEAF);
    const triArc = createShapeFromPoints(ShapeType.TRI_ARC, [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]);
    expect(triArc?.type).toBe(ShapeType.TRI_ARC);
  });
});
