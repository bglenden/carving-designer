import { vi } from 'vitest';

// This is a more robust way to mock a class, by mocking the constructor and its prototype.
const CanvasManager = vi.fn();

// Mock the prototype with all the public methods of the original class
CanvasManager.prototype.getCanvas = vi.fn().mockReturnValue({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  getBoundingClientRect: vi.fn().mockReturnValue({ width: 800, height: 600 }),
  style: { cursor: '' },
  getContext: vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    setTransform: vi.fn(),
  }),
});
CanvasManager.prototype.getPanAndZoomHandler = vi.fn();
CanvasManager.prototype.getScale = vi.fn().mockReturnValue(1);
CanvasManager.prototype.addShape = vi.fn();
CanvasManager.prototype.removeShapes = vi.fn();
CanvasManager.prototype.getShapes = vi.fn().mockReturnValue([]);
CanvasManager.prototype.setShapes = vi.fn();
CanvasManager.prototype.getShapeAtPoint = vi.fn().mockReturnValue(null);
CanvasManager.prototype.setPreviewLines = vi.fn();
CanvasManager.prototype.handleResize = vi.fn();
CanvasManager.prototype.destroy = vi.fn();
CanvasManager.prototype.setEditMode = vi.fn();
CanvasManager.prototype.setPlacementMode = vi.fn();
CanvasManager.prototype.getPlacementMode = vi.fn().mockReturnValue(false);
CanvasManager.prototype.resizeCanvas = vi.fn();
CanvasManager.prototype.draw = vi.fn();
CanvasManager.prototype.handleCanvasClick = vi.fn();
CanvasManager.prototype.drawPreviewLines = vi.fn();
CanvasManager.prototype.screenToWorld = vi.fn((p) => p);
CanvasManager.prototype.worldToScreen = vi.fn((p) => p);

export { CanvasManager };
