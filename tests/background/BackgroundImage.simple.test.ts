import { vi, describe, beforeEach, it, expect } from 'vitest';
import { BackgroundImage, BackgroundImageData } from '../../src/background/BackgroundImage.js';
import { Point, HitRegion } from '../../src/core/types.js';

// Simple mocks to avoid image loading complexity
global.Image = class MockImage {
  onload: (() => void) | null = null;
  naturalWidth = 100;
  naturalHeight = 80;
  src = '';

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
} as any;

global.Blob = class MockBlob {
  size = 1024;
} as any;

global.performance = { now: () => Date.now() } as any;
global.document = {
  dispatchEvent: vi.fn(),
  getElementById: vi.fn(() => null),
  createElement: vi.fn(() => ({ id: '', appendChild: vi.fn() })),
  body: { appendChild: vi.fn() },
} as any;
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));

describe('BackgroundImage - Core Functionality', () => {
  describe('Basic Properties', () => {
    it('should create with default values', () => {
      const image = new BackgroundImage('data:image/png;base64,test');
      expect(image.id).toMatch(/^bg_img_/);
      expect(image.selected).toBe(false);
    });

    it('should create with custom id', () => {
      const image = new BackgroundImage('data:image/png;base64,test', { x: 0, y: 0 }, 'custom');
      expect(image.id).toBe('custom');
    });
  });

  describe('Transformations', () => {
    let image: BackgroundImage;

    beforeEach(async () => {
      image = new BackgroundImage('data:image/png;base64,test');
      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for load
    });

    it('should move correctly', () => {
      const initialCenter = image.getCenter();
      image.move({ x: 10, y: 5 });
      const newCenter = image.getCenter();

      expect(newCenter.x).toBe(initialCenter.x + 10);
      expect(newCenter.y).toBe(initialCenter.y + 5);
    });

    it('should clamp opacity', () => {
      image.setOpacity(0.7);
      expect(image.toJSON().opacity).toBe(0.7);

      image.setOpacity(-0.5);
      expect(image.toJSON().opacity).toBe(0);

      image.setOpacity(1.5);
      expect(image.toJSON().opacity).toBe(1);
    });

    it('should handle rotation', () => {
      image.setRotation(Math.PI / 4);
      expect(image.getRotation()).toBe(Math.PI / 4);
    });

    it('should maintain center when scaling', () => {
      const initialCenter = image.getCenter();
      image.setScale(2);
      const newCenter = image.getCenter();

      expect(Math.abs(newCenter.x - initialCenter.x)).toBeLessThan(0.001);
      expect(Math.abs(newCenter.y - initialCenter.y)).toBeLessThan(0.001);
    });
  });

  describe('Geometry', () => {
    let image: BackgroundImage;

    beforeEach(async () => {
      image = new BackgroundImage('data:image/png;base64,test');
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    it('should calculate bounds correctly', () => {
      const bounds = image.getBounds();
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
    });

    it('should test containment', () => {
      const center = image.getCenter();
      expect(image.contains(center)).toBe(true);
      expect(image.contains({ x: center.x + 1000, y: center.y })).toBe(false);
    });

    it('should detect hits', () => {
      const center = image.getCenter();
      const hitResult = image.hitTest(center, 1);
      expect(hitResult.region).toBe(HitRegion.BODY);

      const missResult = image.hitTest({ x: 9999, y: 9999 }, 1);
      expect(missResult.region).toBe(HitRegion.NONE);
    });
  });

  describe('Serialization', () => {
    it('should serialize and restore correctly', async () => {
      const image = new BackgroundImage('data:image/png;base64,test', { x: 10, y: 20 }, 'test_id');
      await new Promise((resolve) => setTimeout(resolve, 10));

      image.setOpacity(0.8);
      image.setRotation(Math.PI / 2);

      const json = image.toJSON();
      expect(json.id).toBe('test_id');
      expect(json.opacity).toBe(0.8);
      expect(json.rotation).toBe(Math.PI / 2);

      const restored = BackgroundImage.fromJSON(json);
      expect(restored.id).toBe('test_id');
      expect(restored.getRotation()).toBe(Math.PI / 2);
    });
  });
});
