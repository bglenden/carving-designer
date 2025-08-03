import { describe, it, expect } from 'vitest';
import {
  getArcCenterFromChordAndOffset,
  getChordMidpoint,
  getPerpendicularNormal,
  calculateArcParameters,
  distance,
  sagittaFromRadiusAndChord,
  radiusFromChordAndSagitta,
  bulgeToSagitta,
  sagittaToBulge,
  arcIntersection
} from '@/geometry/ArcGeometry.js';

describe('ArcGeometry', () => {
  describe('getChordMidpoint', () => {
    it('should calculate midpoint correctly', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 10, y: 10 };
      const result = getChordMidpoint(p1, p2);
      
      expect(result).toEqual({ x: 5, y: 5 });
    });

    it('should handle negative coordinates', () => {
      const p1 = { x: -5, y: -3 };
      const p2 = { x: 3, y: 7 };
      const result = getChordMidpoint(p1, p2);
      
      expect(result).toEqual({ x: -1, y: 2 });
    });
  });

  describe('getPerpendicularNormal', () => {
    it('should return perpendicular unit vector', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 10, y: 0 };
      const result = getPerpendicularNormal(p1, p2);
      
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });

    it('should handle vertical line', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 0, y: 10 };
      const result = getPerpendicularNormal(p1, p2);
      
      expect(result.x).toBeCloseTo(-1);
      expect(result.y).toBeCloseTo(0);
    });

    it('should return zero vector for identical points', () => {
      const p1 = { x: 5, y: 5 };
      const p2 = { x: 5, y: 5 };
      const result = getPerpendicularNormal(p1, p2);
      
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  describe('distance', () => {
    it('should calculate distance correctly', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      const result = distance(p1, p2);
      
      expect(result).toBe(5);
    });

    it('should return zero for identical points', () => {
      const p1 = { x: 7, y: 2 };
      const p2 = { x: 7, y: 2 };
      const result = distance(p1, p2);
      
      expect(result).toBe(0);
    });
  });

  describe('getArcCenterFromChordAndOffset', () => {
    it('should calculate arc center with positive offset', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 10, y: 0 };
      const offset = 5;
      const result = getArcCenterFromChordAndOffset(p1, p2, offset);
      
      expect(result.x).toBeCloseTo(5);
      expect(result.y).toBeCloseTo(5);
    });

    it('should calculate arc center with negative offset', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 10, y: 0 };
      const offset = -5;
      const result = getArcCenterFromChordAndOffset(p1, p2, offset);
      
      expect(result.x).toBeCloseTo(5);
      expect(result.y).toBeCloseTo(-5);
    });
  });

  describe('calculateArcParameters', () => {
    it('should calculate arc parameters correctly', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 10, y: 0 };
      const offset = 5;
      const result = calculateArcParameters(p1, p2, offset);
      
      expect(result.center.x).toBeCloseTo(5);
      expect(result.center.y).toBeCloseTo(5);
      expect(result.radius).toBeCloseTo(Math.sqrt(50));
      expect(result.counterClockwise).toBe(false);
    });

    it('should set counterClockwise based on offset sign', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 10, y: 0 };
      
      const posResult = calculateArcParameters(p1, p2, 5);
      expect(posResult.counterClockwise).toBe(false);
      
      const negResult = calculateArcParameters(p1, p2, -5);
      expect(negResult.counterClockwise).toBe(true);
    });
  });

  describe('sagittaFromRadiusAndChord', () => {
    it('should calculate sagitta correctly', () => {
      const radius = 5;
      const chordLength = 6;
      const result = sagittaFromRadiusAndChord(radius, chordLength);
      
      // For radius=5, chord=6: sagitta = 5 - sqrt(25 - 9) = 5 - 4 = 1
      expect(result).toBeCloseTo(1);
    });

    it('should throw error if radius is too small', () => {
      expect(() => {
        sagittaFromRadiusAndChord(2, 6);
      }).toThrow('Radius must be greater than or equal to half the chord length');
    });
  });

  describe('radiusFromChordAndSagitta', () => {
    it('should calculate radius correctly', () => {
      const chordLength = 6;
      const sagitta = 1;
      const result = radiusFromChordAndSagitta(chordLength, sagitta);
      
      // For chord=6, sagitta=1: radius = (9 + 1) / 2 = 5
      expect(result).toBeCloseTo(5);
    });
  });

  describe('bulgeToSagitta and sagittaToBulge', () => {
    it('should convert between bulge and sagitta correctly', () => {
      const chordLength = 10;
      const sagitta = 2;
      const bulge = sagittaToBulge(sagitta, chordLength);
      
      expect(bulge).toBeCloseTo(0.4);
      
      const backToSagitta = bulgeToSagitta(bulge, chordLength);
      expect(backToSagitta).toBeCloseTo(sagitta);
    });
  });

  describe('arcIntersection', () => {
    it('should find intersection of two circles', () => {
      const center1 = { x: 0, y: 0 };
      const radius1 = 5;
      const center2 = { x: 6, y: 0 };
      const radius2 = 5;
      
      const result = arcIntersection(center1, radius1, center2, radius2);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.x).toBeCloseTo(3);
        expect(result.y).toBeCloseTo(4);
      }
    });

    it('should return null for non-intersecting circles', () => {
      const center1 = { x: 0, y: 0 };
      const radius1 = 2;
      const center2 = { x: 10, y: 0 };
      const radius2 = 2;
      
      const result = arcIntersection(center1, radius1, center2, radius2);
      
      expect(result).toBeNull();
    });

    it('should return null for circles where one contains the other', () => {
      const center1 = { x: 0, y: 0 };
      const radius1 = 10;
      const center2 = { x: 1, y: 0 };
      const radius2 = 2;
      
      const result = arcIntersection(center1, radius1, center2, radius2);
      
      expect(result).toBeNull();
    });
  });
});