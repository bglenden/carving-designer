import { describe, it, expect, beforeEach, vi, Mock, Mocked } from 'vitest';
vi.unmock('../../src/core/TransformationManager.js');
import { TransformationManager, TransformMode } from '../../src/core/TransformationManager.js';
import { BaseShape } from '../../src/shapes/BaseShape.js';
import { Point } from '../../src/core/types.js';

// Mock BaseShape so we can track calls to its methods
vi.mock('../../src/shapes/BaseShape.js', () => {
  const BaseShape = vi.fn();
  BaseShape.prototype.move = vi.fn();
  BaseShape.prototype.getBoundingBox = vi.fn(() => ({ minX: 0, minY: 0, maxX: 10, maxY: 10 }));
  return { BaseShape };
});

describe('TransformationManager', () => {
  let manager: TransformationManager;
  let shape1: Mocked<BaseShape>;
  let shape2: Mocked<BaseShape>;
  let shapes: Set<BaseShape>;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new TransformationManager();
    shape1 = new (BaseShape as any)() as Mocked<BaseShape>;
    shape2 = new (BaseShape as any)() as Mocked<BaseShape>;
    shapes = new Set([shape1, shape2]);
    vi.spyOn(document, 'dispatchEvent');
  });

  it('should initialize in IDLE mode', () => {
    expect(manager.getCurrentMode()).toBe(TransformMode.IDLE);
    expect(manager.isTransforming()).toBe(false);
  });

  describe('Mode Switching', () => {
    it.each([
      ['Move', 'enterMoveMode', TransformMode.MOVE],
      ['Rotate', 'enterRotateMode', TransformMode.ROTATE],
    ])('should enter %s mode', (_name, methodName, mode) => {
      (manager as any)[methodName]();
      expect(manager.getCurrentMode()).toBe(mode);
    });

    it('should enter Jiggle mode', () => {
      // Jiggle mode is immediate - it shows a modal instead of entering a mode
      // Mock DOM methods that the modal needs
      const mockChildElement = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        style: { cursor: '' }
      };
      
      const mockElement = {
        querySelector: vi.fn().mockReturnValue(mockChildElement),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        remove: vi.fn(),
        appendChild: vi.fn(),
        getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 300, height: 200 })),
        offsetWidth: 300,
        offsetHeight: 200,
        innerHTML: '',
        id: '',
        className: '',
        style: {
          left: '',
          top: '',
          cursor: ''
        }
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement as any);
      vi.spyOn(document, 'addEventListener').mockImplementation(() => {});
      vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});
      
      // Set up callbacks to prevent error
      manager.setSelectionCallbacks(
        () => new Set([shape1, shape2]),
        () => {}
      );
      
      manager.enterJiggleMode();
      // Jiggle mode doesn't change the current mode, it shows a modal
      expect(manager.getCurrentMode()).toBe(TransformMode.IDLE);
      expect(document.createElement).toHaveBeenCalledWith('div');
    });

    it('should enter Mirror mode', () => {
      // Mirror mode is immediate - it shows a modal instead of entering a mode
      // Mock DOM methods that the modal needs
      const mockElement = {
        querySelector: vi.fn(),
        addEventListener: vi.fn(),
        remove: vi.fn(),
        innerHTML: '',
        id: '',
        className: ''
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement as any);
      
      // Set up callbacks to prevent error
      manager.setSelectionCallbacks(
        () => new Set([shape1, shape2]),
        () => {}
      );
      
      manager.enterMirrorMode();
      // Mirror mode doesn't change the current mode, it shows a modal
      expect(manager.getCurrentMode()).toBe(TransformMode.IDLE);
      expect(document.createElement).toHaveBeenCalledWith('div');
    });

    it('should toggle back to IDLE mode if the same mode is entered twice', () => {
      manager.enterMoveMode();
      expect(manager.getCurrentMode()).toBe(TransformMode.MOVE);
      manager.enterMoveMode();
      expect(manager.getCurrentMode()).toBe(TransformMode.IDLE);
    });

    it('should exit any mode and return to IDLE', () => {
      manager.enterRotateMode();
      expect(manager.getCurrentMode()).toBe(TransformMode.ROTATE);
      manager.exitCurrentMode();
      expect(manager.getCurrentMode()).toBe(TransformMode.IDLE);
    });

    it('should dispatch a transformModeChanged event when mode changes', () => {
      manager.enterMoveMode();
      expect(document.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
      const event = (document.dispatchEvent as Mock).mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe('transformModeChanged');
      expect(event.detail.mode).toBe(TransformMode.MOVE);
    });
  });

  describe('Transformation Workflow', () => {
    beforeEach(() => {
      manager.enterMoveMode();
    });

    it('should not be transforming if start has not been called', () => {
      expect(manager.isTransforming()).toBe(false);
    });

    it('should be transforming after start is called with shapes', () => {
      manager.start(shapes, { x: 0, y: 0 });
      expect(manager.isTransforming()).toBe(true);
    });

    it('should not be transforming if in IDLE mode, even if start is called', () => {
      manager.exitCurrentMode(); // Go back to IDLE
      manager.start(shapes, { x: 0, y: 0 });
      expect(manager.isTransforming()).toBe(false);
    });

    it('should move active shapes when transform is called in MOVE mode', () => {
      const delta: Point = { x: 10, y: 20 };

      manager.start(shapes, { x: 0, y: 0 });
      manager.transform(delta, { x: 0, y: 0 });

      expect(shape1.move).toHaveBeenCalledWith(delta);
      expect(shape2.move).toHaveBeenCalledWith(delta);
    });

    it('should not move shapes if not transforming', () => {
      manager.transform({ x: 10, y: 20 }, { x: 0, y: 0 });
      expect(shape1.move).not.toHaveBeenCalled();
    });

    it('should stop transforming after end is called', () => {
      manager.start(shapes, { x: 0, y: 0 });
      expect(manager.isTransforming()).toBe(true);
      manager.end();
      expect(manager.isTransforming()).toBe(false);
    });

    it('should reset active shapes when exiting mode', () => {
      manager.start(shapes, { x: 0, y: 0 });
      expect(manager.isTransforming()).toBe(true);
      manager.exitCurrentMode();
      expect(manager.isTransforming()).toBe(false);

      // Verify that transform does nothing after exiting
      manager.transform({ x: 10, y: 20 }, { x: 0, y: 0 });
      expect(shape1.move).not.toHaveBeenCalled();
    });

    it('should not do anything for unimplemented transform modes', () => {
      // Spy on console.error to suppress expected error message
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      manager.enterRotateMode();
      manager.start(shapes, { x: 0, y: 0 });
      manager.transform({ x: 10, y: 20 }, { x: 0, y: 0 });
      expect(shape1.move).not.toHaveBeenCalled();
      
      // Verify the error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Rotation center is required for ROTATE mode.');
      consoleErrorSpy.mockRestore();
    });
  });
});
