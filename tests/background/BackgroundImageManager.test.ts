import { vi, describe, beforeEach, it, expect } from 'vitest';
import { BackgroundImageManager } from '../../src/background/BackgroundImageManager.js';
import { BackgroundImage, BackgroundImageData } from '../../src/background/BackgroundImage.js';
import { Point, HitRegion } from '../../src/core/types.js';

// Mock the BackgroundImage class to avoid dealing with actual images in tests
vi.mock('../../src/background/BackgroundImage.js', () => {
  return {
    BackgroundImage: vi
      .fn()
      .mockImplementation((imageData: string, position: Point = { x: 0, y: 0 }, id?: string) => ({
        id: id || `mock_${Math.random().toString(36).substr(2, 9)}`,
        selected: false,
        setOpacity: vi.fn(),
        hitTest: vi.fn(() => ({ region: HitRegion.NONE })),
        draw: vi.fn(),
        toJSON: vi.fn(function () {
          return { id: this.id, data: imageData };
        }),
      })),
    BackgroundImageData: {}, // Export the type
  };
});

describe('BackgroundImageManager', () => {
  let manager: BackgroundImageManager;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    manager = new BackgroundImageManager();

    // Create mock canvas and context
    mockCanvas = document.createElement('canvas');
    mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      drawImage: vi.fn(),
    } as any;

    vi.clearAllMocks();
  });

  describe('Image Management', () => {
    it('should start with no images', () => {
      expect(manager.getImages()).toEqual([]);
      expect(manager.getSelectedImage()).toBeNull();
    });

    it('should add images correctly', () => {
      const imageData = 'data:image/png;base64,mockdata';
      const position: Point = { x: 10, y: 20 };

      const image = manager.addImage(imageData, position);

      expect(image).toBeDefined();
      expect(image.setOpacity).toHaveBeenCalledWith(0.5); // Default global opacity
      expect(manager.getImages()).toHaveLength(1);
      expect(manager.getImages()[0]).toBe(image);
    });

    it('should add multiple images', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');
      const image3 = manager.addImage('data3');

      const images = manager.getImages();
      expect(images).toHaveLength(3);
      expect(images).toContain(image1);
      expect(images).toContain(image2);
      expect(images).toContain(image3);
    });

    it('should remove images correctly', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.removeImage(image1);

      const images = manager.getImages();
      expect(images).toHaveLength(1);
      expect(images[0]).toBe(image2);
      expect(images).not.toContain(image1);
    });

    it('should handle removing non-existent image gracefully', () => {
      const image1 = manager.addImage('data1');
      const fakeImage = { id: 'fake' } as any;

      // Should not throw
      expect(() => manager.removeImage(fakeImage)).not.toThrow();

      // Original image should still be there
      expect(manager.getImages()).toHaveLength(1);
      expect(manager.getImages()[0]).toBe(image1);
    });

    it('should clear all images', () => {
      manager.addImage('data1');
      manager.addImage('data2');
      manager.setSelectedImage(manager.getImages()[0]);

      manager.clear();

      expect(manager.getImages()).toHaveLength(0);
      expect(manager.getSelectedImage()).toBeNull();
    });
  });

  describe('Selection Management', () => {
    it('should select and deselect images', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      // Select first image
      manager.setSelectedImage(image1);
      expect(manager.getSelectedImage()).toBe(image1);
      expect(image1.selected).toBe(true);

      // Select second image (should deselect first)
      manager.setSelectedImage(image2);
      expect(manager.getSelectedImage()).toBe(image2);
      expect(image1.selected).toBe(false);
      expect(image2.selected).toBe(true);

      // Clear selection
      manager.clearSelection();
      expect(manager.getSelectedImage()).toBeNull();
      expect(image2.selected).toBe(false);
    });

    it('should handle selecting the same image twice', () => {
      const image = manager.addImage('data');

      manager.setSelectedImage(image);
      const firstCallCount = (image as any).selected;

      // Select same image again
      manager.setSelectedImage(image);

      expect(manager.getSelectedImage()).toBe(image);
      expect(image.selected).toBe(true);
    });

    it('should remove selected image and clear selection', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.setSelectedImage(image1);
      expect(manager.getSelectedImage()).toBe(image1);

      manager.removeImage(image1);
      expect(manager.getSelectedImage()).toBeNull();
      expect(manager.getImages()).toHaveLength(1);
      expect(manager.getImages()[0]).toBe(image2);
    });

    it('should remove selected image via removeSelectedImage', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.setSelectedImage(image1);
      const result = manager.removeSelectedImage();

      expect(result).toBe(true);
      expect(manager.getSelectedImage()).toBeNull();
      expect(manager.getImages()).toHaveLength(1);
      expect(manager.getImages()[0]).toBe(image2);
    });

    it('should handle removeSelectedImage when no image is selected', () => {
      manager.addImage('data1');
      manager.addImage('data2');

      const result = manager.removeSelectedImage();

      expect(result).toBe(false);
      expect(manager.getImages()).toHaveLength(2);
    });
  });

  describe('Layer Management', () => {
    it('should move image to front', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');
      const image3 = manager.addImage('data3');

      // Move first image to front
      manager.moveToFront(image1);

      const images = manager.getImages();
      expect(images[images.length - 1]).toBe(image1); // Should be last (front)
      expect(images.indexOf(image1)).toBe(2);
    });

    it('should move image to back', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');
      const image3 = manager.addImage('data3');

      // Move last image to back
      manager.moveToBack(image3);

      const images = manager.getImages();
      expect(images[0]).toBe(image3); // Should be first (back)
      expect(images.indexOf(image3)).toBe(0);
    });

    it('should handle moving front image to front (no-op)', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.moveToFront(image2); // Already at front

      const images = manager.getImages();
      expect(images[1]).toBe(image2);
      expect(images[0]).toBe(image1);
    });

    it('should handle moving back image to back (no-op)', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.moveToBack(image1); // Already at back

      const images = manager.getImages();
      expect(images[0]).toBe(image1);
      expect(images[1]).toBe(image2);
    });
  });

  describe('Opacity Management', () => {
    it('should set global opacity and update all images', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.setGlobalOpacity(0.8);

      expect(manager.getGlobalOpacity()).toBe(0.8);
      expect(image1.setOpacity).toHaveBeenCalledWith(0.8);
      expect(image2.setOpacity).toHaveBeenCalledWith(0.8);
    });

    it('should clamp opacity values to 0-1 range', () => {
      manager.setGlobalOpacity(-0.5);
      expect(manager.getGlobalOpacity()).toBe(0);

      manager.setGlobalOpacity(1.5);
      expect(manager.getGlobalOpacity()).toBe(1);

      manager.setGlobalOpacity(0.3);
      expect(manager.getGlobalOpacity()).toBe(0.3);
    });

    it('should apply global opacity to new images', () => {
      manager.setGlobalOpacity(0.7);
      const newImage = manager.addImage('newdata');

      expect(newImage.setOpacity).toHaveBeenCalledWith(0.7);
    });
  });

  describe('Hit Testing', () => {
    it('should perform hit testing on images in reverse order', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');
      const image3 = manager.addImage('data3');

      const testPoint: Point = { x: 100, y: 100 };
      const mockScale = 1.5;

      // Clear previous calls and set up new behavior
      vi.clearAllMocks();
      (image1.hitTest as any).mockReturnValue({ region: HitRegion.NONE });
      (image2.hitTest as any).mockReturnValue({ region: HitRegion.BODY });
      (image3.hitTest as any).mockReturnValue({ region: HitRegion.NONE });

      const result = manager.hitTest(testPoint, mockScale);

      // Should test images in reverse order (3, 2, 1) and return first hit
      expect(image3.hitTest).toHaveBeenCalledWith(testPoint, mockScale);
      expect(image2.hitTest).toHaveBeenCalledWith(testPoint, mockScale);
      expect(image1.hitTest).not.toHaveBeenCalled(); // Should stop after finding hit

      expect(result.image).toBe(image2);
      expect(result.hitResult.region).toBe(HitRegion.BODY);
    });

    it('should return null image when no hits found', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      // Ensure all images return no hit
      (image1.hitTest as any).mockReturnValue({ region: HitRegion.NONE });
      (image2.hitTest as any).mockReturnValue({ region: HitRegion.NONE });

      const testPoint: Point = { x: 100, y: 100 };
      const result = manager.hitTest(testPoint, 1);

      expect(result.image).toBeNull();
      expect(result.hitResult.region).toBe(HitRegion.NONE);
    });

    it('should handle empty image list', () => {
      const testPoint: Point = { x: 100, y: 100 };
      const result = manager.hitTest(testPoint, 1);

      expect(result.image).toBeNull();
      expect(result.hitResult.region).toBe(HitRegion.NONE);
    });
  });

  describe('Drawing', () => {
    it('should draw all images in order', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');
      const image3 = manager.addImage('data3');

      const mockScale = 2;
      manager.draw(mockContext, mockScale);

      expect(image1.draw).toHaveBeenCalledWith(mockContext, mockScale, false, false);
      expect(image2.draw).toHaveBeenCalledWith(mockContext, mockScale, false, false);
      expect(image3.draw).toHaveBeenCalledWith(mockContext, mockScale, false, false);
    });

    it('should draw selected image with selection state', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.setSelectedImage(image1);
      manager.draw(mockContext, 1);

      expect(image1.draw).toHaveBeenCalledWith(mockContext, 1, true, false);
      expect(image2.draw).toHaveBeenCalledWith(mockContext, 1, false, false);
    });

    it('should draw with hover highlights', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.draw(mockContext, 1, image1, HitRegion.ROTATION_HANDLE);

      expect(image1.draw).toHaveBeenCalledWith(mockContext, 1, false, true);
      expect(image2.draw).toHaveBeenCalledWith(mockContext, 1, false, false);
    });

    it('should handle drawing with no images', () => {
      expect(() => manager.draw(mockContext, 1)).not.toThrow();
    });
  });

  describe('Serialization', () => {
    it('should serialize images to JSON', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      (image1.toJSON as any).mockReturnValue({ id: 'img1', data: 'data1' });
      (image2.toJSON as any).mockReturnValue({ id: 'img2', data: 'data2' });

      const json = manager.toJSON();

      expect(json).toHaveLength(2);
      expect(json).toEqual([
        { id: 'img1', data: 'data1' },
        { id: 'img2', data: 'data2' },
      ]);
    });

    it('should handle empty image list serialization', () => {
      const json = manager.toJSON();
      expect(json).toEqual([]);
    });

    it('should restore from JSON data', async () => {
      // Add fromJSON as a static method to the mock
      const { BackgroundImage } = await import('../../src/background/BackgroundImage.js');
      (BackgroundImage as any).fromJSON = vi.fn((data: any) => {
        const mockImage = {
          id: data.id,
          selected: false,
          setOpacity: vi.fn(),
          hitTest: vi.fn(() => ({ region: HitRegion.NONE })),
          draw: vi.fn(),
          toJSON: vi.fn(() => data),
        };
        return mockImage;
      });

      const mockData: BackgroundImageData[] = [
        {
          id: 'img1',
          imageData: 'data1',
          position: { x: 10, y: 20 },
          rotation: 0,
          scale: 1,
          opacity: 0.5,
          naturalWidth: 100,
          naturalHeight: 100,
        },
        {
          id: 'img2',
          imageData: 'data2',
          position: { x: 30, y: 40 },
          rotation: Math.PI / 4,
          scale: 1.5,
          opacity: 0.8,
          naturalWidth: 200,
          naturalHeight: 150,
        },
      ];

      manager.fromJSON(mockData);

      expect(manager.getImages()).toHaveLength(2);
      expect(manager.getSelectedImage()).toBeNull(); // Selection should be cleared
    });

    it('should handle empty JSON data', () => {
      manager.addImage('existing'); // Add an image first
      manager.fromJSON([]);

      expect(manager.getImages()).toHaveLength(0);
      expect(manager.getSelectedImage()).toBeNull();
    });
  });
});
