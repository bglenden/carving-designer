import { describe, it, expect } from 'vitest';
import { SchemaValidator } from '../../src/persistence/SchemaValidator.js';

describe('SchemaValidator', () => {
  describe('validateDesignData', () => {
    it('validates valid design data with minimal structure', () => {
      const validData = {
        version: '2.0',
        shapes: [],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(validData)).toBe(true);
    });

    it('validates design data with valid Leaf shapes', () => {
      const validData = {
        version: '2.0',
        shapes: [
          {
            type: 'LEAF',
            vertices: [{ x: 100, y: 200 }, { x: 150, y: 250 }],
            radius: 30
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(validData)).toBe(true);
    });

    it('validates design data with valid TriArc shapes', () => {
      const validData = {
        version: '2.0',
        shapes: [
          {
            type: 'TRI_ARC',
            vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
            curvatures: [-0.2, -0.3, -0.1]
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(validData)).toBe(true);
    });

    it('validates design data with multiple shape types', () => {
      const validData = {
        version: '2.0',
        shapes: [
          {
            type: 'LEAF',
            vertices: [{ x: 100, y: 200 }, { x: 150, y: 250 }],
            radius: 30
          },
          {
            type: 'TRI_ARC',
            vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
            curvatures: [-0.2, -0.3, -0.1]
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(validData)).toBe(true);
    });

    it('validates design data with background images', () => {
      const validData = {
        version: '2.0',
        shapes: [],
        backgroundImages: [
          {
            id: 'bg1',
            imageData: 'data:image/png;base64,abc123',
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: 1,
            opacity: 0.5
          }
        ]
      };

      expect(SchemaValidator.validateDesignData(validData)).toBe(true);
    });

    it('validates design data with metadata', () => {
      const validData = {
        version: '2.0',
        shapes: [],
        backgroundImages: [],
        metadata: {
          name: 'Test Design',
          author: 'Test Author',
          created: '2023-01-01',
          description: 'A test design'
        }
      };

      expect(SchemaValidator.validateDesignData(validData)).toBe(true);
    });

    it('rejects null data', () => {
      expect(SchemaValidator.validateDesignData(null)).toBe(false);
    });

    it('rejects undefined data', () => {
      expect(SchemaValidator.validateDesignData(undefined)).toBe(false);
    });

    it('rejects non-object data', () => {
      expect(SchemaValidator.validateDesignData('string')).toBe(false);
      expect(SchemaValidator.validateDesignData(123)).toBe(false);
      expect(SchemaValidator.validateDesignData([])).toBe(false);
    });

    it('rejects data missing version', () => {
      const invalidData = {
        shapes: [],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects data with invalid version type', () => {
      const invalidData = {
        version: 123,
        shapes: [],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects data with non-array shapes', () => {
      const invalidData = {
        version: '2.0',
        shapes: 'not an array',
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects Leaf shape missing vertices', () => {
      const invalidData = {
        version: '2.0',
        shapes: [
          {
            type: 'LEAF',
            radius: 30
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects Leaf shape with invalid vertices', () => {
      const invalidData = {
        version: '2.0',
        shapes: [
          {
            type: 'LEAF',
            vertices: [{ x: 'invalid', y: 200 }],
            radius: 30
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects Leaf shape missing radius', () => {
      const invalidData = {
        version: '2.0',
        shapes: [
          {
            type: 'LEAF',
            vertices: [{ x: 100, y: 200 }, { x: 150, y: 250 }]
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects TriArc shape missing vertices', () => {
      const invalidData = {
        version: '2.0',
        shapes: [
          {
            type: 'TRI_ARC',
            curvatures: [-0.2, -0.3, -0.1]
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects TriArc shape with invalid curvatures', () => {
      const invalidData = {
        version: '2.0',
        shapes: [
          {
            type: 'TRI_ARC',
            vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
            curvatures: ['invalid', -0.3, -0.1]
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects TriArc shape missing curvatures', () => {
      const invalidData = {
        version: '2.0',
        shapes: [
          {
            type: 'TRI_ARC',
            vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }]
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects shape with missing type', () => {
      const invalidData = {
        version: '2.0',
        shapes: [
          {
            vertices: [{ x: 100, y: 200 }, { x: 150, y: 250 }],
            radius: 30
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects shape with invalid type', () => {
      const invalidData = {
        version: '2.0',
        shapes: [
          {
            type: 123,
            vertices: [{ x: 100, y: 200 }, { x: 150, y: 250 }],
            radius: 30
          }
        ],
        backgroundImages: []
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects data with non-array backgroundImages', () => {
      const invalidData = {
        version: '2.0',
        shapes: [],
        backgroundImages: 'not an array'
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects background image missing id', () => {
      const invalidData = {
        version: '2.0',
        shapes: [],
        backgroundImages: [
          {
            imageData: 'data:image/png;base64,abc123'
          }
        ]
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects background image missing imageData', () => {
      const invalidData = {
        version: '2.0',
        shapes: [],
        backgroundImages: [
          {
            id: 'bg1'
          }
        ]
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('rejects invalid metadata type', () => {
      const invalidData = {
        version: '2.0',
        shapes: [],
        backgroundImages: [],
        metadata: 'not an object'
      };

      expect(SchemaValidator.validateDesignData(invalidData)).toBe(false);
    });

    it('handles validation errors gracefully', () => {
      const circularRef: any = {};
      circularRef.self = circularRef;

      expect(SchemaValidator.validateDesignData(circularRef)).toBe(false);
    });
  });

  describe('getSupportedVersion', () => {
    it('returns the correct version', () => {
      expect(SchemaValidator.getSupportedVersion()).toBe('2.0');
    });
  });

  describe('isSupportedFileExtension', () => {
    it('accepts .json files', () => {
      expect(SchemaValidator.isSupportedFileExtension('design.json')).toBe(true);
      expect(SchemaValidator.isSupportedFileExtension('test.JSON')).toBe(true);
      expect(SchemaValidator.isSupportedFileExtension('path/to/file.json')).toBe(true);
    });

    it('rejects non-json files', () => {
      expect(SchemaValidator.isSupportedFileExtension('design.txt')).toBe(false);
      expect(SchemaValidator.isSupportedFileExtension('design.xml')).toBe(false);
      expect(SchemaValidator.isSupportedFileExtension('design')).toBe(false);
      expect(SchemaValidator.isSupportedFileExtension('design.jsonx')).toBe(false);
    });

    it('handles empty strings', () => {
      expect(SchemaValidator.isSupportedFileExtension('')).toBe(false);
    });
  });
});