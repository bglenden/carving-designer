import { describe, it, expect } from 'vitest';
import { BackgroundImageData, IBackgroundImageData } from '@/background/BackgroundImageData.js';

describe('BackgroundImageData', () => {
  const sampleData: IBackgroundImageData = {
    id: 'test-id',
    imageData: 'data:image/png;base64,test',
    position: { x: 10, y: 20 },
    rotation: 0.5,
    scale: 1.5,
    opacity: 0.8,
    naturalWidth: 100,
    naturalHeight: 200,
  };

  describe('toJSON', () => {
    it('should convert data to JSON format', () => {
      const result = BackgroundImageData.toJSON(sampleData);

      expect(result).toEqual({
        id: 'test-id',
        imageData: 'data:image/png;base64,test',
        position: { x: 10, y: 20 },
        rotation: 0.5,
        scale: 1.5,
        opacity: 0.8,
        naturalWidth: 100,
        naturalHeight: 200,
      });
    });

    it('should create a copy of the position object', () => {
      const result = BackgroundImageData.toJSON(sampleData);

      expect(result.position).not.toBe(sampleData.position);
      expect(result.position).toEqual(sampleData.position);
    });
  });

  describe('fromJSON', () => {
    it('should create data from valid JSON', () => {
      const json = {
        id: 'test-id',
        imageData: 'data:image/png;base64,test',
        position: { x: 10, y: 20 },
        rotation: 0.5,
        scale: 1.5,
        opacity: 0.8,
        naturalWidth: 100,
        naturalHeight: 200,
      };

      const result = BackgroundImageData.fromJSON(json);

      expect(result).toEqual(sampleData);
    });

    it('should create a copy of the position object', () => {
      const json = {
        id: 'test-id',
        imageData: 'data:image/png;base64,test',
        position: { x: 10, y: 20 },
        rotation: 0.5,
        scale: 1.5,
        opacity: 0.8,
        naturalWidth: 100,
        naturalHeight: 200,
      };

      const result = BackgroundImageData.fromJSON(json);

      expect(result.position).not.toBe(json.position);
      expect(result.position).toEqual(json.position);
    });

    it('should throw error for invalid data', () => {
      expect(() => {
        BackgroundImageData.fromJSON({});
      }).toThrow('Invalid background image data format');
    });
  });

  describe('validate', () => {
    it('should return true for valid data', () => {
      const validData = {
        id: 'test-id',
        imageData: 'data:image/png;base64,test',
        position: { x: 10, y: 20 },
        rotation: 0.5,
        scale: 1.5,
        opacity: 0.8,
        naturalWidth: 100,
        naturalHeight: 200,
      };

      expect(BackgroundImageData.validate(validData)).toBe(true);
    });

    it('should return false for null/undefined', () => {
      expect(BackgroundImageData.validate(null)).toBe(false);
      expect(BackgroundImageData.validate(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(BackgroundImageData.validate('string')).toBe(false);
      expect(BackgroundImageData.validate(123)).toBe(false);
    });

    it('should return false for missing required fields', () => {
      const incompleteData = {
        id: 'test-id',
        imageData: 'data:image/png;base64,test',
        // missing position and other fields
      };

      expect(BackgroundImageData.validate(incompleteData)).toBe(false);
    });

    it('should return false for invalid position', () => {
      const invalidPosition = {
        id: 'test-id',
        imageData: 'data:image/png;base64,test',
        position: { x: 'invalid', y: 20 },
        rotation: 0.5,
        scale: 1.5,
        opacity: 0.8,
        naturalWidth: 100,
        naturalHeight: 200,
      };

      expect(BackgroundImageData.validate(invalidPosition)).toBe(false);
    });

    it('should return false for invalid numeric fields', () => {
      const invalidNumeric = {
        id: 'test-id',
        imageData: 'data:image/png;base64,test',
        position: { x: 10, y: 20 },
        rotation: 'invalid',
        scale: 1.5,
        opacity: 0.8,
        naturalWidth: 100,
        naturalHeight: 200,
      };

      expect(BackgroundImageData.validate(invalidNumeric)).toBe(false);
    });

    it('should return false for invalid string fields', () => {
      const invalidString = {
        id: 123,
        imageData: 'data:image/png;base64,test',
        position: { x: 10, y: 20 },
        rotation: 0.5,
        scale: 1.5,
        opacity: 0.8,
        naturalWidth: 100,
        naturalHeight: 200,
      };

      expect(BackgroundImageData.validate(invalidString)).toBe(false);
    });
  });

  describe('createDefault', () => {
    it('should create default data with provided values', () => {
      const imageData = 'data:image/png;base64,test';
      const position = { x: 50, y: 60 };
      const id = 'custom-id';

      const result = BackgroundImageData.createDefault(imageData, position, id);

      expect(result).toEqual({
        id: 'custom-id',
        imageData: 'data:image/png;base64,test',
        position: { x: 50, y: 60 },
        rotation: 0,
        scale: 1,
        opacity: 0.5,
        naturalWidth: 0,
        naturalHeight: 0,
      });
    });

    it('should create default data with auto-generated ID', () => {
      const imageData = 'data:image/png;base64,test';

      const result = BackgroundImageData.createDefault(imageData);

      expect(result.id).toMatch(/^bg_img_[a-z0-9]+$/);
      expect(result.imageData).toBe(imageData);
      expect(result.position).toEqual({ x: 0, y: 0 });
      expect(result.rotation).toBe(0);
      expect(result.scale).toBe(1);
      expect(result.opacity).toBe(0.5);
    });

    it('should copy the position object', () => {
      const imageData = 'data:image/png;base64,test';
      const position = { x: 50, y: 60 };

      const result = BackgroundImageData.createDefault(imageData, position);

      expect(result.position).not.toBe(position);
      expect(result.position).toEqual(position);
    });
  });
});
