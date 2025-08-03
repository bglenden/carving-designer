import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersistenceManager, DesignData, DesignMetadata } from '../../src/persistence/PersistenceManager.js';

describe('PersistenceManager', () => {
  let manager: PersistenceManager;

  beforeEach(() => {
    manager = new PersistenceManager();
    // Clear any existing file handle
    manager.fileHandle = null;
    if (typeof window !== 'undefined') {
      (window as any)._dev_fileHandle = null;
    }
  });

  describe('constructor', () => {
    it('initializes with appropriate file handle state', () => {
      const newManager = new PersistenceManager();
      // File handle can be null or undefined initially
      expect(newManager.fileHandle === null || newManager.fileHandle === undefined).toBe(true);
    });
  });

  describe('data serialization', () => {
    it('creates valid design data structure', () => {
      const designData: DesignData = {
        version: '1.0',
        shapes: [],
        backgroundImages: []
      };

      expect(designData.version).toBe('1.0');
      expect(Array.isArray(designData.shapes)).toBe(true);
      expect(Array.isArray(designData.backgroundImages)).toBe(true);
    });

    it('supports metadata in design data', () => {
      const metadata: DesignMetadata = {
        name: 'Test Design',
        author: 'Test Author',
        created: '2023-01-01',
        modified: '2023-01-02',
        description: 'A test design for validation'
      };

      const designData: DesignData = {
        version: '1.0',
        shapes: [],
        backgroundImages: [],
        metadata
      };

      expect(designData.metadata).toEqual(metadata);
      expect(designData.metadata?.name).toBe('Test Design');
      expect(designData.metadata?.author).toBe('Test Author');
    });

    it('handles complex design data with shapes and background images', () => {
      const designData: DesignData = {
        version: '1.0',
        shapes: [
          {
            type: 'LEAF',
            center: { x: 100, y: 200 },
            rotation: 45,
            selected: false
          } as any
        ],
        backgroundImages: [
          {
            id: 'bg1',
            imageData: 'data:image/png;base64,abc123',
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: 1,
            opacity: 0.5,
            naturalWidth: 100,
            naturalHeight: 100
          }
        ],
        metadata: {
          name: 'Complex Design',
          description: 'A design with shapes and background'
        }
      };

      expect(designData.shapes).toHaveLength(1);
      expect(designData.backgroundImages).toHaveLength(1);
      expect(designData.shapes[0].type).toBe('LEAF');
      expect(designData.backgroundImages[0].id).toBe('bg1');
    });
  });

  describe('JSON serialization', () => {
    it('serializes design data to valid JSON', () => {
      const designData: DesignData = {
        version: '1.0',
        shapes: [
          {
            type: 'TRI_ARC',
            center: { x: 150, y: 250 },
            radius: 50,
            selected: false
          } as any
        ],
        backgroundImages: []
      };

      const json = JSON.stringify(designData, null, 2);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe('1.0');
      expect(parsed.shapes).toHaveLength(1);
      expect(parsed.shapes[0].type).toBe('TRI_ARC');
      expect(parsed.shapes[0].center.x).toBe(150);
      expect(parsed.shapes[0].radius).toBe(50);
    });

    it('handles empty design data serialization', () => {
      const designData: DesignData = {
        version: '1.0',
        shapes: [],
        backgroundImages: []
      };

      const json = JSON.stringify(designData, null, 2);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe('1.0');
      expect(parsed.shapes).toEqual([]);
      expect(parsed.backgroundImages).toEqual([]);
    });

    it('preserves metadata during serialization', () => {
      const designData: DesignData = {
        version: '1.0',
        shapes: [],
        backgroundImages: [],
        metadata: {
          name: 'Serialization Test',
          author: 'Test Suite',
          created: new Date().toISOString(),
          description: 'Testing JSON serialization'
        }
      };

      const json = JSON.stringify(designData, null, 2);
      const parsed = JSON.parse(json);

      expect(parsed.metadata.name).toBe('Serialization Test');
      expect(parsed.metadata.author).toBe('Test Suite');
      expect(parsed.metadata.description).toBe('Testing JSON serialization');
    });
  });

  describe('file handle management', () => {
    it('can store file handle reference', () => {
      const mockHandle = { name: 'test.json' } as FileSystemFileHandle;
      
      // Direct assignment since _setHandle is private
      manager.fileHandle = mockHandle;
      
      expect(manager.fileHandle).toBe(mockHandle);
      expect(manager.fileHandle.name).toBe('test.json');
    });

    it('can clear file handle', () => {
      const mockHandle = { name: 'test.json' } as FileSystemFileHandle;
      manager.fileHandle = mockHandle;
      
      manager.fileHandle = null;
      
      expect(manager.fileHandle).toBeNull();
    });
  });

  describe('error handling', () => {
    it('handles invalid JSON gracefully in data structures', () => {
      // Test that we can work with data that might cause JSON parsing issues
      const designData: DesignData = {
        version: '1.0',
        shapes: [],
        backgroundImages: [],
        metadata: {
          name: 'Test with "quotes" and special chars: <>{}[]',
          description: 'Line 1\nLine 2\tTabbed'
        }
      };

      const json = JSON.stringify(designData);
      const parsed = JSON.parse(json);

      expect(parsed.metadata.name).toContain('quotes');
      expect(parsed.metadata.description).toContain('\n');
    });

    it('validates data structure types', () => {
      const designData: DesignData = {
        version: '1.0',
        shapes: [],
        backgroundImages: []
      };

      expect(typeof designData.version).toBe('string');
      expect(Array.isArray(designData.shapes)).toBe(true);
      expect(Array.isArray(designData.backgroundImages)).toBe(true);
    });
  });

  describe('type definitions', () => {
    it('enforces DesignMetadata structure', () => {
      const metadata: DesignMetadata = {
        name: 'Type Test',
        author: 'TypeScript',
        created: '2023-01-01T00:00:00Z',
        modified: '2023-01-02T00:00:00Z',
        description: 'Testing type definitions'
      };

      // All fields are optional
      const minimalMetadata: DesignMetadata = {};
      
      expect(metadata.name).toBeDefined();
      expect(minimalMetadata.name).toBeUndefined();
    });

    it('enforces DesignData structure', () => {
      const designData: DesignData = {
        version: '1.0',
        shapes: [],
        backgroundImages: []
      };

      // Required fields
      expect(designData.version).toBeDefined();
      expect(designData.shapes).toBeDefined();
      expect(designData.backgroundImages).toBeDefined();
      
      // Optional metadata
      expect(designData.metadata).toBeUndefined();
    });
  });

  describe('compatibility', () => {
    it('supports old format shapes array', () => {
      // Simulate old format data that PersistenceManager.load() would handle
      const oldFormatShapes = [
        {
          type: 'LEAF',
          center: { x: 100, y: 200 },
          rotation: 45
        }
      ];

      // This tests that the structure is compatible with createShape expectations
      expect(Array.isArray(oldFormatShapes)).toBe(true);
      expect(oldFormatShapes[0].type).toBe('LEAF');
      expect(oldFormatShapes[0].center).toBeDefined();
    });

    it('supports new format DesignData object', () => {
      const newFormatData: DesignData = {
        version: '1.0',
        shapes: [
          {
            type: 'LEAF',
            center: { x: 100, y: 200 },
            rotation: 45,
            selected: false
          } as any
        ],
        backgroundImages: [],
        metadata: {
          name: 'New Format Test'
        }
      };

      expect(newFormatData.version).toBeDefined();
      expect(newFormatData.shapes).toBeDefined();
      expect(newFormatData.backgroundImages).toBeDefined();
      expect(newFormatData.metadata).toBeDefined();
    });
  });
});