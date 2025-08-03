import { describe, it, expect } from 'vitest';
import { ShapeType, HitRegion } from '../../src/core/types.js';

describe('core/types enums and guards', () => {
  it('ShapeType enum values', () => {
    expect(ShapeType.LEAF).toBe('LEAF');
    expect(ShapeType.TRI_ARC).toBe('TRI_ARC');
    expect(ShapeType.TRIANGLE).toBe('triangle');
    expect(ShapeType.LINE).toBe('line');
  });

  it('HitRegion enum values', () => {
    expect(HitRegion.BODY).toBe('body');
    expect(HitRegion.VERTEX).toBe('vertex');
    expect(HitRegion.ARC).toBe('arc');
    expect(HitRegion.ROTATION_HANDLE).toBe('rotation_handle');
    expect(HitRegion.NONE).toBe('none');
  });

  it('HitResult structure', () => {
    const result = { region: HitRegion.BODY, details: { vertexIndex: 1, arcIndex: 2 } };
    expect(result.region).toBe(HitRegion.BODY);
    expect(result.details.vertexIndex).toBe(1);
    expect(result.details.arcIndex).toBe(2);
  });
});
