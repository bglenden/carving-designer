import { describe, it, expect } from 'vitest';
import { Point, Bounds, ShapeType, IShape, HitRegion } from '../../src/core/types.js';
import {
  ActiveShapeChangeEvent,
  PlacementModeChangeEvent,
  CanvasMouseMoveEvent,
} from '../../src/core/events.js';

describe('Core Types', () => {
  describe('Point', () => {
    it('should create a point with x and y coordinates', () => {
      const point: Point = { x: 10, y: 20 };
      expect(point.x).toBe(10);
      expect(point.y).toBe(20);
    });
  });

  describe('Bounds', () => {
    it('should create bounds with x, y, width, and height', () => {
      const bounds: Bounds = { x: 5, y: 10, width: 100, height: 200 };
      expect(bounds.x).toBe(5);
      expect(bounds.y).toBe(10);
      expect(bounds.width).toBe(100);
      expect(bounds.height).toBe(200);
    });
  });

  describe('ShapeType', () => {
    it('should have the correct shape types', () => {
      expect(ShapeType.LEAF).toBe('LEAF');
      // Add more shape types as they are defined
    });
  });

  describe('IShape Interface', () => {
    it('should have the correct properties and methods', () => {
      // This test is a type-check and documentation of the IShape interface.
      const mockShape: IShape = {
        id: 'test-shape',
        type: ShapeType.LEAF,
        getCenter: () => ({ x: 10, y: 20 }),
        selected: false,
        draw: (_ctx: CanvasRenderingContext2D, _scale?: number): void => {
          /* no-op */
        },
        contains: (_point: Point): boolean => true,
        getBounds: (): Bounds => ({ x: 0, y: 0, width: 10, height: 10 }),
        toJSON: (): any => ({ id: 'test-shape' }),
        fromJSON: (_json: any): void => {
          /* no-op */
        },
        hitTest: (_point: Point, _scale: number) => ({ region: HitRegion.NONE }),
        rotate: (_angle: number, _center: Point) => {
          /* no-op */
        },
      };

      // Verify properties
      expect(mockShape.id).toBe('test-shape');
      expect(mockShape.type).toBe(ShapeType.LEAF);
      expect(mockShape.getCenter()).toEqual({ x: 10, y: 20 });
      expect(mockShape.selected).toBe(false);

      // Verify method signatures
      expect(typeof mockShape.draw).toBe('function');
      expect(typeof mockShape.getBounds).toBe('function');
      expect(typeof mockShape.contains).toBe('function');
      expect(typeof mockShape.toJSON).toBe('function');
      expect(typeof mockShape.fromJSON).toBe('function');
    });
  });

  describe('Core Events', () => {
    describe('ActiveShapeChangeEvent', () => {
      it('should create an event with a shape', () => {
        const mockShape: IShape = { id: 'test-shape' } as IShape;
        const event = new ActiveShapeChangeEvent(mockShape);
        expect(event.type).toBe(ActiveShapeChangeEvent.eventName);
        expect(event.shape).toBe(mockShape);
      });

      it('should create an event with null shape', () => {
        const event = new ActiveShapeChangeEvent(null);
        expect(event.type).toBe(ActiveShapeChangeEvent.eventName);
        expect(event.shape).toBeNull();
      });
    });

    describe('PlacementModeChangeEvent', () => {
      it('should create an event with active: true', () => {
        const event = new PlacementModeChangeEvent(true);
        expect(event.type).toBe(PlacementModeChangeEvent.eventName);
        expect(event.detail.active).toBe(true);
      });

      it('should create an event with active: false', () => {
        const event = new PlacementModeChangeEvent(false);
        expect(event.type).toBe(PlacementModeChangeEvent.eventName);
        expect(event.detail.active).toBe(false);
      });
    });

    describe('CanvasMouseMoveEvent', () => {
      it('should create an event with world coordinates', () => {
        const pos: Point = { x: 123, y: 456 };
        const event = new CanvasMouseMoveEvent(pos);
        expect(event.type).toBe(CanvasMouseMoveEvent.eventName);
        expect(event.detail.worldPos).toBe(pos);
      });
    });
  });
});
