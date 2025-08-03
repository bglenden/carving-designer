import { describe, it, expect } from 'vitest';
import {
  ActiveShapeChangeEvent,
  PlacementModeChangeEvent,
  CanvasMouseMoveEvent,
} from '../../src/core/events.js';
import { HitRegion, ShapeType, type Point } from '../../src/core/types.js';

// Stub for shape implementing minimal IShape
const mockShape = {
  id: 's1',
  type: ShapeType.LEAF,
  position: { x: 0, y: 0 },
  rotation: 0,
  selected: false,
  draw() {},
  contains() {
    return false;
  },
  hitTest() {
    return { region: HitRegion.NONE };
  },
  getBounds() {
    return { x: 0, y: 0, width: 0, height: 0 };
  },
  rotate() {},
  toJSON() {
    return {};
  },
  fromJSON() {},
};

describe('core/events utility classes', () => {
  it('ActiveShapeChangeEvent should carry the shape and bubble', () => {
    const ev = new ActiveShapeChangeEvent(mockShape);
    expect(ev.type).toBe(ActiveShapeChangeEvent.eventName);
    expect(ev.bubbles).toBe(true);
    expect(ev.composed).toBe(true);
    expect(ev.shape).toBe(mockShape);
  });

  it('PlacementModeChangeEvent should set detail.active', () => {
    const ev = new PlacementModeChangeEvent(true);
    expect(ev.type).toBe(PlacementModeChangeEvent.eventName);
    expect(ev.detail.active).toBe(true);
  });

  it('CanvasMouseMoveEvent should expose worldPos', () => {
    const pos: Point = { x: 10, y: 20 };
    const ev = new CanvasMouseMoveEvent(pos);
    expect(ev.detail.worldPos).toEqual(pos);
  });
});
