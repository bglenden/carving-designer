import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { App } from '../src/app.js';
import { createShape } from '../src/shapes/ShapeFactory.js';
import { ShapeType } from '../src/core/types.js';
// DO NOT mock ShapeFactory or createShape here!

// Top-level fakeShape for use in MockCanvasManager
let fakeShape: any;
// Top-level MockCanvasManager for use in spies and mocks
class MockCanvasManager {
  private _shapes: any[] = [];
  getShapes() {
    return this._shapes;
  }
  setShapes(shapes: any[]) {
    this._shapes = shapes;
  }
  addShape(shape: any) {
    this._shapes.push(shape);
  }
  removeShapes() {
    this._shapes = [];
  }
  draw() {}
  render() {} // Add render method that FileOperations calls
  zoomIn() {}
  zoomOut() {}
  zoomToFit() {}
  getPanAndZoomHandler() {
    return { handleWheel: vi.fn() };
  }
  getCanvas() {
    return { addEventListener: vi.fn() };
  }
  handleResize() {}
  drawing = { draw: vi.fn(), drawPreviewLines: vi.fn() };
}
// Minimal mocks for managers
let mockCanvasManager: any;
let mockSelectionManager: any;
let mockTransformationManager: any;
let mockPersistenceManager: any;
let mockToolbarManager: any;
let mockPlacementManager: any;

// Setup module mocks
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

// Helper: Mock localStorage
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

describe('App browser persistence', () => {
  let origLocalStorage: any;
  let app: App;
  let fakeShape: any;

  beforeEach(() => {
    origLocalStorage = globalThis.localStorage;
    globalThis.localStorage = mockLocalStorage() as any;
    // Spy on prototype so patched methods remain spies
    vi.spyOn(MockCanvasManager.prototype, 'getShapes');
    vi.spyOn(MockCanvasManager.prototype, 'setShapes');
    vi.spyOn(MockCanvasManager.prototype, 'addShape');
    vi.spyOn(MockCanvasManager.prototype, 'removeShapes');
    vi.spyOn(MockCanvasManager.prototype, 'render');
    mockCanvasManager = new MockCanvasManager();
    mockSelectionManager = { get: vi.fn().mockReturnValue(new Set()), clear: vi.fn() };
    mockTransformationManager = {
      setSelectionCallbacks: vi.fn(),
      enterMoveMode: vi.fn(),
      enterRotateMode: vi.fn(),
      enterMirrorMode: vi.fn(),
      enterJiggleMode: vi.fn(),
      destroy: vi.fn(),
      end: vi.fn(),
    };
    mockPersistenceManager = {};
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
    };
    mockPlacementManager = {};
    fakeShape = { toJSON: vi.fn(() => ({ type: 'LEAF', x: 1, y: 2 })), clone: vi.fn() };
    const mockCanvasElement = {} as HTMLCanvasElement;
    app = new App(
      mockCanvasElement,
      mockCanvasManager,
      mockSelectionManager,
      mockTransformationManager,
      mockPersistenceManager,
      mockToolbarManager,
      mockPlacementManager,
    );
  });

  afterEach(() => {
    globalThis.localStorage = origLocalStorage;
  });

  it('autosaves to localStorage when shapes change', () => {
    app.initialize();
    // Simulate addShape
    app['canvasManager'].addShape(fakeShape);

    // Verify localStorage was called with correct key and a string that contains our data
    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(
      'cnc_design_autosave',
      expect.stringContaining('"shapes":[{"type":"LEAF","x":1,"y":2}]'),
    );

    // Verify the full structure is correct by parsing the saved data
    const calls = (globalThis.localStorage.setItem as any).mock.calls;
    const savedData = JSON.parse(calls[0][1]);
    expect(savedData).toMatchObject({
      shapes: [fakeShape.toJSON()],
      backgroundImages: [],
      version: '2.0',
      metadata: expect.objectContaining({
        description: 'CNC chip carving design (autosave)',
        modified: expect.any(String),
      }),
    });
  });

  it('restores from localStorage on reload', () => {
    // Put a serialized shape in localStorage
    const serialized = JSON.stringify([{ type: ShapeType.LEAF, x: 1, y: 2 }]);
    globalThis.localStorage.getItem = vi.fn(() => serialized);
    app.initialize();
    // Assert that the shape was restored by checking the state, not the spy
    const shapes = mockCanvasManager.getShapes();
    expect(Array.isArray(shapes)).toBe(true);
    expect(shapes.length).toBe(1);
    expect(shapes[0].type).toBe(ShapeType.LEAF);
  });

  it('clears localStorage and canvas on delete all', () => {
    app.initialize();
    app.clearDesign();
    expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith('cnc_design_autosave');
    // Assert that the shapes were cleared by checking the state, not the spy
    expect(mockCanvasManager.getShapes()).toEqual([]);
    expect(mockSelectionManager.clear).toHaveBeenCalled();
  });
});
