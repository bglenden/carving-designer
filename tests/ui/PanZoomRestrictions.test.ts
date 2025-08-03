import { vi, describe, beforeEach, it, expect } from 'vitest';
import { PanAndZoomHandler } from '../../src/canvas/PanAndZoomHandler.js';
import { createMouseEvent } from '../setupTests.js';

describe('PanAndZoomHandler - Restriction Changes', () => {
  let handler: PanAndZoomHandler;
  let mockCanvas: HTMLCanvasElement;
  let getDpr: any;
  let getOffset: any;
  let onPan: any;
  let getScale: any;
  let onZoom: any;
  let draw: any;
  let onMouseMove: any;
  let onClick: any;
  let placementModeActive: any;

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    
    getDpr = vi.fn(() => 1);
    getOffset = vi.fn(() => ({ x: 400, y: 300 }));
    onPan = vi.fn();
    getScale = vi.fn(() => 1);
    onZoom = vi.fn();
    draw = vi.fn();
    onMouseMove = vi.fn();
    onClick = vi.fn();
    placementModeActive = vi.fn(() => false);

    handler = new PanAndZoomHandler(
      mockCanvas,
      getDpr,
      getOffset,
      onPan,
      getScale,
      onZoom,
      draw,
      onMouseMove,
      onClick,
      placementModeActive
    );

    vi.clearAllMocks();
  });

  describe('Middle Mouse Panning Override', () => {
    it('should allow middle mouse panning even when placement mode is active', () => {
      // Enable placement mode
      placementModeActive.mockReturnValue(true);

      // Middle mouse down should work
      const mouseDownEvent = createMouseEvent('mousedown', 100, 100, { button: 1 });
      mockCanvas.dispatchEvent(mouseDownEvent);

      // Should have registered the drag
      const mouseMoveEvent = createMouseEvent('mousemove', 110, 110, { button: 1 });
      mockCanvas.dispatchEvent(mouseMoveEvent);

      // Should have called onPan
      expect(onPan).toHaveBeenCalled();
    });

    it('should prevent left mouse panning when placement mode is active', () => {
      // Enable placement mode
      placementModeActive.mockReturnValue(true);

      // Left mouse down should not work
      const mouseDownEvent = createMouseEvent('mousedown', 100, 100, { button: 0 });
      mockCanvas.dispatchEvent(mouseDownEvent);

      // Move should not cause panning
      const mouseMoveEvent = createMouseEvent('mousemove', 110, 110, { button: 0 });
      mockCanvas.dispatchEvent(mouseMoveEvent);

      // Should not have called onPan
      expect(onPan).not.toHaveBeenCalled();
    });

    it('should allow left mouse panning when no special modes are active', () => {
      // Normal mode
      placementModeActive.mockReturnValue(false);

      // Left mouse down should work
      const mouseDownEvent = createMouseEvent('mousedown', 100, 100, { button: 0 });
      mockCanvas.dispatchEvent(mouseDownEvent);

      // Move should cause panning
      const mouseMoveEvent = createMouseEvent('mousemove', 110, 110, { button: 0 });
      mockCanvas.dispatchEvent(mouseMoveEvent);

      // Should have called onPan
      expect(onPan).toHaveBeenCalled();
    });
  });

  describe('Wheel Zoom Always Available', () => {
    it('should allow wheel zoom even when placement mode is active', () => {
      // Enable placement mode
      placementModeActive.mockReturnValue(true);

      // Wheel event should work
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100, // Zoom in
        bubbles: true,
        cancelable: true
      });
      mockCanvas.dispatchEvent(wheelEvent);

      // Should have called onZoom
      expect(onZoom).toHaveBeenCalled();
    });

    it('should allow wheel zoom in normal mode', () => {
      // Normal mode
      placementModeActive.mockReturnValue(false);

      // Wheel event should work
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100, // Zoom out
        bubbles: true,
        cancelable: true
      });
      mockCanvas.dispatchEvent(wheelEvent);

      // Should have called onZoom
      expect(onZoom).toHaveBeenCalled();
    });
  });

  describe('Mode-Specific Behavior', () => {
    it('should handle edit mode restrictions correctly', () => {
      // Set edit mode
      handler.setEditMode(true);

      // Left mouse should not work
      const leftMouseEvent = createMouseEvent('mousedown', 100, 100, { button: 0 });
      mockCanvas.dispatchEvent(leftMouseEvent);
      
      const leftMoveEvent = createMouseEvent('mousemove', 110, 110, { button: 0 });
      mockCanvas.dispatchEvent(leftMoveEvent);
      expect(onPan).not.toHaveBeenCalled();

      // But middle mouse should still work
      vi.clearAllMocks();
      const middleMouseEvent = createMouseEvent('mousedown', 100, 100, { button: 1 });
      mockCanvas.dispatchEvent(middleMouseEvent);
      
      const middleMoveEvent = createMouseEvent('mousemove', 110, 110, { button: 1 });
      mockCanvas.dispatchEvent(middleMoveEvent);
      expect(onPan).toHaveBeenCalled();
    });

    it('should handle background mode restrictions correctly', () => {
      // Set background mode
      handler.setBackgroundMode(true);

      // Left mouse should not work
      const leftMouseEvent = createMouseEvent('mousedown', 100, 100, { button: 0 });
      mockCanvas.dispatchEvent(leftMouseEvent);
      
      const leftMoveEvent = createMouseEvent('mousemove', 110, 110, { button: 0 });
      mockCanvas.dispatchEvent(leftMoveEvent);
      expect(onPan).not.toHaveBeenCalled();

      // But middle mouse should still work
      vi.clearAllMocks();
      const middleMouseEvent = createMouseEvent('mousedown', 100, 100, { button: 1 });
      mockCanvas.dispatchEvent(middleMouseEvent);
      
      const middleMoveEvent = createMouseEvent('mousemove', 110, 110, { button: 1 });
      mockCanvas.dispatchEvent(middleMoveEvent);
      expect(onPan).toHaveBeenCalled();
    });
  });

  describe('Coordinate Updates', () => {
    it('should always update coordinates regardless of mode', () => {
      // Enable placement mode
      placementModeActive.mockReturnValue(true);

      // Mouse move should update coordinates
      const mouseMoveEvent = createMouseEvent('mousemove', 100, 100);
      mockCanvas.dispatchEvent(mouseMoveEvent);

      // Should have called onMouseMove
      expect(onMouseMove).toHaveBeenCalled();
    });
  });

  describe('Context Menu Prevention', () => {
    it('should prevent context menu events', () => {
      const contextMenuEvent = new Event('contextmenu', {
        bubbles: true,
        cancelable: true
      });
      
      const preventDefaultSpy = vi.spyOn(contextMenuEvent, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(contextMenuEvent, 'stopPropagation');

      mockCanvas.dispatchEvent(contextMenuEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('Trackpad Scrolling as Panning', () => {
    it('should handle trackpad two-finger scroll as panning when no tool is active', () => {
      // Normal mode (no tools active)
      placementModeActive.mockReturnValue(false);

      // Create a wheel event with deltaX (horizontal scroll) typical of trackpad
      const wheelEvent = new WheelEvent('wheel', {
        deltaX: 50,
        deltaY: 25,
        bubbles: true,
        cancelable: true
      });

      mockCanvas.dispatchEvent(wheelEvent);

      // Should have called onPan for trackpad scrolling
      expect(onPan).toHaveBeenCalled();
      expect(onZoom).not.toHaveBeenCalled();
    });

    it('should not allow trackpad scroll panning when tools are active', () => {
      // Enable placement mode
      placementModeActive.mockReturnValue(true);

      const wheelEvent = new WheelEvent('wheel', {
        deltaX: 50,
        deltaY: 25,
        bubbles: true,
        cancelable: true
      });

      mockCanvas.dispatchEvent(wheelEvent);

      // Should not have called onPan when tools are active
      expect(onPan).not.toHaveBeenCalled();
    });

    it('should still allow zoom with vertical-only wheel events', () => {
      // Normal mode
      placementModeActive.mockReturnValue(false);

      // Pure vertical scroll (typical mouse wheel)
      const wheelEvent = new WheelEvent('wheel', {
        deltaX: 0,
        deltaY: 100,
        bubbles: true,
        cancelable: true
      });

      mockCanvas.dispatchEvent(wheelEvent);

      // Should zoom, not pan
      expect(onZoom).toHaveBeenCalled();
      expect(onPan).not.toHaveBeenCalled();
    });
  });

  describe('Mac Trackpad Gesture Events', () => {
    it('should handle gesturestart events', () => {
      const gestureStartEvent = new Event('gesturestart', {
        bubbles: true,
        cancelable: true
      });
      
      // Add gesture-specific properties
      Object.defineProperty(gestureStartEvent, 'clientX', { value: 100 });
      Object.defineProperty(gestureStartEvent, 'clientY', { value: 100 });
      
      const preventDefaultSpy = vi.spyOn(gestureStartEvent, 'preventDefault');
      mockCanvas.dispatchEvent(gestureStartEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle gesturechange events for panning when no tools active', () => {
      // Set up gesture start first
      const gestureStartEvent = new Event('gesturestart', {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(gestureStartEvent, 'clientX', { value: 100 });
      Object.defineProperty(gestureStartEvent, 'clientY', { value: 100 });
      mockCanvas.dispatchEvent(gestureStartEvent);

      // Normal mode
      placementModeActive.mockReturnValue(false);

      const gestureChangeEvent = new Event('gesturechange', {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(gestureChangeEvent, 'clientX', { value: 110 });
      Object.defineProperty(gestureChangeEvent, 'clientY', { value: 105 });
      
      vi.clearAllMocks();
      mockCanvas.dispatchEvent(gestureChangeEvent);
      
      // Should pan when no tools are active
      expect(onPan).toHaveBeenCalled();
    });

    it('should not pan with gesturechange when tools are active', () => {
      // Set up gesture start first
      const gestureStartEvent = new Event('gesturestart', {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(gestureStartEvent, 'clientX', { value: 100 });
      Object.defineProperty(gestureStartEvent, 'clientY', { value: 100 });
      mockCanvas.dispatchEvent(gestureStartEvent);

      // Tool active
      placementModeActive.mockReturnValue(true);

      const gestureChangeEvent = new Event('gesturechange', {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(gestureChangeEvent, 'clientX', { value: 110 });
      Object.defineProperty(gestureChangeEvent, 'clientY', { value: 105 });
      
      vi.clearAllMocks();
      mockCanvas.dispatchEvent(gestureChangeEvent);
      
      // Should not pan when tools are active
      expect(onPan).not.toHaveBeenCalled();
    });
  });

  describe('Two-Finger Touch Drag (Mac Trackpad)', () => {
    it('should handle two-finger drag as panning when no tools active', () => {
      // Normal mode
      placementModeActive.mockReturnValue(false);

      // Start two-finger touch
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 1 } as Touch,
          { clientX: 110, clientY: 110, identifier: 2 } as Touch
        ],
        bubbles: true,
        cancelable: true
      });
      mockCanvas.dispatchEvent(touchStartEvent);

      // Move the center of the two fingers (simulating two-finger drag)
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [
          { clientX: 120, clientY: 120, identifier: 1 } as Touch,
          { clientX: 130, clientY: 130, identifier: 2 } as Touch
        ],
        bubbles: true,
        cancelable: true
      });
      
      vi.clearAllMocks();
      mockCanvas.dispatchEvent(touchMoveEvent);

      // Should pan when center moves (not pinch)
      expect(onPan).toHaveBeenCalled();
    });

    it('should not allow two-finger drag panning when tools are active', () => {
      // Tool active
      placementModeActive.mockReturnValue(true);

      // Start two-finger touch
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 1 } as Touch,
          { clientX: 110, clientY: 110, identifier: 2 } as Touch
        ],
        bubbles: true,
        cancelable: true
      });
      mockCanvas.dispatchEvent(touchStartEvent);

      // Move the center of the two fingers
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [
          { clientX: 120, clientY: 120, identifier: 1 } as Touch,
          { clientX: 130, clientY: 130, identifier: 2 } as Touch
        ],
        bubbles: true,
        cancelable: true
      });
      
      vi.clearAllMocks();
      mockCanvas.dispatchEvent(touchMoveEvent);

      // Should not pan when tools are active
      expect(onPan).not.toHaveBeenCalled();
    });
  });
});