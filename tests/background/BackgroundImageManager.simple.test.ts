import { vi, describe, beforeEach, it, expect } from 'vitest';
import { BackgroundImageManager } from '../../src/background/BackgroundImageManager.js';
import { BackgroundImage } from '../../src/background/BackgroundImage.js';
import { Point, HitRegion } from '../../src/core/types.js';

// Mock BackgroundImage to avoid image loading complexity
vi.mock('../../src/background/BackgroundImage.js', () => ({
  BackgroundImage: vi.fn().mockImplementation((imageData: string, position?: Point, id?: string) => {
    const mockId = id || `mock_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: mockId,
      selected: false,
      setOpacity: vi.fn(),
      hitTest: vi.fn(() => ({ region: HitRegion.NONE })),
      draw: vi.fn(),
      toJSON: vi.fn(() => ({ id: mockId, imageData, position: position || { x: 0, y: 0 } })),
    };
  })
}));

// Ensure document.getElementById exists for setupTests.ts compatibility
global.document = global.document || {};
if (!global.document.getElementById) {
  global.document.getElementById = vi.fn(() => null);
}
if (!global.document.createElement) {
  global.document.createElement = vi.fn(() => ({ id: '', appendChild: vi.fn() }));
}
if (!global.document.body) {
  global.document.body = { appendChild: vi.fn() };
}

describe('BackgroundImageManager - Core Functionality', () => {
  let manager: BackgroundImageManager;

  beforeEach(() => {
    manager = new BackgroundImageManager();
    vi.clearAllMocks();
  });

  describe('Image Management', () => {
    it('should start empty', () => {
      expect(manager.getImages()).toHaveLength(0);
      expect(manager.getSelectedImage()).toBeNull();
    });

    it('should add images', () => {
      const image = manager.addImage('data1');
      expect(manager.getImages()).toHaveLength(1);
      expect(manager.getImages()[0]).toBe(image);
      expect(image.setOpacity).toHaveBeenCalledWith(0.5); // Default opacity
    });

    it('should remove images', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');
      
      manager.removeImage(image1);
      const images = manager.getImages();
      
      expect(images).toHaveLength(1);
      expect(images[0]).toBe(image2);
    });

    it('should clear all images', () => {
      manager.addImage('data1');
      manager.addImage('data2');
      
      manager.clear();
      
      expect(manager.getImages()).toHaveLength(0);
      expect(manager.getSelectedImage()).toBeNull();
    });
  });

  describe('Selection Management', () => {
    it('should select and deselect images', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.setSelectedImage(image1);
      expect(manager.getSelectedImage()).toBe(image1);
      expect(image1.selected).toBe(true);

      manager.setSelectedImage(image2);
      expect(manager.getSelectedImage()).toBe(image2);
      expect(image1.selected).toBe(false);
      expect(image2.selected).toBe(true);

      manager.clearSelection();
      expect(manager.getSelectedImage()).toBeNull();
      expect(image2.selected).toBe(false);
    });

    it('should remove selected image', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.setSelectedImage(image1);
      const result = manager.removeSelectedImage();

      expect(result).toBe(true);
      expect(manager.getSelectedImage()).toBeNull();
      expect(manager.getImages()).toHaveLength(1);
      expect(manager.getImages()[0]).toBe(image2);
    });

    it('should handle remove when nothing selected', () => {
      manager.addImage('data1');
      const result = manager.removeSelectedImage();

      expect(result).toBe(false);
      expect(manager.getImages()).toHaveLength(1);
    });
  });

  describe('Opacity Management', () => {
    it('should set global opacity', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.setGlobalOpacity(0.8);

      expect(manager.getGlobalOpacity()).toBe(0.8);
      expect(image1.setOpacity).toHaveBeenCalledWith(0.8);
      expect(image2.setOpacity).toHaveBeenCalledWith(0.8);
    });

    it('should clamp opacity values', () => {
      manager.setGlobalOpacity(-0.5);
      expect(manager.getGlobalOpacity()).toBe(0);

      manager.setGlobalOpacity(1.5);
      expect(manager.getGlobalOpacity()).toBe(1);
    });

    it('should apply global opacity to new images', () => {
      manager.setGlobalOpacity(0.7);
      const newImage = manager.addImage('newdata');

      expect(newImage.setOpacity).toHaveBeenCalledWith(0.7);
    });
  });

  describe('Layer Management', () => {
    it('should move image to front', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');
      const image3 = manager.addImage('data3');

      manager.moveToFront(image1);

      const images = manager.getImages();
      expect(images[images.length - 1]).toBe(image1);
    });

    it('should move image to back', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');
      const image3 = manager.addImage('data3');

      manager.moveToBack(image3);

      const images = manager.getImages();
      expect(images[0]).toBe(image3);
    });
  });

  describe('Hit Testing', () => {
    it('should test images in reverse order', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');
      const image3 = manager.addImage('data3');

      // Set up hit test behavior
      (image1.hitTest as any).mockReturnValue({ region: HitRegion.NONE });
      (image2.hitTest as any).mockReturnValue({ region: HitRegion.BODY });
      (image3.hitTest as any).mockReturnValue({ region: HitRegion.NONE });

      const result = manager.hitTest({ x: 100, y: 100 }, 1);

      // Should test in reverse order and stop at first hit
      expect(image3.hitTest).toHaveBeenCalled();
      expect(image2.hitTest).toHaveBeenCalled();
      expect(image1.hitTest).not.toHaveBeenCalled();

      expect(result.image).toBe(image2);
      expect(result.hitResult.region).toBe(HitRegion.BODY);
    });

    it('should return null when no hits', () => {
      const image1 = manager.addImage('data1');
      (image1.hitTest as any).mockReturnValue({ region: HitRegion.NONE });

      const result = manager.hitTest({ x: 100, y: 100 }, 1);

      expect(result.image).toBeNull();
      expect(result.hitResult.region).toBe(HitRegion.NONE);
    });
  });

  describe('Drawing', () => {
    it('should draw all images', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      const mockContext = {} as any;
      manager.draw(mockContext, 1);

      expect(image1.draw).toHaveBeenCalledWith(mockContext, 1, false, false);
      expect(image2.draw).toHaveBeenCalledWith(mockContext, 1, false, false);
    });

    it('should indicate selected image in draw call', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      manager.setSelectedImage(image1);

      const mockContext = {} as any;
      manager.draw(mockContext, 1);

      expect(image1.draw).toHaveBeenCalledWith(mockContext, 1, true, false);
      expect(image2.draw).toHaveBeenCalledWith(mockContext, 1, false, false);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const image1 = manager.addImage('data1');
      const image2 = manager.addImage('data2');

      const json = manager.toJSON();

      expect(json).toHaveLength(2);
      expect(image1.toJSON).toHaveBeenCalled();
      expect(image2.toJSON).toHaveBeenCalled();
    });

    it('should handle empty serialization', () => {
      const json = manager.toJSON();
      expect(json).toEqual([]);
    });
  });
});