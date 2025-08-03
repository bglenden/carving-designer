import { describe, it, expect, vi, Mock, beforeEach } from 'vitest';
import { App } from '../src/app.js';

import { TransformMode } from '../src/core/TransformationManager.js';
import { BaseShape } from '../src/shapes/BaseShape.js';
import { HitRegion } from '../src/core/types.js';

const createMockShape = (
  props: Partial<BaseShape> & { rotation?: number; position?: { x: number; y: number } } = {},
): BaseShape => {
  const shape = {
    id: 'mock-shape',
    rotation: 0,
    position: { x: 0, y: 0 },
    ...props,
    hitTest: vi.fn().mockReturnValue({ region: HitRegion.BODY }),
    draw: vi.fn(),
    getVertices: vi.fn().mockReturnValue([]),
    getCenter: vi.fn().mockReturnValue({ x: 0, y: 0 }),
    move: vi.fn(),
    rotate: vi.fn(function (
      this: any,
      angleInRadians: number,
      center: import('../src/core/types.js').Point,
    ) {
      // Update rotation angle
      this.rotation = (this.rotation || 0) + angleInRadians * (180 / Math.PI);

      // Update position
      if (this.position) {
        const dx = this.position.x - center.x;
        const dy = this.position.y - center.y;
        const cos = Math.cos(angleInRadians);
        const sin = Math.sin(angleInRadians);
        this.position.x = center.x + dx * cos - dy * sin;
        this.position.y = center.y + dx * sin + dy * cos;
      }
    }),
    activeHit: null,
  } as unknown as BaseShape;
  return shape;
};

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

vi.mock('../src/core/TransformationManager.js', async () => {
  const actual = await vi.importActual<typeof import('../src/core/TransformationManager.js')>(
    '../src/core/TransformationManager.js',
  );
  return {
    ...actual,
    TransformationManager: vi.fn(() => mockTransformationManager),
  };
});

describe('App Mouse Event Handlers', () => {
  let app: App;
  let canvasElement: HTMLCanvasElement;

  beforeEach(() => {
    vi.clearAllMocks();

    document.body.innerHTML = `
      <div id="primary-toolbar"></div>
      <canvas id="design-canvas"></canvas>
    `;
    canvasElement = document.getElementById('design-canvas') as HTMLCanvasElement;

    mockTransformationManager = {
      start: vi.fn(),
      transform: vi.fn(),
      end: vi.fn(),
      isTransforming: vi.fn().mockReturnValue(false),
      getCurrentMode: vi.fn().mockReturnValue(TransformMode.IDLE),
      setSelectionCallbacks: vi.fn(),
      enterMoveMode: vi.fn(),
      enterRotateMode: vi.fn(),
      enterMirrorMode: vi.fn(),
      enterJiggleMode: vi.fn(),
      destroy: vi.fn(),
    };

    const panZoomHandler = {
      isPanning: vi.fn((e: MouseEvent) => e.button === 1),
      getMousePos: vi.fn((e: MouseEvent) => ({ x: e.clientX, y: e.clientY })),
    };
    class MockCanvasManager {
      getCanvas() { return canvasElement; }
      handleResize() {}
      setEditMode(..._args: any[]) {}
      getPanAndZoomHandler() { return panZoomHandler as any; }
      screenToWorld(p: any) { return p; }
      getShapeAtPoint(..._args: any[]) { return null; }
      draw() {}
      getScale() { return 1; }
      getShapes() { return []; }
      addShape(..._args: any[]) {}
      removeShapes(..._args: any[]) {}
      setShapes(..._args: any[]) {}
    }
    mockCanvasManager = new MockCanvasManager();
    vi.spyOn(mockCanvasManager, 'getCanvas');
    vi.spyOn(mockCanvasManager, 'handleResize');
    vi.spyOn(mockCanvasManager, 'setEditMode');
    vi.spyOn(mockCanvasManager, 'getPanAndZoomHandler');
    vi.spyOn(mockCanvasManager, 'screenToWorld');
    vi.spyOn(mockCanvasManager, 'getShapeAtPoint');
    vi.spyOn(mockCanvasManager, 'draw');
    vi.spyOn(mockCanvasManager, 'getScale');
    vi.spyOn(mockCanvasManager, 'getShapes');
    vi.spyOn(mockCanvasManager, 'addShape');
    vi.spyOn(mockCanvasManager, 'removeShapes');
    vi.spyOn(mockCanvasManager, 'setShapes');

    mockPlacementManager = {
      isPlacing: vi.fn().mockReturnValue(false),
      cancelPlacement: vi.fn(),
    };

    mockSelectionManager = {
      get: vi.fn().mockReturnValue(new Set()),
      has: vi.fn().mockReturnValue(false),
      clear: vi.fn(),
      add: vi.fn(),
      getCenter: vi.fn().mockReturnValue(null),
      hitTestRotationHandle: vi.fn().mockReturnValue(false),
      hitTest: vi.fn().mockReturnValue(null),
    };
    Object.defineProperty(mockSelectionManager, 'selection', {
      get: () => mockSelectionManager.get(),
      configurable: true,
    });

    mockPersistenceManager = {
      save: vi.fn(),
      load: vi.fn(),
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
    };

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
    app.toggleEditMode();
  });

  describe('handleMouseDown', () => {
    it('should select a shape on click', () => {
      const mockShape = createMockShape({ id: 'shape1' });
      const worldPos = { x: 100, y: 100 };

      // 1. Setup
      mockCanvasManager.getShapeAtPoint.mockReturnValue(mockShape);
      mockSelectionManager.has.mockReturnValue(false); // Shape is not selected

      // 2. Action
      // A click is a mousedown followed by a mouseup without a drag.
      canvasElement.dispatchEvent(
        new MouseEvent('mousedown', { button: 0, clientX: worldPos.x, clientY: worldPos.y }),
      );
      canvasElement.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));

      // 3. Assert
      expect(mockSelectionManager.clear).toHaveBeenCalled();
      expect(mockSelectionManager.add).toHaveBeenCalledWith(mockShape);
      expect(mockTransformationManager.start).not.toHaveBeenCalled();
    });

    it('should start a move transformation if a selected shape is dragged', () => {
      const mockShape = createMockShape({ id: 'shape1' });
      const worldPos = { x: 100, y: 100 };
      const selection = new Set([mockShape]);

      // 1. Setup
      mockCanvasManager.getShapeAtPoint.mockReturnValue(mockShape);
      mockSelectionManager.get.mockReturnValue(selection);
      mockSelectionManager.has.mockReturnValue(true); // Shape is selected
      (mockShape.hitTest as Mock).mockReturnValue({ region: HitRegion.BODY });
      mockTransformationManager.getCurrentMode.mockReturnValue(TransformMode.MOVE);

      // 2. Action
      canvasElement.dispatchEvent(
        new MouseEvent('mousedown', { button: 0, clientX: worldPos.x, clientY: worldPos.y }),
      );
      canvasElement.dispatchEvent(
        new MouseEvent('mousemove', {
          button: 0,
          clientX: worldPos.x + 5,
          clientY: worldPos.y + 5,
        }),
      );

      // 3. Assert
      expect(mockTransformationManager.start).toHaveBeenCalledWith(selection, worldPos);
    });

    it('should clear selection if no shape is clicked', () => {
      // 1. Setup
      mockCanvasManager.getShapeAtPoint.mockReturnValue(null);

      // 2. Action
      canvasElement.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
      canvasElement.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));

      // 3. Assert
      expect(mockSelectionManager.clear).toHaveBeenCalled();
    });

    it('should do nothing if panning', () => {
      const event = new MouseEvent('mousedown', { button: 1, clientX: 100, clientY: 100 });
      canvasElement.dispatchEvent(event);

      expect(mockSelectionManager.clear).not.toHaveBeenCalled();
      expect(mockTransformationManager.start).not.toHaveBeenCalled();
    });
  });

  describe('handleMouseMove', () => {
    it('should apply transformation when transforming', () => {
      // Set up the state to simulate that a drag is in progress
      const startPos = { x: 10, y: 10 };
      const endPos = { x: 150, y: 150 };
      const mockShape = createMockShape({ id: 'shape1' });

      // Mock that a shape was clicked, and it's selected.
      mockCanvasManager.getShapeAtPoint.mockReturnValue(mockShape);
      mockSelectionManager.get.mockReturnValue(new Set([mockShape]));
      mockSelectionManager.has.mockReturnValue(true);
      mockTransformationManager.isTransforming.mockReturnValue(true);
      mockTransformationManager.getCurrentMode.mockReturnValue(TransformMode.MOVE);

      // Dispatch mousedown to set isDragging = true in the App instance
      canvasElement.dispatchEvent(
        new MouseEvent('mousedown', { button: 0, clientX: startPos.x, clientY: startPos.y }),
      );
      canvasElement.dispatchEvent(
        new MouseEvent('mousemove', { button: 0, clientX: endPos.x, clientY: endPos.y }),
      );

      const expectedDelta = { x: 140, y: 140 };
      const expectedWorldPos = { x: 150, y: 150 };
      expect(mockTransformationManager.transform).toHaveBeenCalledWith(
        expectedDelta,
        expectedWorldPos,
      );
    });
  });

  describe('handleMouseUp', () => {
    it('should finish transformation when transforming', () => {
      // 1. Setup: Manually set app state to simulate an in-progress drag.
      const mockShape = createMockShape({ id: 'shape1' });
      (app as any).isDragging = true;
      (app as any).hasDragged = true; // Critical: simulate that a drag has occurred.
      (app as any).activeHit = { shape: mockShape, result: { region: HitRegion.BODY } };
      mockTransformationManager.isTransforming.mockReturnValue(true);

      // 2. Action
      canvasElement.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));

      // 3. Assert
      expect(mockTransformationManager.end).toHaveBeenCalled();
    });

    it('should not end transformation on a simple click', () => {
      // A click is a mousedown followed by a mouseup with no mousemove.
      // `hasDragged` should be false, and `end()` should not be called.
      mockTransformationManager.isTransforming.mockReturnValue(false); // Prevent test state leakage
      mockCanvasManager.getShapeAtPoint.mockReturnValue(null); // Clicking on empty space

      // Reset any prior calls to end() that may have occurred during setup
      mockTransformationManager.end.mockClear();

      // Action
      canvasElement.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
      canvasElement.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));

      // Assert
      expect(mockTransformationManager.end).not.toHaveBeenCalled();
      // Clicking on nothing should clear the selection.
      expect(mockSelectionManager.clear).toHaveBeenCalled();
    });
  });

  describe('Rotation', () => {
    it('should start a rotation when the rotation handle is dragged', () => {
      // 1. Setup
      const mockShape = createMockShape();
      const selection = new Set([mockShape]);
      mockSelectionManager.get.mockReturnValue(selection);
      mockSelectionManager.has.mockImplementation((s: BaseShape) => selection.has(s));
      mockTransformationManager.getCurrentMode.mockReturnValue(TransformMode.ROTATE);

      // Simulate clicking on the rotation handle of our specific shape
      mockCanvasManager.getShapeAtPoint.mockReturnValue(mockShape);
      // The App checks SelectionManager.hitTestRotationHandle, so make it return true for the click point
      mockSelectionManager.hitTestRotationHandle.mockReturnValue(true);

      const clickPoint = { x: 200, y: 100 };
      const rotationCenter = { x: 150, y: 150 };
      mockSelectionManager.getCenter.mockReturnValue(rotationCenter);

      // 2. Action
      canvasElement.dispatchEvent(
        new MouseEvent('mousedown', { button: 0, clientX: clickPoint.x, clientY: clickPoint.y }),
      );
      canvasElement.dispatchEvent(
        new MouseEvent('mousemove', {
          buttons: 1,
          clientX: clickPoint.x + 5,
          clientY: clickPoint.y + 5,
        }),
      );

      // 3. Assert
      expect(mockTransformationManager.start).toHaveBeenCalledWith(
        selection,
        clickPoint,
        rotationCenter,
      );
    });

    it('should rotate selected shapes when dragging', () => {
      // 1. Setup
      const shape = createMockShape();
      const selection = new Set([shape]);
      mockSelectionManager.get.mockReturnValue(selection);
      mockTransformationManager.isTransforming.mockReturnValue(true);
      mockTransformationManager.getCurrentMode.mockReturnValue(TransformMode.ROTATE);

      const startPos = { x: 10, y: 10 };
      const endPos = { x: 150, y: 150 };

      // 2. Action
      // Manually set app state to simulate an in-progress drag
      (app as any)._mouseEventHandlers._setDragState(true, true, startPos);
      canvasElement.dispatchEvent(
        new MouseEvent('mousemove', { buttons: 1, clientX: endPos.x, clientY: endPos.y }),
      );

      // 3. Assert
      const expectedDelta = { x: 140, y: 140 };
      const expectedWorldPos = { x: 150, y: 150 };
      expect(mockTransformationManager.transform).toHaveBeenCalledWith(
        expectedDelta,
        expectedWorldPos,
      );
    });
  });
});
