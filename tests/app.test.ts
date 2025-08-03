import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { App } from '../src/app.js';
import { BaseShape } from '../src/shapes/BaseShape.js';

// Manual mocks for all manager classes
let mockCanvasManager: any;
let mockPlacementManager: any;
let mockSelectionManager: any;
let mockTransformationManager: any;
let mockPersistenceManager: any;
let mockToolbarManager: any;

vi.mock('../src/canvas/CanvasManager.js', () => ({
  CanvasManager: vi.fn(() => mockCanvasManager),
}));
vi.mock('../src/core/PlacementManager.js', () => ({
  PlacementManager: vi.fn(() => mockPlacementManager),
}));
vi.mock('../src/core/SelectionManager.js', () => ({
  SelectionManager: vi.fn(() => mockSelectionManager),
}));
vi.mock('../src/persistence/PersistenceManager.js', () => ({
  PersistenceManager: vi.fn(() => mockPersistenceManager),
}));
vi.mock('../src/ui/ToolbarManager.js', () => ({
  ToolbarManager: vi.fn(() => mockToolbarManager),
}));
vi.mock('../src/core/TransformationManager.js', () => ({
  TransformationManager: vi.fn(() => mockTransformationManager),
}));

describe('App', () => {
  let app: App;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock implementations for each manager
    class MockCanvasManager {
      addShape(..._args: any[]) {}
      removeShapes(..._args: any[]) {}
      setShapes(..._args: any[]) {}
      getShapes() { return []; }
      draw() {}
      zoomIn() {}
      zoomOut() {}
      zoomToFit() {}
      getCanvas() { return { addEventListener: vi.fn() }; }
      handleResize() {}
      getPanAndZoomHandler() { return { handleWheel: vi.fn() }; }
    }
    mockCanvasManager = new MockCanvasManager();
    vi.spyOn(mockCanvasManager, 'addShape');
    vi.spyOn(mockCanvasManager, 'removeShapes');
    vi.spyOn(mockCanvasManager, 'setShapes');
    vi.spyOn(mockCanvasManager, 'getShapes');
    mockSelectionManager = {
      get: vi.fn().mockReturnValue(new Set()),
      clear: vi.fn(),
      add: vi.fn(),
    };
    mockTransformationManager = {
      enterMoveMode: vi.fn(),
      enterRotateMode: vi.fn(),
      enterMirrorMode: vi.fn(),
      enterJiggleMode: vi.fn(),
      setSelectionCallbacks: vi.fn(),
      destroy: vi.fn(),
      end: vi.fn(),
    }; // Not used in duplicate logic
    mockPersistenceManager = {
      load: vi.fn(),
      save: vi.fn(),
    }; // Not used in duplicate logic
    mockToolbarManager = {
      setLoadDesignCallback: vi.fn(),
      setSaveDesignCallback: vi.fn(),
      setSaveAsDesignCallback: vi.fn(),
      setZoomInCallback: vi.fn(),
      setZoomOutCallback: vi.fn(),
      setZoomToFitCallback: vi.fn(),
      setCreateShapeCallback: vi.fn(),
      setTogglePlacementCallback: vi.fn(),
      setToggleEditModeCallback: vi.fn(),
      setMoveCallback: vi.fn(),
      setRotateCallback: vi.fn(),
      setMirrorCallback: vi.fn(),
      setJiggleCallback: vi.fn(),
      setDuplicateCallback: vi.fn(),
      setDeleteAllCallback: vi.fn(),
    };

    mockPlacementManager = {
      startPlacement: vi.fn(),
    }; // Not used in duplicate logic

    const mockCanvasElement = {} as HTMLCanvasElement;

    // App constructor will now receive the mocked managers
    app = new App(
      mockCanvasElement,
      mockCanvasManager,
      mockSelectionManager,
      mockTransformationManager,
      mockPersistenceManager,
      mockToolbarManager,
      mockPlacementManager,
    );
    app.initialize();
    // Patch the methods again to ensure they are spies after App's patching
    app['canvasManager'].addShape = vi.fn(app['canvasManager'].addShape);
    app['canvasManager'].removeShapes = vi.fn(app['canvasManager'].removeShapes);
    app['canvasManager'].setShapes = vi.fn(app['canvasManager'].setShapes);
  });

  describe('handleDuplicate', () => {
    it('should copy, paste, and select a duplicated shape with an offset', () => {
      // Arrange: Create a mock shape and its clone.
      const mockShape = { clone: vi.fn(), move: vi.fn() } as unknown as BaseShape;
      const mockShapeClone = { move: vi.fn() } as unknown as BaseShape;
      (mockShape.clone as Mock).mockReturnValue(mockShapeClone);

      // Arrange: Set up the selection manager to return the mock shape.
      const selection = new Set([mockShape]);
      (mockSelectionManager.get as Mock).mockReturnValue(selection);

      // Act: Call the private method 'handleDuplicate'.
      (app as any).handleDuplicate();

      // Assert:
      // 1. The original shape was cloned.
      expect(mockShape.clone).toHaveBeenCalledTimes(1);

      // 2. The cloned shape was moved (pasted with an offset).
      expect(mockShapeClone.move).toHaveBeenCalledWith({ x: 5, y: 5 });

      // 3. The cloned shape was added to the canvas.
      // Always assert on the current method reference, as App may patch it
      expect((app as any).canvasManager.addShape).toHaveBeenCalledWith(mockShapeClone);

      // 4. The selection was cleared and then the new shape was selected.
      expect(mockSelectionManager.clear).toHaveBeenCalledTimes(1);
      expect(mockSelectionManager.add).toHaveBeenCalledWith(mockShapeClone);

      // 5. Ensure clear is called before add.
      const clearOrder = (mockSelectionManager.clear as Mock).mock.invocationCallOrder[0];
      const addOrder = (mockSelectionManager.add as Mock).mock.invocationCallOrder[0];
      expect(clearOrder).toBeLessThan(addOrder);
    });

    it('should do nothing if no shapes are selected', () => {
      // Arrange: Selection is empty.
      const selection = new Set<BaseShape>();
      (mockSelectionManager.get as Mock).mockReturnValue(selection);

      // Act
      (app as any).handleDuplicate();

      // Assert
      expect((app as any).canvasManager.addShape).not.toHaveBeenCalled();
      expect(mockSelectionManager.clear).not.toHaveBeenCalled();
      expect(mockSelectionManager.add).not.toHaveBeenCalled();
    });
  });
});
