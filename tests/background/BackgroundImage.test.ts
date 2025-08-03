import { vi, describe, beforeEach, it, expect } from 'vitest';
import { BackgroundImage, BackgroundImageData } from '../../src/background/BackgroundImage.js';
import { Point, HitRegion } from '../../src/core/types.js';

// Mock Image constructor
global.Image = class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 100;
  naturalHeight = 80;
  src = '';
  complete = false;
  
  constructor() {
    // Nothing here - loading triggered by setting src
  }
  
  set src(value: string) {
    this['_src'] = value;
    if (value && value !== '') {
      this.complete = true;
      // Simulate immediate loading for non-deferred images
      setTimeout(() => {
        if (this.onload) {
          this.onload();
        }
      }, 0);
    }
  }
  
  get src() {
    return this['_src'] || '';
  }
} as any;

// Mock Blob for testing
global.Blob = class MockBlob {
  size = 1024;
  constructor(data: any[]) {
    this.size = JSON.stringify(data).length;
  }
} as any;

// Mock performance
global.performance = {
  now: () => Date.now()
} as any;

// Mock document for event dispatching
const mockEventListeners: { [key: string]: EventListener[] } = {};
const mockCanvas = {
  width: 800,
  height: 600,
  getContext: vi.fn(() => ({
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    strokeRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    setLineDash: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
  }))
};

global.document = {
  ...global.document,
  dispatchEvent: vi.fn(),
  addEventListener: vi.fn((event: string, listener: EventListener) => {
    if (!mockEventListeners[event]) {
      mockEventListeners[event] = [];
    }
    mockEventListeners[event].push(listener);
  }),
  getElementById: vi.fn((id: string) => {
    if (id === 'design-canvas') {
      return mockCanvas;
    }
    return null;
  }),
  createElement: vi.fn((tag: string) => {
    if (tag === 'canvas') {
      return { ...mockCanvas };
    }
    return {};
  }),
  body: {
    appendChild: vi.fn()
  }
} as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  setTimeout(callback, 0);
  return 1;
});

describe('BackgroundImage', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Create mock canvas and context
    mockCanvas = document.createElement('canvas');
    mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      strokeRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      set globalAlpha(value: number) {},
      set fillStyle(value: string) {},
      set strokeStyle(value: string) {},
      set lineWidth(value: number) {},
      set font(value: string) {},
      set textAlign(value: string) {},
      set textBaseline(value: string) {},
      set shadowColor(value: string) {},
      set shadowBlur(value: number) {},
    } as any;

    vi.clearAllMocks();
  });

  describe('Constructor and Basic Properties', () => {
    it('should create image with default values', () => {
      const imageData = 'data:image/png;base64,mockdata';
      const image = new BackgroundImage(imageData);

      expect(image.id).toMatch(/^bg_img_/);
      expect(image.selected).toBe(false);
    });

    it('should create image with custom position and id', () => {
      const imageData = 'data:image/png;base64,mockdata';
      const position: Point = { x: 10, y: 20 };
      const customId = 'custom_id';

      const image = new BackgroundImage(imageData, position, customId);

      expect(image.id).toBe(customId);
    });

    it('should handle restored from JSON flag', () => {
      const imageData = 'data:image/png;base64,mockdata';
      const image = new BackgroundImage(imageData, { x: 0, y: 0 }, 'test', true);

      expect(image.id).toBe('test');
    });
  });

  describe('Transformation Methods', () => {
    let image: BackgroundImage;

    beforeEach(async () => {
      image = new BackgroundImage('data:image/png;base64,mockdata');
      // Wait for image to load
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should move image by delta', () => {
      const initialCenter = image.getCenter();
      const delta: Point = { x: 10, y: 5 };

      image.move(delta);
      const newCenter = image.getCenter();

      expect(newCenter.x).toBe(initialCenter.x + delta.x);
      expect(newCenter.y).toBe(initialCenter.y + delta.y);
    });

    it('should set opacity within valid range', () => {
      image.setOpacity(0.7);
      expect(image.toJSON().opacity).toBe(0.7);

      image.setOpacity(-0.5);
      expect(image.toJSON().opacity).toBe(0);

      image.setOpacity(1.5);
      expect(image.toJSON().opacity).toBe(1);
    });

    it('should set and get rotation', () => {
      const angle = Math.PI / 4;
      image.setRotation(angle);
      expect(image.getRotation()).toBe(angle);
    });

    it('should apply rotation angle', () => {
      const angle = Math.PI / 2;

      image.rotate(angle);
      
      // Check that rotation was applied
      expect(image.getRotation()).toBe(angle);
    });

    it('should set scale and adjust position to keep center fixed', () => {
      const initialCenter = image.getCenter();
      const newScale = 2;

      image.setScale(newScale);

      const newCenter = image.getCenter();
      expect(Math.abs(newCenter.x - initialCenter.x)).toBeLessThan(0.001);
      expect(Math.abs(newCenter.y - initialCenter.y)).toBeLessThan(0.001);
      expect(image.toJSON().scale).toBe(newScale);
    });

    it('should scale from two points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 10, y: 0 };
      const distanceMM = 20;
      const initialScale = image.toJSON().scale;

      image.scaleFromTwoPoints(p1, p2, distanceMM);

      // Distance between points is 10 pixels, desired distance is 20mm
      // Scale factor should be 20/10 = 2
      const expectedScale = initialScale * (distanceMM / 10);
      expect(image.toJSON().scale).toBe(expectedScale);
    });
  });

  describe('Bounds and Geometry', () => {
    let image: BackgroundImage;

    beforeEach(async () => {
      image = new BackgroundImage('data:image/png;base64,mockdata');
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should calculate correct bounds for non-rotated image', () => {
      const bounds = image.getBounds();
      const data = image.toJSON();

      expect(bounds.width).toBe(100 * data.scale); // naturalWidth * scale
      expect(bounds.height).toBe(80 * data.scale); // naturalHeight * scale
    });

    it('should calculate center point', () => {
      const center = image.getCenter();
      const data = image.toJSON();
      const expectedCenterX = data.position.x + (100 * data.scale) / 2;
      const expectedCenterY = data.position.y + (80 * data.scale) / 2;

      expect(center.x).toBe(expectedCenterX);
      expect(center.y).toBe(expectedCenterY);
    });

    it('should test point containment', () => {
      const center = image.getCenter();
      
      expect(image.contains(center)).toBe(true);
      expect(image.contains({ x: center.x + 1000, y: center.y })).toBe(false);
    });

    it('should calculate rotated bounds correctly', () => {
      image.setRotation(Math.PI / 4); // 45 degrees
      const bounds = image.getBounds();

      // Rotated rectangle should have larger bounds
      expect(bounds.width).toBeGreaterThan(100);
      expect(bounds.height).toBeGreaterThan(80);
    });
  });

  describe('Hit Testing', () => {
    let image: BackgroundImage;

    beforeEach(async () => {
      image = new BackgroundImage('data:image/png;base64,mockdata');
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should detect body hits', () => {
      const center = image.getCenter();
      const hitResult = image.hitTest(center, 1);

      expect(hitResult.region).toBe(HitRegion.BODY);
    });

    it('should detect rotation handle hits', () => {
      const center = image.getCenter();
      // Position above the image where rotation handle should be
      const handlePoint: Point = {
        x: center.x,
        y: center.y + (80 / 2) + 30 // half height + handle distance
      };

      const hitResult = image.hitTest(handlePoint, 1);

      expect(hitResult.region).toBe(HitRegion.ROTATION_HANDLE);
    });

    it('should return NONE for misses', () => {
      const farPoint: Point = { x: 1000, y: 1000 };
      const hitResult = image.hitTest(farPoint, 1);

      expect(hitResult.region).toBe(HitRegion.NONE);
    });

    it('should adjust hit testing based on scale', () => {
      const center = image.getCenter();
      const scale = 0.5; // Smaller scale means larger hit areas in screen space
      
      // Point that might be outside at scale 1 but inside at scale 0.5
      const testPoint: Point = {
        x: center.x,
        y: center.y + (80 / 2) + 40 // Further from image
      };

      const hitResult = image.hitTest(testPoint, scale);
      // At smaller scale, handle should be easier to hit
      expect(hitResult.region).toBe(HitRegion.ROTATION_HANDLE);
    });
  });

  describe('Canvas Fitting', () => {
    let image: BackgroundImage;

    beforeEach(async () => {
      image = new BackgroundImage('data:image/png;base64,mockdata');
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should fit image to canvas bounds', () => {
      const canvasBounds = { width: 200, height: 160 };
      const maxFillRatio = 0.8;
      const centerPoint: Point = { x: 10, y: 20 };

      image.fitToCanvas(canvasBounds, maxFillRatio, centerPoint);

      const data = image.toJSON();
      
      // Image should be scaled to fill 80% of canvas
      const expectedScaleX = (canvasBounds.width * maxFillRatio) / 100;
      const expectedScaleY = (canvasBounds.height * maxFillRatio) / 80;
      const expectedScale = Math.min(expectedScaleX, expectedScaleY);
      
      expect(data.scale).toBe(expectedScale);
      
      // Image should be centered at specified point
      const center = image.getCenter();
      expect(center.x).toBe(centerPoint.x);
      expect(center.y).toBe(centerPoint.y);
    });
  });

  describe('Drawing', () => {
    let image: BackgroundImage;

    beforeEach(async () => {
      image = new BackgroundImage('data:image/png;base64,mockdata');
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should draw normal image', () => {
      image.draw(mockContext, 1, false, false);

      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should draw selection outline when selected', () => {
      image.draw(mockContext, 1, true, false);

      expect(mockContext.strokeRect).toHaveBeenCalled();
      expect(mockContext.arc).toHaveBeenCalled(); // For rotation handle
    });

    it('should show hover state on rotation handle', () => {
      image.draw(mockContext, 1, true, true);

      expect(mockContext.fill).toHaveBeenCalled(); // Handle should be filled
    });

    it('should draw loading placeholder for restored images', () => {
      const restoredImage = new BackgroundImage('data:image/png;base64,mockdata', { x: 0, y: 0 }, 'test', true);
      
      restoredImage.draw(mockContext, 1, false, false);

      expect(mockContext.fillRect).toHaveBeenCalled(); // Loading placeholder
      expect(mockContext.fillText).toHaveBeenCalledWith('Loading...', 0, 0);
    });
  });

  describe('Image Data Updates', () => {
    let image: BackgroundImage;

    beforeEach(async () => {
      image = new BackgroundImage('data:image/png;base64,mockdata');
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should update image data and image element', () => {
      const newImageData = 'data:image/jpeg;base64,newdata';
      const newImg = new Image();

      image.updateImageData(newImageData, newImg as HTMLImageElement);

      expect(image.toJSON().imageData).toBe(newImageData);
    });
  });

  describe('Serialization', () => {
    let image: BackgroundImage;

    beforeEach(async () => {
      image = new BackgroundImage('data:image/png;base64,mockdata', { x: 10, y: 20 }, 'test_id');
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should serialize to JSON correctly', () => {
      image.setOpacity(0.8);
      image.setRotation(Math.PI / 2);
      image.setScale(1.5);

      const json = image.toJSON();

      expect(json.id).toBe('test_id');
      expect(json.imageData).toBe('data:image/png;base64,mockdata');
      expect(json.rotation).toBe(Math.PI / 2);
      expect(json.scale).toBe(1.5);
      expect(json.opacity).toBe(0.8);
      expect(json.naturalWidth).toBe(100);
      expect(json.naturalHeight).toBe(80);
      // Position will have changed due to setScale keeping center fixed
      expect(json.position).toBeDefined();
      expect(json.position.x).toBeCloseTo(-15, 1);
      expect(json.position.y).toBeCloseTo(0, 1);
    });

    it('should restore from JSON correctly', () => {
      const jsonData: BackgroundImageData = {
        id: 'restored_id',
        imageData: 'data:image/png;base64,restored',
        position: { x: 30, y: 40 },
        rotation: Math.PI / 3,
        scale: 2,
        opacity: 0.6,
        naturalWidth: 150,
        naturalHeight: 120
      };

      const restoredImage = BackgroundImage.fromJSON(jsonData);

      expect(restoredImage.id).toBe('restored_id');
      expect(restoredImage.getRotation()).toBe(Math.PI / 3);
      
      const restoredData = restoredImage.toJSON();
      expect(restoredData).toEqual(jsonData);
    });

    it('should preserve all properties through serialization round-trip', () => {
      image.setOpacity(0.75);
      image.setRotation(Math.PI / 6);
      image.setScale(0.8);
      image.move({ x: 5, y: -3 });

      const json = image.toJSON();
      const restored = BackgroundImage.fromJSON(json);
      const restoredJson = restored.toJSON();

      expect(restoredJson).toEqual(json);
    });
  });

  describe('Performance and Loading', () => {
    it('should handle lazy loading for restored images', async () => {
      const restoredImage = new BackgroundImage('data:image/png;base64,test', { x: 0, y: 0 }, 'test', true);
      
      // First draw should trigger lazy loading
      restoredImage.draw(mockContext, 1, false, false);
      
      // Should draw loading placeholder initially
      expect(mockContext.fillText).toHaveBeenCalledWith('Loading...', 0, 0);
    });

    it('should dispatch event when lazy loading completes', async () => {
      const restoredImage = new BackgroundImage('data:image/png;base64,test', { x: 0, y: 0 }, 'test', true);
      
      restoredImage.draw(mockContext, 1, false, false);
      
      // Wait for async loading
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'backgroundImageLoaded'
        })
      );
    });
  });
});