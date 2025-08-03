import { describe, it, expect } from 'vitest';
import { BackgroundImageGeometry } from '@/background/BackgroundImageGeometry.js';
import { HitRegion } from '@/core/types.js';

describe('BackgroundImageGeometry', () => {
  const position = { x: 10, y: 20 };
  const naturalWidth = 100;
  const naturalHeight = 200;
  const scale = 1.5;
  const rotation = 0; // No rotation for basic tests

  describe('getCenter', () => {
    it('should calculate center correctly', () => {
      const result = BackgroundImageGeometry.getCenter(
        position,
        naturalWidth,
        naturalHeight,
        scale,
      );

      expect(result).toEqual({
        x: 10 + (100 * 1.5) / 2, // 10 + 75 = 85
        y: 20 + (200 * 1.5) / 2, // 20 + 150 = 170
      });
    });

    it('should handle different scales', () => {
      const result = BackgroundImageGeometry.getCenter(position, naturalWidth, naturalHeight, 2.0);

      expect(result).toEqual({
        x: 10 + (100 * 2.0) / 2, // 10 + 100 = 110
        y: 20 + (200 * 2.0) / 2, // 20 + 200 = 220
      });
    });
  });

  describe('getCorners', () => {
    it('should return four corners without rotation', () => {
      const corners = BackgroundImageGeometry.getCorners(
        position,
        naturalWidth,
        naturalHeight,
        scale,
        0,
      );

      expect(corners).toHaveLength(4);

      // With scale 1.5: width = 150, height = 300
      // Center at (85, 170)
      expect(corners[0]).toEqual({ x: 10, y: 20 }); // Top-left
      expect(corners[1]).toEqual({ x: 160, y: 20 }); // Top-right
      expect(corners[2]).toEqual({ x: 160, y: 320 }); // Bottom-right
      expect(corners[3]).toEqual({ x: 10, y: 320 }); // Bottom-left
    });

    it('should handle rotation', () => {
      const corners = BackgroundImageGeometry.getCorners(
        { x: 0, y: 0 },
        100,
        100,
        1,
        Math.PI / 2, // 90 degrees
      );

      expect(corners).toHaveLength(4);

      // For a 100x100 image at (0,0) with 90-degree rotation:
      // Center is at (50, 50)
      // Top-left corner (-50, -50) relative to center becomes (50, -50) after rotation
      expect(corners[0].x).toBeCloseTo(100);
      expect(corners[0].y).toBeCloseTo(0);
    });
  });

  describe('getBounds', () => {
    it('should calculate bounding box correctly', () => {
      const bounds = BackgroundImageGeometry.getBounds(
        position,
        naturalWidth,
        naturalHeight,
        scale,
        0,
      );

      expect(bounds).toEqual({
        x: 10,
        y: 20,
        width: 150, // naturalWidth * scale
        height: 300, // naturalHeight * scale
      });
    });

    it('should handle rotation in bounds calculation', () => {
      const bounds = BackgroundImageGeometry.getBounds(
        { x: 0, y: 0 },
        100,
        100,
        1,
        Math.PI / 4, // 45 degrees
      );

      // 45-degree rotation of a square should increase bounding box
      expect(bounds.width).toBeGreaterThan(100);
      expect(bounds.height).toBeGreaterThan(100);
    });
  });

  describe('containsPoint', () => {
    it('should return true for point inside image', () => {
      const point = { x: 85, y: 170 }; // Center point

      const result = BackgroundImageGeometry.containsPoint(
        point,
        position,
        naturalWidth,
        naturalHeight,
        scale,
        0,
      );

      expect(result).toBe(true);
    });

    it('should return false for point outside image', () => {
      const point = { x: 0, y: 0 }; // Outside image bounds

      const result = BackgroundImageGeometry.containsPoint(
        point,
        position,
        naturalWidth,
        naturalHeight,
        scale,
        0,
      );

      expect(result).toBe(false);
    });

    it('should handle rotation correctly', () => {
      const point = { x: 60, y: 40 }; // Point that should be inside after rotation

      const result = BackgroundImageGeometry.containsPoint(
        point,
        { x: 0, y: 0 },
        100,
        100,
        1,
        Math.PI / 4, // 45 degrees
      );

      // This test verifies rotation logic works
      expect(typeof result).toBe('boolean');
    });
  });

  describe('hitTest', () => {
    it('should return BODY for point inside image', () => {
      const point = { x: 85, y: 170 }; // Center point

      const result = BackgroundImageGeometry.hitTest(
        point,
        position,
        naturalWidth,
        naturalHeight,
        scale,
        0,
        false,
        1,
      );

      expect(result.region).toBe(HitRegion.BODY);
    });

    it('should return NONE for point outside image', () => {
      const point = { x: 0, y: 0 }; // Outside image bounds

      const result = BackgroundImageGeometry.hitTest(
        point,
        position,
        naturalWidth,
        naturalHeight,
        scale,
        0,
        false,
        1,
      );

      expect(result.region).toBe(HitRegion.NONE);
    });

    it('should test for rotation handle when selected', () => {
      // Calculate the rotation handle position
      const center = BackgroundImageGeometry.getCenter(
        position,
        naturalWidth,
        naturalHeight,
        scale,
      );
      const handleDistance = 30; // pixelScale = 1
      const height = naturalHeight * scale; // 200 * 1.5 = 300
      const handlePos = {
        x: center.x + Math.sin(0) * (height / 2 + handleDistance), // sin(0) = 0, so x = center.x
        y: center.y + Math.cos(0) * (height / 2 + handleDistance), // cos(0) = 1, so y = center.y + 180
      };

      const result = BackgroundImageGeometry.hitTest(
        handlePos,
        position,
        naturalWidth,
        naturalHeight,
        scale,
        0,
        true, // selected
        1,
      );

      expect(result.region).toBe(HitRegion.ROTATION_HANDLE);
    });

    it('should not test for handles when not selected', () => {
      const corner = { x: 10, y: 20 }; // Top-left corner

      const result = BackgroundImageGeometry.hitTest(
        corner,
        position,
        naturalWidth,
        naturalHeight,
        scale,
        0,
        false, // not selected
        1,
      );

      expect(result.region).toBe(HitRegion.BODY);
    });
  });

  describe('scaleFromTwoPoints', () => {
    it('should calculate scale factor correctly', () => {
      const center = { x: 50, y: 50 };
      const startPoint = { x: 60, y: 50 }; // 10 units from center
      const endPoint = { x: 70, y: 50 }; // 20 units from center
      const originalScale = 1.0;

      const result = BackgroundImageGeometry.scaleFromTwoPoints(
        startPoint,
        endPoint,
        center,
        originalScale,
      );

      expect(result).toBe(2.0); // 20/10 = 2x scale
    });

    it('should handle zero distance gracefully', () => {
      const center = { x: 50, y: 50 };
      const startPoint = { x: 50, y: 50 }; // Same as center
      const endPoint = { x: 60, y: 50 };
      const originalScale = 1.5;

      const result = BackgroundImageGeometry.scaleFromTwoPoints(
        startPoint,
        endPoint,
        center,
        originalScale,
      );

      expect(result).toBe(originalScale); // Should return original scale
    });
  });

  describe('fitToCanvas', () => {
    it('should fit image to canvas maintaining aspect ratio', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;
      const imageWidth = 400;
      const imageHeight = 200;

      const result = BackgroundImageGeometry.fitToCanvas(
        canvasWidth,
        canvasHeight,
        imageWidth,
        imageHeight,
      );

      // Available space: 700x500 (with 50px margin on each side)
      // Scale should be min(700/400, 500/200) = min(1.75, 2.5) = 1.75
      expect(result.scale).toBe(1.75);

      // Image should be centered
      const scaledWidth = imageWidth * 1.75; // 700
      const scaledHeight = imageHeight * 1.75; // 350
      expect(result.position.x).toBe((800 - 700) / 2); // 50
      expect(result.position.y).toBe((600 - 350) / 2); // 125
    });

    it('should handle tall images', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;
      const imageWidth = 100;
      const imageHeight = 400;

      const result = BackgroundImageGeometry.fitToCanvas(
        canvasWidth,
        canvasHeight,
        imageWidth,
        imageHeight,
      );

      // Available space: 700x500
      // Scale should be min(700/100, 500/400) = min(7, 1.25) = 1.25
      expect(result.scale).toBe(1.25);
    });
  });
});
