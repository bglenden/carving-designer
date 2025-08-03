import { vi } from 'vitest';
import { BaseShape } from '../../src/shapes/BaseShape.js';

// A shared Set to hold the selected shapes across all instances of the mocked SelectionManager
const _sharedSelectedShapes = new Set<BaseShape>();

const SelectionManager = vi.fn().mockImplementation(() => ({
  // Instance methods, all are vi.fn() spies
  add: vi.fn((shape: BaseShape) => {
    _sharedSelectedShapes.add(shape);
  }),
  remove: vi.fn((shape: BaseShape) => {
    _sharedSelectedShapes.delete(shape);
  }),
  has: vi.fn((shape: BaseShape) => {
    return _sharedSelectedShapes.has(shape);
  }),
  clear: vi.fn(() => {
    _sharedSelectedShapes.clear();
  }),
  get: vi.fn(() => _sharedSelectedShapes),
  getRotationHandlePosition: vi.fn().mockReturnValue(null),
  hitTestRotationHandle: vi.fn().mockReturnValue(false),
  getCenter: vi.fn().mockReturnValue(null),
  destroy: vi.fn(), // Ensure destroy is also a spy

  // Getter for the 'selection' property, also a spy
  get selection() {
    return _sharedSelectedShapes;
  },
}));

// Expose a static helper on the mocked class itself
// This allows tests to manipulate the shared state directly
(SelectionManager as any)._setMockSelectedShapes = (shapes: Set<BaseShape>) => {
  _sharedSelectedShapes.clear();
  shapes.forEach((shape) => _sharedSelectedShapes.add(shape));
};

// Expose a static helper to reset the state of the shared mock instance for each test.
(SelectionManager as any)._resetAllMocks = () => {
  _sharedSelectedShapes.clear();
  // Clear all spies on the mock instance
  const instance = (SelectionManager as any).mock.results[0]?.value; // Get the first (and likely only) instance
  if (instance) {
    for (const key in instance) {
      if (
        Object.prototype.hasOwnProperty.call(instance, key) &&
        vi.isMockFunction((instance as any)[key])
      ) {
        (instance as any)[key].mockClear();
      }
    }
    // Clear the getter spy as well
    vi.mocked(instance, true).selection.get.mockClear();
  }
  (SelectionManager as any).mockClear(); // Clear calls to the constructor itself
};

export { SelectionManager };
