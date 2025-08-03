import { vi } from 'vitest';
// Local copy of TransformMode to avoid depending on src path for tests only
export enum TransformMode {
  NONE,
  MOVE,
  ROTATE,
  MIRROR,
  JIGGLE,
}

// Placement states for PlacementManager
export enum PlacementState {
  IDLE,
  PLACING,
}

export class MockCanvasDrawing {
  draw = vi.fn();
  drawGrid = vi.fn();
  drawAxes = vi.fn();
  drawShapes = vi.fn();
  drawPreviewLines = vi.fn();
  drawSelectionOutline = vi.fn();
  drawRotationHandle = vi.fn();
  drawStatusBar = vi.fn();
  clear = vi.fn();
  setContext = vi.fn();
  setTransform = vi.fn();
  setDpr = vi.fn();
  setCanvasSize = vi.fn();
  setPan = vi.fn();
  setScale = vi.fn();
  setPreviewLines = vi.fn();
  setSelectionBounds = vi.fn();
  setRotationHandle = vi.fn();
  setStatusBarText = vi.fn();
  setEditMode = vi.fn();
  setPlacementMode = vi.fn();
  setShapes = vi.fn();
  setSelection = vi.fn();
  setTransformationMode = vi.fn();
  setTransformationOrigin = vi.fn();
  setTransformationAngle = vi.fn();
  setTransformationScale = vi.fn();
  setTransformationOffset = vi.fn();
  setTransformationRotationCenter = vi.fn();
  setTransformationRotationAngle = vi.fn();
  setTransformationRotationOffset = vi.fn();
  setTransformationMirrorLine = vi.fn();
  setTransformationJiggleOffset = vi.fn();
  setTransformationJiggleAngle = vi.fn();
  setTransformationJiggleScale = vi.fn();
  setTransformationJiggleRotation = vi.fn();
  setTransformationJiggleMirror = vi.fn();
  setTransformationJiggleJiggle = vi.fn();
  setTransformationJiggleJiggleOffset = vi.fn();
  setTransformationJiggleJiggleAngle = vi.fn();
  setTransformationJiggleJiggleScale = vi.fn();
  setTransformationJiggleJiggleRotation = vi.fn();
  setTransformationJiggleJiggleMirror = vi.fn();
}

export class MockCanvasManager {
  setEditMode = vi.fn();
  setPlacementMode = vi.fn();
  getShapes = vi.fn(() => []);
  setShapes = vi.fn();
  addShape = vi.fn();
  getShapeAtPoint = vi.fn();
  getPlacementMode = vi.fn(() => false);
  screenToWorld = vi.fn((point) => point);
  worldToScreen = vi.fn((point) => point);
  draw = vi.fn();
  destroy = vi.fn();
  getCanvas = vi.fn(() => mockCanvasElement);
  handleResize = vi.fn();
  canvas = mockCanvasElement;
  drawing = new MockCanvasDrawing();
  context = vi.fn();
  scale = 1;
  pan = { x: 0, y: 0 };
  dpr = 1;
  previewLines = [];
  selectionBounds = null;
  rotationHandle = null;
  statusBarText = '';
  editMode = false;
  placementMode = false;
  transformationMode = TransformMode.NONE;
  transformationOrigin = { x: 0, y: 0 };
  transformationAngle = 0;
  transformationScale = 1;
  transformationOffset = { x: 0, y: 0 };
  transformationRotationCenter = { x: 0, y: 0 };
  transformationRotationAngle = 0;
  transformationRotationOffset = { x: 0, y: 0 };
  transformationMirrorLine = { p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 } };
  transformationJiggleOffset = { x: 0, y: 0 };
  transformationJiggleAngle = 0;
  transformationJiggleScale = 1;
  transformationJiggleRotation = 0;
  transformationJiggleMirror = false;
  transformationJiggleJiggle = false;
  transformationJiggleJiggleOffset = { x: 0, y: 0 };
  transformationJiggleJiggleAngle = 0;
  transformationJiggleJiggleScale = 1;
  transformationJiggleJiggleRotation = 0;
  transformationJiggleJiggleMirror = false;
}

export class MockToolbarManager {
  setLoadDesignCallback = vi.fn();
  setSaveDesignCallback = vi.fn();
  setSaveAsDesignCallback = vi.fn();
  setCreateShapeCallback = vi.fn();
  setTogglePlacementCallback = vi.fn();
  setToggleEditModeCallback = vi.fn();
  setMoveCallback = vi.fn();
  setRotateCallback = vi.fn();
  setMirrorCallback = vi.fn();
  setJiggleCallback = vi.fn();
  destroy = vi.fn();
}

export class MockPersistenceManager {
  save = vi.fn();
  load = vi.fn();
  destroy = vi.fn();
  clear = vi.fn();
}

export class MockPlacementManager {
  private state: PlacementState = PlacementState.IDLE;
  startPlacement = vi.fn(() => {
    this.state = PlacementState.PLACING;
  });
  cancelPlacement = vi.fn(() => {
    this.state = PlacementState.IDLE;
  });
  getState = vi.fn(() => this.state);
  isPlacing = vi.fn(() => this.state === PlacementState.PLACING);
  destroy = vi.fn();
}

export class MockTransformationManager {
  private mode: TransformMode = TransformMode.NONE;
  getCurrentMode = vi.fn(() => this.mode);
  enterMoveMode = vi.fn(() => {
    this.mode = TransformMode.MOVE;
  });
  enterRotateMode = vi.fn(() => {
    this.mode = TransformMode.ROTATE;
  });
  enterMirrorMode = vi.fn(() => {
    this.mode = TransformMode.MIRROR;
  });
  enterJiggleMode = vi.fn(() => {
    this.mode = TransformMode.JIGGLE;
  });
  end = vi.fn(() => {
    this.mode = TransformMode.NONE;
  });
  destroy = vi.fn();
}

export class MockSelectionManager {
  addSelectedShape = vi.fn();
  removeSelectedShape = vi.fn();
  clearSelection = vi.fn();
  getSelectedShapes = vi.fn(() => []);
  setSelectedShapes = vi.fn();
  getSelectionBounds = vi.fn(() => null);
  clear = vi.fn();
  destroy = vi.fn();
}

// Additional centralized mocks
export class MockStatusBarManager {
  setText = vi.fn();
  clear = vi.fn();
  destroy = vi.fn();
}

export class MockShapeFactory {
  static createShape = vi.fn();
}

const eventListeners: Record<string, Function[]> = {};

export const mockCanvasElement = {
  addEventListener: vi.fn((event, callback) => {
    if (!eventListeners[event]) {
      eventListeners[event] = [];
    }
    eventListeners[event].push(callback);
  }),
  removeEventListener: vi.fn((event, callback) => {
    if (eventListeners[event]) {
      eventListeners[event] = eventListeners[event].filter((cb) => cb !== callback);
    }
  }),
  style: { display: '' } as Partial<CSSStyleDeclaration>,
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  dispatchEvent: vi.fn(() => true),
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    setTransform: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    fillText: vi.fn(),
  })),
};

export const getEventListeners = (event: string) => eventListeners[event] || [];

export const clearAllEventListeners = () => {
  for (const event in eventListeners) {
    delete eventListeners[event];
  }
};
