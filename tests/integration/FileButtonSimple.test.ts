import { vi, describe, beforeEach, it, expect, afterEach } from 'vitest';
import { FileOperations } from '../../src/app/FileOperations.js';
import { ShapeType } from '../../src/core/types.js';

// Mock localStorage
function mockLocalStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => {
      store[key] = val;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    _store: store,
  };
}

describe('File Button Core Functionality', () => {
  let fileOperations: FileOperations;
  let mockCanvasManager: any;
  let mockPersistenceManager: any;
  let mockSelectionManager: any;
  let mockBackgroundImageManager: any;
  let origLocalStorage: any;

  beforeEach(() => {
    // Mock localStorage
    origLocalStorage = globalThis.localStorage;
    globalThis.localStorage = mockLocalStorage() as any;

    // Create mock managers
    mockCanvasManager = {
      getShapes: vi.fn(() => []),
      setShapes: vi.fn(),
      render: vi.fn(),
      addShape: vi.fn(),
      removeShapes: vi.fn(),
    };

    mockPersistenceManager = {
      save: vi.fn(),
      load: vi.fn(),
    };

    mockSelectionManager = {
      clear: vi.fn(),
    };

    mockBackgroundImageManager = {
      toJSON: vi.fn(() => []),
      fromJSON: vi.fn(),
      clear: vi.fn(),
    };

    // Create FileOperations instance
    fileOperations = new FileOperations(
      mockCanvasManager,
      mockPersistenceManager,
      mockSelectionManager,
      mockBackgroundImageManager,
    );
  });

  afterEach(() => {
    globalThis.localStorage = origLocalStorage;
    vi.clearAllMocks();
  });

  describe('Save Design Functionality', () => {
    it('should create correct data structure for save', async () => {
      const mockShapes = [
        { toJSON: () => ({ type: ShapeType.LEAF, x: 10, y: 20 }) },
        { toJSON: () => ({ type: ShapeType.TRI_ARC, v1: { x: 0, y: 0 } }) },
      ];

      mockCanvasManager.getShapes.mockReturnValue(mockShapes);
      mockBackgroundImageManager.toJSON.mockReturnValue([{ id: 'bg1', data: 'test' }]);
      mockPersistenceManager.save.mockResolvedValue(undefined);

      await fileOperations.handleSaveDesign(false);

      expect(mockPersistenceManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          shapes: [
            { type: ShapeType.LEAF, x: 10, y: 20 },
            { type: ShapeType.TRI_ARC, v1: { x: 0, y: 0 } },
          ],
          backgroundImages: [{ id: 'bg1', data: 'test' }],
          version: '2.0',
        }),
        false,
      );
    });

    it('should handle save as functionality', async () => {
      mockCanvasManager.getShapes.mockReturnValue([]);
      mockPersistenceManager.save.mockResolvedValue(undefined);

      await fileOperations.handleSaveDesign(true);

      expect(mockPersistenceManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          shapes: [],
          backgroundImages: [],
          version: '2.0',
        }),
        true, // saveAs = true
      );
    });

    it('should handle save errors gracefully', async () => {
      mockCanvasManager.getShapes.mockReturnValue([]);
      mockPersistenceManager.save.mockRejectedValue(new Error('Save failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw
      await expect(fileOperations.handleSaveDesign(false)).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save design:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Load Design Functionality', () => {
    it('should load design data correctly', async () => {
      const mockDesignData = {
        shapes: [{ type: ShapeType.LEAF, x: 10, y: 20 }],
        backgroundImages: [{ id: 'bg1', data: 'test' }],
        version: '2.0',
      };

      mockPersistenceManager.load.mockResolvedValue(mockDesignData);

      await fileOperations.handleLoadDesign();

      expect(mockPersistenceManager.load).toHaveBeenCalledOnce();
      expect(mockCanvasManager.setShapes).toHaveBeenCalledWith(mockDesignData.shapes);
      expect(mockBackgroundImageManager.fromJSON).toHaveBeenCalledWith(
        mockDesignData.backgroundImages,
      );
      expect(mockSelectionManager.clear).toHaveBeenCalled();
    });

    it('should handle load errors gracefully', async () => {
      mockPersistenceManager.load.mockRejectedValue(new Error('Load failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw
      await expect(fileOperations.handleLoadDesign()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load design:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle malformed design data', async () => {
      const malformedData = { invalidKey: 'badData' };

      mockPersistenceManager.load.mockResolvedValue(malformedData);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await fileOperations.handleLoadDesign();

      // Should handle the error gracefully
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Clear Design Functionality', () => {
    it('should clear all design data', () => {
      fileOperations.clearDesign();

      expect(mockCanvasManager.setShapes).toHaveBeenCalledWith([]);
      expect(mockBackgroundImageManager.clear).toHaveBeenCalled();
      expect(mockSelectionManager.clear).toHaveBeenCalled();
      expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith('cnc_design_autosave');
    });
  });

  describe('Data Format Consistency', () => {
    it('should maintain consistent format between save and load operations', async () => {
      // Test data
      const testShapes = [
        { toJSON: () => ({ type: ShapeType.LEAF, x: 10, y: 20, radius: 5 }) },
        {
          toJSON: () => ({
            type: ShapeType.TRI_ARC,
            v1: { x: 0, y: 0 },
            v2: { x: 10, y: 0 },
            v3: { x: 5, y: 10 },
          }),
        },
      ];
      const testBackgrounds = [{ id: 'bg1', imageData: 'data:image/png;base64,test' }];

      mockCanvasManager.getShapes.mockReturnValue(testShapes);
      mockBackgroundImageManager.toJSON.mockReturnValue(testBackgrounds);
      mockPersistenceManager.save.mockResolvedValue(undefined);

      // Save operation
      await fileOperations.handleSaveDesign(false);

      // Extract saved data
      const savedData = mockPersistenceManager.save.mock.calls[0][0];

      // Verify structure
      expect(savedData).toHaveProperty('shapes');
      expect(savedData).toHaveProperty('backgroundImages');
      expect(savedData).toHaveProperty('version');
      expect(savedData.version).toBe('2.0');

      // Verify shapes format
      expect(savedData.shapes).toHaveLength(2);
      expect(savedData.shapes[0]).toEqual({ type: ShapeType.LEAF, x: 10, y: 20, radius: 5 });
      expect(savedData.shapes[1]).toEqual({
        type: ShapeType.TRI_ARC,
        v1: { x: 0, y: 0 },
        v2: { x: 10, y: 0 },
        v3: { x: 5, y: 10 },
      });

      // Verify background images format
      expect(savedData.backgroundImages).toEqual(testBackgrounds);
    });

    it('should handle empty design correctly', async () => {
      mockCanvasManager.getShapes.mockReturnValue([]);
      mockBackgroundImageManager.toJSON.mockReturnValue([]);
      mockPersistenceManager.save.mockResolvedValue(undefined);

      await fileOperations.handleSaveDesign(false);

      const savedData = mockPersistenceManager.save.mock.calls[0][0];
      expect(savedData.shapes).toEqual([]);
      expect(savedData.backgroundImages).toEqual([]);
      expect(savedData.version).toBe('2.0');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle permission denied errors', async () => {
      mockCanvasManager.getShapes.mockReturnValue([]);
      mockPersistenceManager.save.mockRejectedValue(
        new DOMException('Permission denied', 'NotAllowedError'),
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await fileOperations.handleSaveDesign(false);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save design:',
        expect.objectContaining({ name: 'NotAllowedError' }),
      );

      consoleSpy.mockRestore();
    });

    it('should handle network errors during file operations', async () => {
      mockPersistenceManager.load.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await fileOperations.handleLoadDesign();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load design:',
        expect.objectContaining({ message: 'Network error' }),
      );

      consoleSpy.mockRestore();
    });

    it('should handle corrupted localStorage data', () => {
      // Mock corrupted localStorage data
      globalThis.localStorage.getItem = vi.fn(() => 'invalid-json-data');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw
      expect(() => fileOperations.loadFromLocalStorage()).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('localStorage Integration', () => {
    it('should load from localStorage on initialization', () => {
      const testData = JSON.stringify({
        shapes: [{ type: ShapeType.LEAF, x: 1, y: 2 }],
        backgroundImages: [],
        version: '2.0',
      });

      globalThis.localStorage.getItem = vi.fn(() => testData);

      fileOperations.loadFromLocalStorage();

      expect(mockCanvasManager.setShapes).toHaveBeenCalled();
    });
  });
});
