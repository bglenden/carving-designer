import { describe, it, expect } from 'vitest';
import { BackgroundImage } from '../../src/background/BackgroundImage.js';
import { BackgroundImageData } from '../../src/background/BackgroundImageData.js';

describe('Background Image Opacity Persistence', () => {
  const testImageData =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAFAqOy8NgAAAABJRU5ErkJggg==';

  it('should preserve opacity when serializing to JSON', () => {
    const image = new BackgroundImage(testImageData, { x: 10, y: 20 });
    image.setOpacity(0.75);

    const jsonData = image.toJSON();

    expect(jsonData.opacity).toBe(0.75);
    expect(jsonData.position).toEqual({ x: 10, y: 20 });
    expect(jsonData.imageData).toBe(testImageData);
  });

  it('should restore opacity when deserializing from JSON', () => {
    const originalOpacity = 0.3;
    const data: BackgroundImageData = {
      id: 'test-image',
      imageData: testImageData,
      position: { x: 5, y: 15 },
      rotation: 0.5,
      scale: 1.2,
      opacity: originalOpacity,
      naturalWidth: 100,
      naturalHeight: 80,
    };

    const restoredImage = BackgroundImage.fromJSON(data);
    const restoredJson = restoredImage.toJSON();

    expect(restoredJson.opacity).toBe(originalOpacity);
    expect(restoredJson.position).toEqual({ x: 5, y: 15 });
    expect(restoredJson.scale).toBe(1.2);
  });

  it('should handle opacity changes and maintain them in JSON round-trip', () => {
    // Create an image with default opacity
    const image = new BackgroundImage(testImageData, { x: 0, y: 0 });
    expect(image.toJSON().opacity).toBe(0.5); // Default opacity

    // Change opacity
    image.setOpacity(0.8);
    expect(image.toJSON().opacity).toBe(0.8);

    // Serialize and deserialize
    const jsonData = image.toJSON();
    const restoredImage = BackgroundImage.fromJSON(jsonData);

    // Verify opacity is preserved
    expect(restoredImage.toJSON().opacity).toBe(0.8);
  });

  it('should validate opacity in BackgroundImageData', () => {
    const validData = {
      id: 'test',
      imageData: testImageData,
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      opacity: 0.5,
      naturalWidth: 10,
      naturalHeight: 10,
    };

    expect(BackgroundImageData.validate(validData)).toBe(true);

    // Test missing opacity
    const invalidData = { ...validData };
    delete (invalidData as any).opacity;
    expect(BackgroundImageData.validate(invalidData)).toBe(false);
  });

  it('should create default opacity correctly', () => {
    const defaultData = BackgroundImageData.createDefault(testImageData);
    expect(defaultData.opacity).toBe(0.5);
  });
});
