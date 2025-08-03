import { vi, describe, beforeEach, it, expect } from 'vitest';
import { KeyboardHandlers } from '../../src/app/KeyboardHandlers.js';
import { ShapeType } from '../../src/core/types.js';

describe('KeyboardHandlers', () => {
  let keyboardHandlers: KeyboardHandlers;
  let mockCanvasManager: any;
  let mockPlacementManager: any;
  let mockSelectionManager: any;
  let mockTransformationManager: any;
  let mockBackgroundImageHandler: any;
  let mockIsEditMode: ReturnType<typeof vi.fn>;
  let mockIsPlacementModeActive: ReturnType<typeof vi.fn>;
  let mockIsBackgroundMode: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock managers
    mockCanvasManager = {
      removeShapes: vi.fn(),
      draw: vi.fn(),
      render: vi.fn(),
      addShape: vi.fn(),
      getShapes: vi.fn(() => []),
    };

    mockPlacementManager = {
      cancelPlacement: vi.fn(),
    };

    mockSelectionManager = {
      get: vi.fn(() => new Set()),
      clear: vi.fn(),
      add: vi.fn(),
    };

    mockTransformationManager = {
      isTransforming: vi.fn(() => false),
      exitCurrentMode: vi.fn(),
    };

    mockBackgroundImageHandler = {
      handleKeyDown: vi.fn(() => false),
    };

    // Create mock functions for mode checks
    mockIsEditMode = vi.fn(() => true);
    mockIsPlacementModeActive = vi.fn(() => false);
    mockIsBackgroundMode = vi.fn(() => false);

    // Create KeyboardHandlers instance
    keyboardHandlers = new KeyboardHandlers(
      mockCanvasManager,
      mockPlacementManager,
      mockSelectionManager,
      mockTransformationManager,
      mockIsEditMode,
      mockIsPlacementModeActive,
      mockBackgroundImageHandler,
      mockIsBackgroundMode,
    );
  });

  describe('Select All Functionality', () => {
    it('should select all shapes when Cmd+A is pressed in edit mode on Mac', () => {
      // Mock Mac platform
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      const mockShapes = [
        { type: ShapeType.LEAF, id: 'shape1' },
        { type: ShapeType.TRI_ARC, id: 'shape2' },
        { type: ShapeType.LEAF, id: 'shape3' },
      ];

      mockCanvasManager.getShapes.mockReturnValue(mockShapes);
      mockIsEditMode.mockReturnValue(true);

      // Create keyboard event for Cmd+A
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: true, // Command key on Mac
        ctrlKey: false,
      });

      // Spy on preventDefault
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyboardHandlers.handleKeyDown(event);

      // Verify preventDefault was called
      expect(preventDefaultSpy).toHaveBeenCalled();

      // Verify all shapes were selected
      expect(mockSelectionManager.clear).toHaveBeenCalled();
      expect(mockSelectionManager.add).toHaveBeenCalledTimes(3);
      expect(mockSelectionManager.add).toHaveBeenCalledWith(mockShapes[0]);
      expect(mockSelectionManager.add).toHaveBeenCalledWith(mockShapes[1]);
      expect(mockSelectionManager.add).toHaveBeenCalledWith(mockShapes[2]);

      // Verify canvas was redrawn
      expect(mockCanvasManager.draw).toHaveBeenCalled();
    });

    it('should select all shapes when Ctrl+A is pressed in edit mode on Windows/Linux', () => {
      // Mock Windows platform
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true,
      });

      const mockShapes = [
        { type: ShapeType.LEAF, id: 'shape1' },
        { type: ShapeType.TRI_ARC, id: 'shape2' },
      ];

      mockCanvasManager.getShapes.mockReturnValue(mockShapes);
      mockIsEditMode.mockReturnValue(true);

      // Create keyboard event for Ctrl+A
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: false,
        ctrlKey: true, // Control key on Windows/Linux
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyboardHandlers.handleKeyDown(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockSelectionManager.clear).toHaveBeenCalled();
      expect(mockSelectionManager.add).toHaveBeenCalledTimes(2);
      expect(mockCanvasManager.draw).toHaveBeenCalled();
    });

    it('should do nothing when Cmd+A is pressed but not in edit mode', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      const mockShapes = [
        { type: ShapeType.LEAF, id: 'shape1' },
      ];

      mockCanvasManager.getShapes.mockReturnValue(mockShapes);
      mockIsEditMode.mockReturnValue(false); // Not in edit mode

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: true,
        ctrlKey: false,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyboardHandlers.handleKeyDown(event);

      // Should still prevent default to avoid browser behavior
      expect(preventDefaultSpy).toHaveBeenCalled();

      // But should not select any shapes
      expect(mockSelectionManager.clear).not.toHaveBeenCalled();
      expect(mockSelectionManager.add).not.toHaveBeenCalled();
      expect(mockCanvasManager.draw).not.toHaveBeenCalled();
    });

    it('should handle empty canvas gracefully', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      mockCanvasManager.getShapes.mockReturnValue([]); // Empty canvas
      mockIsEditMode.mockReturnValue(true);

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: true,
        ctrlKey: false,
      });

      keyboardHandlers.handleKeyDown(event);

      // Should clear selection and redraw, but not add any shapes
      expect(mockSelectionManager.clear).toHaveBeenCalled();
      expect(mockSelectionManager.add).not.toHaveBeenCalled();
      expect(mockCanvasManager.draw).toHaveBeenCalled();
    });

    it('should not interfere with other Cmd+A behavior when not in edit mode', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      mockIsEditMode.mockReturnValue(false);

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: true,
        ctrlKey: false,
      });

      keyboardHandlers.handleKeyDown(event);

      // Should prevent default but not interfere with selections
      expect(mockSelectionManager.clear).not.toHaveBeenCalled();
      expect(mockSelectionManager.add).not.toHaveBeenCalled();
    });
  });

  describe('Existing Keyboard Functionality', () => {
    it('should still handle copy (Cmd+C) correctly', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      const selectedShapes = new Set([
        { type: ShapeType.LEAF, id: 'shape1' },
      ]);

      mockSelectionManager.get.mockReturnValue(selectedShapes);

      const event = new KeyboardEvent('keydown', {
        key: 'c',
        metaKey: true,
        ctrlKey: false,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyboardHandlers.handleKeyDown(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockSelectionManager.get).toHaveBeenCalled();
    });

    it('should still handle paste (Cmd+V) correctly', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      const event = new KeyboardEvent('keydown', {
        key: 'v',
        metaKey: true,
        ctrlKey: false,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyboardHandlers.handleKeyDown(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      // Paste behavior is tested in detail elsewhere
    });

    it('should still handle delete/backspace correctly', () => {
      mockIsEditMode.mockReturnValue(true);

      const selectedShapes = new Set([
        { type: ShapeType.LEAF, id: 'shape1' },
      ]);

      mockSelectionManager.get.mockReturnValue(selectedShapes);

      const event = new KeyboardEvent('keydown', {
        key: 'Delete',
      });

      keyboardHandlers.handleKeyDown(event);

      expect(mockCanvasManager.removeShapes).toHaveBeenCalledWith([...selectedShapes]);
      expect(mockSelectionManager.clear).toHaveBeenCalled();
    });

    it('should still handle escape correctly', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
      });

      keyboardHandlers.handleKeyDown(event);

      expect(mockSelectionManager.clear).toHaveBeenCalled();
      expect(mockCanvasManager.draw).toHaveBeenCalled();
    });
  });

  describe('Platform Detection', () => {
    it('should correctly detect Mac platform and use metaKey', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      const mockShapes = [{ type: ShapeType.LEAF, id: 'shape1' }];
      mockCanvasManager.getShapes.mockReturnValue(mockShapes);
      mockIsEditMode.mockReturnValue(true);

      // Test with metaKey (should work)
      const metaEvent = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: true,
        ctrlKey: false,
      });

      keyboardHandlers.handleKeyDown(metaEvent);
      expect(mockSelectionManager.add).toHaveBeenCalledWith(mockShapes[0]);

      // Reset mocks
      vi.clearAllMocks();

      // Test with ctrlKey (should not work on Mac)
      const ctrlEvent = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: false,
        ctrlKey: true,
      });

      keyboardHandlers.handleKeyDown(ctrlEvent);
      expect(mockSelectionManager.add).not.toHaveBeenCalled();
    });

    it('should correctly detect Windows platform and use ctrlKey', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true,
      });

      const mockShapes = [{ type: ShapeType.LEAF, id: 'shape1' }];
      mockCanvasManager.getShapes.mockReturnValue(mockShapes);
      mockIsEditMode.mockReturnValue(true);

      // Test with ctrlKey (should work)
      const ctrlEvent = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: false,
        ctrlKey: true,
      });

      keyboardHandlers.handleKeyDown(ctrlEvent);
      expect(mockSelectionManager.add).toHaveBeenCalledWith(mockShapes[0]);

      // Reset mocks
      vi.clearAllMocks();

      // Test with metaKey (should not work on Windows)
      const metaEvent = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: true,
        ctrlKey: false,
      });

      keyboardHandlers.handleKeyDown(metaEvent);
      expect(mockSelectionManager.add).not.toHaveBeenCalled();
    });
  });
});