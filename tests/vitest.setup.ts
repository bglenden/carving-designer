import { vi } from 'vitest';
import {
  MockCanvasManager,
  MockPersistenceManager,
  MockPlacementManager,
  MockTransformationManager,
  MockShapeFactory,
  mockCanvasElement,
  PlacementState,
  TransformMode,
} from './mocks/mockManagers';

vi.mock('@/canvas/CanvasManager', () => ({ CanvasManager: MockCanvasManager }));
vi.mock('@/persistence/PersistenceManager', () => ({ PersistenceManager: MockPersistenceManager }));
vi.mock('@/core/PlacementManager', () => ({
  PlacementManager: MockPlacementManager,
  PlacementState,
}));
vi.mock('@/core/TransformationManager', () => ({
  TransformationManager: MockTransformationManager,
  TransformMode,
}));

// Create a canvas element that some tests depend on
const canvas = document.createElement('canvas');
canvas.id = 'main-canvas';
Object.assign(canvas, mockCanvasElement);
document.body.appendChild(canvas);

// Preserve original getElementById for fallback
const originalGetElementById = document.getElementById.bind(document);

// Ensure document.getElementById returns our stubbed elements when requested
vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
  if (id === 'main-canvas') return canvas;
  // Fallback to the original implementation for all other ids so that
  // dynamically created toolbar buttons and menus can still be looked up.
  return originalGetElementById(id);
});
