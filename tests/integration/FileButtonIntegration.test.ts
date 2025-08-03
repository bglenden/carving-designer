import { vi, describe, beforeEach, it, expect, afterEach } from 'vitest';
import { App } from '../../src/app.js';
import { ShapeType } from '../../src/core/types.js';

// Mock file system APIs
const mockShowSaveFilePicker = vi.fn();
const mockShowOpenFilePicker = vi.fn();

// Mock the global file system APIs
Object.defineProperty(window, 'showSaveFilePicker', {
  value: mockShowSaveFilePicker,
  writable: true
});

Object.defineProperty(window, 'showOpenFilePicker', {
  value: mockShowOpenFilePicker,
  writable: true
});

// Mock managers with minimal implementations
let mockCanvasManager: any;
let mockSelectionManager: any;
let mockTransformationManager: any;
let mockPersistenceManager: any;
let mockToolbarManager: any;
let mockPlacementManager: any;

// Mock localStorage
function mockLocalStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => { store[key] = val; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _store: store,
  };
}

// Mock modules
vi.mock('../../src/canvas/CanvasManager.js', () => ({
  CanvasManager: vi.fn(() => mockCanvasManager),
}));

vi.mock('../../src/core/SelectionManager.js', () => ({
  SelectionManager: vi.fn(() => mockSelectionManager),
}));

vi.mock('../../src/core/TransformationManager.js', () => ({
  TransformationManager: vi.fn(() => mockTransformationManager),
}));

vi.mock('../../src/persistence/PersistenceManager.js', () => ({
  PersistenceManager: vi.fn(() => mockPersistenceManager),
}));

vi.mock('../../src/ui/ToolbarManager.js', () => ({
  ToolbarManager: vi.fn(() => mockToolbarManager),
}));

vi.mock('../../src/core/PlacementManager.js', () => ({
  PlacementManager: vi.fn(() => mockPlacementManager),
}));

describe('File Button Integration', () => {
  let app: App;
  let origLocalStorage: any;
  let mockFileOperationsLoad: ReturnType<typeof vi.fn>;
  let mockFileOperationsSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock localStorage
    origLocalStorage = globalThis.localStorage;
    globalThis.localStorage = mockLocalStorage() as any;

    // Setup DOM with proper event listener methods
    document.body.innerHTML = `
      <div id="primary-toolbar"></div>
    `;
    
    // Create a proper canvas mock with event listener methods
    const canvasElement = document.createElement('canvas');
    canvasElement.id = 'design-canvas';
    canvasElement.addEventListener = vi.fn();
    canvasElement.removeEventListener = vi.fn();
    document.body.appendChild(canvasElement);

    // Reset mocks
    vi.clearAllMocks();

    // Create mock managers with spy functions
    mockCanvasManager = {
      getCanvas: vi.fn(() => canvasElement),
      handleResize: vi.fn(),
      setEditMode: vi.fn(),
      setBackgroundMode: vi.fn(),
      getShapes: vi.fn(() => []),
      setShapes: vi.fn(),
      addShape: vi.fn(),
      removeShapes: vi.fn(),
      render: vi.fn(),
      destroy: vi.fn(),
      setBackgroundImageHandler: vi.fn(),
      getPanAndZoomHandler: vi.fn(() => ({ handleWheel: vi.fn() })),
    };

    mockSelectionManager = {
      get: vi.fn(() => new Set()),
      clear: vi.fn(),
      add: vi.fn(),
      destroy: vi.fn(),
    };

    mockTransformationManager = {
      setSelectionCallbacks: vi.fn(),
      enterMoveMode: vi.fn(),
      enterRotateMode: vi.fn(),
      enterMirrorMode: vi.fn(),
      enterJiggleMode: vi.fn(),
      destroy: vi.fn(),
      end: vi.fn(),
    };

    // Mock file operations
    mockFileOperationsLoad = vi.fn();
    mockFileOperationsSave = vi.fn();
    
    mockPersistenceManager = {
      load: mockFileOperationsLoad,
      save: mockFileOperationsSave,
    };

    mockToolbarManager = {
      setLoadDesignCallback: vi.fn(),
      setSaveDesignCallback: vi.fn(),
      setSaveAsDesignCallback: vi.fn(),
      setCreateShapeCallback: vi.fn(),
      setTogglePlacementCallback: vi.fn(),
      setToggleEditModeCallback: vi.fn(),
      setMoveCallback: vi.fn(),
      setRotateCallback: vi.fn(),
      setMirrorCallback: vi.fn(),
      setJiggleCallback: vi.fn(),
      setDuplicateCallback: vi.fn(),
      setDeleteAllCallback: vi.fn(),
      destroy: vi.fn(),
      // File menu methods
      toggleFileMenu: vi.fn(),
      closeFileMenu: vi.fn(),
      getFileMenu: vi.fn(() => null),
    };

    mockPlacementManager = {
      isPlacing: vi.fn(() => false),
      cancelPlacement: vi.fn(),
      destroy: vi.fn(),
    };

    // Canvas element is already created above
    app = new App(
      canvasElement,
      mockCanvasManager,
      mockSelectionManager,
      mockTransformationManager,
      mockPersistenceManager,
      mockToolbarManager,
      mockPlacementManager,
    );

    app.initialize();
    
    // Re-spy on methods after they may have been patched by autosave
    vi.spyOn(mockCanvasManager, 'setShapes');
    vi.spyOn(mockSelectionManager, 'clear');
  });

  afterEach(() => {
    globalThis.localStorage = origLocalStorage;
    document.body.innerHTML = '';
    // Skip app.destroy() to avoid DOM cleanup issues in tests
  });

  describe('Callback Registration', () => {
    it('should register load design callback with toolbar manager', () => {
      expect(mockToolbarManager.setLoadDesignCallback).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should register save design callback with toolbar manager', () => {
      expect(mockToolbarManager.setSaveDesignCallback).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should register save as design callback with toolbar manager', () => {
      expect(mockToolbarManager.setSaveAsDesignCallback).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe('Load Design Functionality', () => {
    it('should call file operations load when load callback is triggered', async () => {
      // Get the registered load callback
      const loadCallbackCall = mockToolbarManager.setLoadDesignCallback.mock.calls[0];
      const loadCallback = loadCallbackCall[0];

      // Mock successful load
      const mockDesignData = {
        shapes: [{ type: ShapeType.LEAF, x: 10, y: 20 }],
        backgroundImages: [],
        version: '2.0'
      };
      mockFileOperationsLoad.mockResolvedValue(mockDesignData);

      // Trigger load
      await loadCallback();

      expect(mockFileOperationsLoad).toHaveBeenCalledOnce();
      expect(mockCanvasManager.setShapes).toHaveBeenCalledWith(mockDesignData.shapes);
      expect(mockSelectionManager.clear).toHaveBeenCalled();
    });

    it('should handle load errors gracefully', async () => {
      const loadCallbackCall = mockToolbarManager.setLoadDesignCallback.mock.calls[0];
      const loadCallback = loadCallbackCall[0];

      mockFileOperationsLoad.mockRejectedValue(new Error('Load failed'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw
      await expect(loadCallback()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load design:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Save Design Functionality', () => {
    it('should call file operations save when save callback is triggered', async () => {
      const saveCallbackCall = mockToolbarManager.setSaveDesignCallback.mock.calls[0];
      const saveCallback = saveCallbackCall[0];

      const mockShapes = [{ type: ShapeType.LEAF, toJSON: () => ({ type: ShapeType.LEAF, x: 1, y: 2 }) }];
      mockCanvasManager.getShapes.mockReturnValue(mockShapes);

      mockFileOperationsSave.mockResolvedValue(undefined);

      await saveCallback();

      expect(mockFileOperationsSave).toHaveBeenCalledWith(
        expect.objectContaining({
          shapes: expect.any(Array),
          backgroundImages: expect.any(Array),
          version: '2.0'
        }),
        false // saveAs = false
      );
    });

    it('should call file operations save as when save as callback is triggered', async () => {
      const saveAsCallbackCall = mockToolbarManager.setSaveAsDesignCallback.mock.calls[0];
      const saveAsCallback = saveAsCallbackCall[0];

      const mockShapes = [{ type: ShapeType.LEAF, toJSON: () => ({ type: ShapeType.LEAF, x: 1, y: 2 }) }];
      mockCanvasManager.getShapes.mockReturnValue(mockShapes);

      mockFileOperationsSave.mockResolvedValue(undefined);

      await saveAsCallback();

      expect(mockFileOperationsSave).toHaveBeenCalledWith(
        expect.objectContaining({
          shapes: expect.any(Array),
          backgroundImages: expect.any(Array),
          version: '2.0'
        }),
        true // saveAs = true
      );
    });

    it('should handle save errors gracefully', async () => {
      const saveCallbackCall = mockToolbarManager.setSaveDesignCallback.mock.calls[0];
      const saveCallback = saveCallbackCall[0];

      mockCanvasManager.getShapes.mockReturnValue([]);
      mockFileOperationsSave.mockRejectedValue(new Error('Save failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw
      await expect(saveCallback()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save design:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Clear Design Functionality', () => {
    it('should clear design when clearDesign is called', () => {
      // Mock some existing shapes
      mockCanvasManager.getShapes.mockReturnValue([
        { type: ShapeType.LEAF },
        { type: ShapeType.TRI_ARC }
      ]);

      app.clearDesign();

      expect(mockCanvasManager.setShapes).toHaveBeenCalledWith([]);
      expect(mockSelectionManager.clear).toHaveBeenCalled();
      expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith('cnc_design_autosave');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent data format between save and load', async () => {
      // Setup some test data
      const testShapes = [
        { type: ShapeType.LEAF, toJSON: () => ({ type: ShapeType.LEAF, x: 10, y: 20 }) },
        { type: ShapeType.TRI_ARC, toJSON: () => ({ type: ShapeType.TRI_ARC, v1: { x: 0, y: 0 } }) }
      ];

      mockCanvasManager.getShapes.mockReturnValue(testShapes);

      // Get save callback and trigger it
      const saveCallback = mockToolbarManager.setSaveDesignCallback.mock.calls[0][0];
      await saveCallback();

      // Verify the data format passed to persistence manager
      const savedData = mockFileOperationsSave.mock.calls[0][0];
      
      expect(savedData).toMatchObject({
        shapes: expect.arrayContaining([
          { type: ShapeType.LEAF, x: 10, y: 20 },
          { type: ShapeType.TRI_ARC, v1: { x: 0, y: 0 } }
        ]),
        backgroundImages: expect.any(Array),
        version: '2.0'
      });

      expect(savedData.shapes).toHaveLength(2);
    });

    it('should handle empty design save and load', async () => {
      mockCanvasManager.getShapes.mockReturnValue([]);

      const saveCallback = mockToolbarManager.setSaveDesignCallback.mock.calls[0][0];
      await saveCallback();

      const savedData = mockFileOperationsSave.mock.calls[0][0];
      expect(savedData.shapes).toEqual([]);
      expect(savedData.backgroundImages).toEqual([]);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from file system permission errors', async () => {
      const saveCallback = mockToolbarManager.setSaveDesignCallback.mock.calls[0][0];
      
      // Simulate permission error
      mockFileOperationsSave.mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await saveCallback();
      
      expect(consoleSpy).toHaveBeenCalled();
      // App should continue to function normally
      expect(mockCanvasManager.getShapes).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle corrupted file load gracefully', async () => {
      const loadCallback = mockToolbarManager.setLoadDesignCallback.mock.calls[0][0];
      
      // Simulate corrupted file error
      mockFileOperationsLoad.mockRejectedValue(new Error('Invalid file format'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await loadCallback();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load design:',
        expect.objectContaining({ message: 'Invalid file format' })
      );
      
      consoleSpy.mockRestore();
    });
  });
});