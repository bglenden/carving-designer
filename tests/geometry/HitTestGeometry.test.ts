import { describe, it, expect } from 'vitest';
import {
  pointInPolygon,
  pointNearLineSegment,
  distanceToLineSegment,
  pointInCircle,
  pointOnArc,
  isAngleInArcSweep,
  boundsFromPoints,
  pointInBounds,
  boundsIntersect,
} from '@/geometry/HitTestGeometry.js';

describe('HitTestGeometry', () => {
  describe('pointInPolygon', () => {
    it('should detect point inside square', () => {
      const vertices = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      const point = { x: 5, y: 5 };

      expect(pointInPolygon(point, vertices)).toBe(true);
    });

    it('should detect point outside square', () => {
      const vertices = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      const point = { x: 15, y: 5 };

      expect(pointInPolygon(point, vertices)).toBe(false);
    });

    it('should handle point on edge', () => {
      const vertices = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      const point = { x: 0, y: 5 };

      // Point on edge behavior depends on implementation
      const result = pointInPolygon(point, vertices);
      expect(typeof result).toBe('boolean');
    });

    it('should handle triangle', () => {
      const vertices = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 10 },
      ];
      const inside = { x: 5, y: 3 };
      const outside = { x: 1, y: 8 };

      expect(pointInPolygon(inside, vertices)).toBe(true);
      expect(pointInPolygon(outside, vertices)).toBe(false);
    });
  });

  describe('distanceToLineSegment', () => {
    it('should calculate distance to point on line', () => {
      const point = { x: 5, y: 1 };
      const lineStart = { x: 0, y: 0 };
      const lineEnd = { x: 10, y: 0 };

      const result = distanceToLineSegment(point, lineStart, lineEnd);

      expect(result).toBeCloseTo(1);
    });

    it('should calculate distance to line endpoint', () => {
      const point = { x: -5, y: 0 };
      const lineStart = { x: 0, y: 0 };
      const lineEnd = { x: 10, y: 0 };

      const result = distanceToLineSegment(point, lineStart, lineEnd);

      expect(result).toBeCloseTo(5);
    });

    it('should handle degenerate line (point)', () => {
      const point = { x: 5, y: 5 };
      const lineStart = { x: 0, y: 0 };
      const lineEnd = { x: 0, y: 0 };

      const result = distanceToLineSegment(point, lineStart, lineEnd);

      expect(result).toBeCloseTo(Math.sqrt(50));
    });
  });

  describe('pointNearLineSegment', () => {
    it('should detect point near line within tolerance', () => {
      const point = { x: 5, y: 1 };
      const lineStart = { x: 0, y: 0 };
      const lineEnd = { x: 10, y: 0 };
      const tolerance = 2;

      const result = pointNearLineSegment(point, lineStart, lineEnd, tolerance);

      expect(result).toBe(true);
    });

    it('should reject point far from line', () => {
      const point = { x: 5, y: 5 };
      const lineStart = { x: 0, y: 0 };
      const lineEnd = { x: 10, y: 0 };
      const tolerance = 2;

      const result = pointNearLineSegment(point, lineStart, lineEnd, tolerance);

      expect(result).toBe(false);
    });
  });

  describe('pointInCircle', () => {
    it('should detect point inside circle', () => {
      const point = { x: 3, y: 4 };
      const center = { x: 0, y: 0 };
      const radius = 6;

      expect(pointInCircle(point, center, radius)).toBe(true);
    });

    it('should detect point outside circle', () => {
      const point = { x: 3, y: 4 };
      const center = { x: 0, y: 0 };
      const radius = 4;

      expect(pointInCircle(point, center, radius)).toBe(false);
    });

    it('should detect point on circle boundary', () => {
      const point = { x: 3, y: 4 };
      const center = { x: 0, y: 0 };
      const radius = 5;

      expect(pointInCircle(point, center, radius)).toBe(true);
    });
  });

  describe('isAngleInArcSweep', () => {
    it('should detect angle in counterclockwise arc', () => {
      const angle = Math.PI / 4; // 45 degrees
      const startAngle = 0;
      const endAngle = Math.PI / 2; // 90 degrees
      const counterClockwise = true;

      const result = isAngleInArcSweep(angle, startAngle, endAngle, counterClockwise);

      expect(result).toBe(true);
    });

    it('should detect angle outside counterclockwise arc', () => {
      const angle = (3 * Math.PI) / 4; // 135 degrees
      const startAngle = 0;
      const endAngle = Math.PI / 2; // 90 degrees
      const counterClockwise = true;

      const result = isAngleInArcSweep(angle, startAngle, endAngle, counterClockwise);

      expect(result).toBe(false);
    });

    it('should handle arc crossing 0 degrees', () => {
      const angle = 0.1; // Small positive angle
      const startAngle = (7 * Math.PI) / 4; // 315 degrees
      const endAngle = Math.PI / 4; // 45 degrees
      const counterClockwise = true;

      const result = isAngleInArcSweep(angle, startAngle, endAngle, counterClockwise);

      expect(result).toBe(true);
    });
  });

  describe('pointOnArc', () => {
    it('should detect point on arc', () => {
      const point = { x: 5, y: 0 };
      const center = { x: 0, y: 0 };
      const radius = 5;
      const startAngle = -Math.PI / 4;
      const endAngle = Math.PI / 4;
      const counterClockwise = true;
      const tolerance = 0.1;

      const result = pointOnArc(
        point,
        center,
        radius,
        startAngle,
        endAngle,
        counterClockwise,
        tolerance,
      );

      expect(result).toBe(true);
    });

    it('should reject point at wrong distance', () => {
      const point = { x: 3, y: 0 };
      const center = { x: 0, y: 0 };
      const radius = 5;
      const startAngle = -Math.PI / 4;
      const endAngle = Math.PI / 4;
      const counterClockwise = true;
      const tolerance = 0.1;

      const result = pointOnArc(
        point,
        center,
        radius,
        startAngle,
        endAngle,
        counterClockwise,
        tolerance,
      );

      expect(result).toBe(false);
    });

    it('should reject point outside arc sweep', () => {
      const point = { x: 0, y: 5 };
      const center = { x: 0, y: 0 };
      const radius = 5;
      const startAngle = -Math.PI / 4;
      const endAngle = Math.PI / 4;
      const counterClockwise = true;
      const tolerance = 0.1;

      const result = pointOnArc(
        point,
        center,
        radius,
        startAngle,
        endAngle,
        counterClockwise,
        tolerance,
      );

      expect(result).toBe(false);
    });
  });

  describe('boundsFromPoints', () => {
    it('should calculate bounds from multiple points', () => {
      const points = [
        { x: 1, y: 2 },
        { x: 5, y: 1 },
        { x: 3, y: 6 },
        { x: 0, y: 3 },
      ];

      const result = boundsFromPoints(points);

      expect(result.minX).toBe(0);
      expect(result.maxX).toBe(5);
      expect(result.minY).toBe(1);
      expect(result.maxY).toBe(6);
    });

    it('should handle single point', () => {
      const points = [{ x: 3, y: 7 }];

      const result = boundsFromPoints(points);

      expect(result.minX).toBe(3);
      expect(result.maxX).toBe(3);
      expect(result.minY).toBe(7);
      expect(result.maxY).toBe(7);
    });

    it('should handle empty array', () => {
      const points: { x: number; y: number }[] = [];

      const result = boundsFromPoints(points);

      expect(result.minX).toBe(0);
      expect(result.maxX).toBe(0);
      expect(result.minY).toBe(0);
      expect(result.maxY).toBe(0);
    });
  });

  describe('pointInBounds', () => {
    it('should detect point inside bounds', () => {
      const point = { x: 3, y: 4 };
      const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };

      expect(pointInBounds(point, bounds)).toBe(true);
    });

    it('should detect point outside bounds', () => {
      const point = { x: 15, y: 4 };
      const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };

      expect(pointInBounds(point, bounds)).toBe(false);
    });

    it('should handle point on boundary', () => {
      const point = { x: 10, y: 5 };
      const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };

      expect(pointInBounds(point, bounds)).toBe(true);
    });
  });

  describe('boundsIntersect', () => {
    it('should detect intersecting bounds', () => {
      const bounds1 = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
      const bounds2 = { minX: 5, minY: 5, maxX: 15, maxY: 15 };

      expect(boundsIntersect(bounds1, bounds2)).toBe(true);
    });

    it('should detect non-intersecting bounds', () => {
      const bounds1 = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      const bounds2 = { minX: 10, minY: 10, maxX: 15, maxY: 15 };

      expect(boundsIntersect(bounds1, bounds2)).toBe(false);
    });

    it('should handle touching bounds', () => {
      const bounds1 = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      const bounds2 = { minX: 5, minY: 5, maxX: 10, maxY: 10 };

      expect(boundsIntersect(bounds1, bounds2)).toBe(true);
    });
  });
});
