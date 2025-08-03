import { describe, it, expect } from 'vitest';
import {
  rotatePoint,
  rotatePointDegrees,
  mirrorPoint,
  scalePoint,
  translatePoint,
  applyTransform,
  angleBetweenVectors,
  degreesToRadians,
  radiansToDegrees,
} from '@/geometry/TransformGeometry.js';

describe('TransformGeometry', () => {
  describe('rotatePoint', () => {
    it('should rotate point by 90 degrees', () => {
      const point = { x: 1, y: 0 };
      const center = { x: 0, y: 0 };
      const angle = Math.PI / 2; // 90 degrees

      const result = rotatePoint(point, angle, center);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });

    it('should rotate point around non-origin center', () => {
      const point = { x: 2, y: 1 };
      const center = { x: 1, y: 1 };
      const angle = Math.PI; // 180 degrees

      const result = rotatePoint(point, angle, center);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });

    it('should handle zero rotation', () => {
      const point = { x: 5, y: 3 };
      const center = { x: 2, y: 1 };
      const angle = 0;

      const result = rotatePoint(point, angle, center);

      expect(result).toEqual(point);
    });
  });

  describe('rotatePointDegrees', () => {
    it('should rotate point by 90 degrees', () => {
      const point = { x: 1, y: 0 };
      const center = { x: 0, y: 0 };
      const angleDeg = 90;

      const result = rotatePointDegrees(point, angleDeg, center);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });
  });

  describe('mirrorPoint', () => {
    it('should mirror point across horizontal line', () => {
      const point = { x: 5, y: 3 };
      const lineP1 = { x: 0, y: 0 };
      const lineP2 = { x: 10, y: 0 };

      const result = mirrorPoint(point, lineP1, lineP2);

      expect(result.x).toBeCloseTo(5);
      expect(result.y).toBeCloseTo(-3);
    });

    it('should mirror point across vertical line', () => {
      const point = { x: 3, y: 5 };
      const lineP1 = { x: 0, y: 0 };
      const lineP2 = { x: 0, y: 10 };

      const result = mirrorPoint(point, lineP1, lineP2);

      expect(result.x).toBeCloseTo(-3);
      expect(result.y).toBeCloseTo(5);
    });

    it('should mirror point across diagonal line', () => {
      const point = { x: 1, y: 0 };
      const lineP1 = { x: 0, y: 0 };
      const lineP2 = { x: 1, y: 1 };

      const result = mirrorPoint(point, lineP1, lineP2);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });

    it('should handle degenerate line (same points)', () => {
      const point = { x: 5, y: 3 };
      const lineP1 = { x: 2, y: 2 };
      const lineP2 = { x: 2, y: 2 };

      const result = mirrorPoint(point, lineP1, lineP2);

      expect(result).toEqual(point);
    });
  });

  describe('scalePoint', () => {
    it('should scale point from origin', () => {
      const point = { x: 3, y: 4 };
      const scale = 2;
      const center = { x: 0, y: 0 };

      const result = scalePoint(point, scale, center);

      expect(result.x).toBe(6);
      expect(result.y).toBe(8);
    });

    it('should scale point from custom center', () => {
      const point = { x: 5, y: 5 };
      const scale = 2;
      const center = { x: 3, y: 3 };

      const result = scalePoint(point, scale, center);

      expect(result.x).toBe(7);
      expect(result.y).toBe(7);
    });
  });

  describe('translatePoint', () => {
    it('should translate point correctly', () => {
      const point = { x: 3, y: 4 };
      const offset = { x: 2, y: -1 };

      const result = translatePoint(point, offset);

      expect(result.x).toBe(5);
      expect(result.y).toBe(3);
    });
  });

  describe('applyTransform', () => {
    it('should apply translation only', () => {
      const point = { x: 1, y: 2 };
      const transform = { translation: { x: 3, y: 4 } };

      const result = applyTransform(point, transform);

      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it('should apply scale only', () => {
      const point = { x: 2, y: 3 };
      const transform = { scale: 2, center: { x: 0, y: 0 } };

      const result = applyTransform(point, transform);

      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it('should apply rotation only', () => {
      const point = { x: 1, y: 0 };
      const transform = { rotation: Math.PI / 2, center: { x: 0, y: 0 } };

      const result = applyTransform(point, transform);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });

    it('should apply combined transforms in correct order', () => {
      const point = { x: 1, y: 0 };
      const transform = {
        scale: 2,
        rotation: Math.PI / 2,
        translation: { x: 1, y: 1 },
        center: { x: 0, y: 0 },
      };

      const result = applyTransform(point, transform);

      // Scale first: (1,0) -> (2,0)
      // Rotate: (2,0) -> (0,2)
      // Translate: (0,2) -> (1,3)
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(3);
    });
  });

  describe('angleBetweenVectors', () => {
    it('should calculate angle between perpendicular vectors', () => {
      const origin = { x: 0, y: 0 };
      const p1 = { x: 1, y: 0 };
      const p2 = { x: 0, y: 1 };

      const result = angleBetweenVectors(origin, p1, p2);

      expect(result).toBeCloseTo(Math.PI / 2);
    });

    it('should calculate angle between opposite vectors', () => {
      const origin = { x: 0, y: 0 };
      const p1 = { x: 1, y: 0 };
      const p2 = { x: -1, y: 0 };

      const result = angleBetweenVectors(origin, p1, p2);

      expect(result).toBeCloseTo(Math.PI);
    });
  });

  describe('angle conversions', () => {
    it('should convert degrees to radians', () => {
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(degreesToRadians(0)).toBe(0);
    });

    it('should convert radians to degrees', () => {
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
      expect(radiansToDegrees(0)).toBe(0);
    });

    it('should be inverse operations', () => {
      const degrees = 45;
      const radians = Math.PI / 4;

      expect(radiansToDegrees(degreesToRadians(degrees))).toBeCloseTo(degrees);
      expect(degreesToRadians(radiansToDegrees(radians))).toBeCloseTo(radians);
    });
  });
});
