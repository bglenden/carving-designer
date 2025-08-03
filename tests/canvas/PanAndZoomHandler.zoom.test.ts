import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { PanAndZoomHandler } from '../../src/canvas/PanAndZoomHandler.js';
import { Point } from '../../src/core/types.js';
import { createTouchEvent } from '../setupTests.js';

describe('PanAndZoomHandler - Zoom Functionality', () => {
  let canvas: HTMLCanvasElement;
  let getDpr: ReturnType<typeof vi.fn>;
  let getOffset: ReturnType<typeof vi.fn>;
  let onPan: ReturnType<typeof vi.fn>;
  let getScale: ReturnType<typeof vi.fn>;
  let onZoom: ReturnType<typeof vi.fn>;
  let draw: ReturnType<typeof vi.fn>;
  let onMouseMove: ReturnType<typeof vi.fn>;
  let placementModeActive: ReturnType<typeof vi.fn>;
  let handler: PanAndZoomHandler;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    const rect = {
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
    canvas.getBoundingClientRect = vi.fn(() => rect);

    getDpr = vi.fn(() => 1);
    getOffset = vi.fn(() => ({ x: 400, y: 300 }));
    onPan = vi.fn();
    getScale = vi.fn(() => 1);
    onZoom = vi.fn();
    draw = vi.fn();
    onMouseMove = vi.fn();
    placementModeActive = vi.fn(() => false);

    handler = new PanAndZoomHandler(
      canvas,
      getDpr,
      getOffset,
      onPan,
      getScale,
      onZoom,
      draw,
      onMouseMove,
      null,
      placementModeActive,
    );
  });

  afterEach(() => {
    handler.destroy();
    vi.restoreAllMocks();
  });

  describe('Mouse Wheel Zoom', () => {
    it('should trigger zoom with canvas center on wheel events', () => {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100, // Zoom out
        clientX: 500, // This should be ignored
        clientY: 400, // This should be ignored
        bubbles: true,
        cancelable: true,
      });

      canvas.dispatchEvent(wheelEvent);

      expect(onZoom).toHaveBeenCalledTimes(1);
      
      // Should use canvas center (400, 300), not mouse position
      const [newScale, center] = onZoom.mock.calls[0];
      expect(center).toEqual({ x: 400, y: 300 }); // Canvas center (width/2, height/2)
      expect(newScale).toBe(0.95); // Zoom out factor
      expect(draw).toHaveBeenCalledTimes(1);
    });

    it('should zoom in with positive wheel delta', () => {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100, // Zoom in
        bubbles: true,
        cancelable: true,
      });

      canvas.dispatchEvent(wheelEvent);

      const [newScale] = onZoom.mock.calls[0];
      expect(newScale).toBe(1.05); // Zoom in factor
    });

    it('should allow zoom even when in placement mode', () => {
      placementModeActive.mockReturnValue(true);

      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100,
        bubbles: true,
        cancelable: true,
      });

      canvas.dispatchEvent(wheelEvent);

      // Zoom should still work in placement mode
      expect(onZoom).toHaveBeenCalled();
    });
  });

  describe('Pinch-to-Zoom', () => {
    it('should establish pinch gesture with two touches', () => {
      const touchStartEvent = createTouchEvent('touchstart', [
        { clientX: 300, clientY: 200 },
        { clientX: 500, clientY: 400 },
      ]);

      canvas.dispatchEvent(touchStartEvent);

      // Should not trigger zoom yet, just setup
      expect(onZoom).not.toHaveBeenCalled();
      expect(onPan).not.toHaveBeenCalled();
    });

    it('should use fixed center point during pinch gesture', () => {
      // Start pinch gesture
      const touchStartEvent = createTouchEvent('touchstart', [
        { clientX: 300, clientY: 200 },
        { clientX: 500, clientY: 400 },
      ]);
      canvas.dispatchEvent(touchStartEvent);

      // Move fingers to zoom in (increase distance)
      const touchMoveEvent1 = createTouchEvent('touchmove', [
        { clientX: 250, clientY: 150 }, // Move further apart
        { clientX: 550, clientY: 450 },
      ]);
      canvas.dispatchEvent(touchMoveEvent1);

      expect(onZoom).toHaveBeenCalledTimes(1);
      
      // Should use initial center point (400, 300)
      const [, center1] = onZoom.mock.calls[0];
      expect(center1).toEqual({ x: 400, y: 300 });

      // Move fingers again - should use same center
      const touchMoveEvent2 = createTouchEvent('touchmove', [
        { clientX: 200, clientY: 100 }, // Different positions
        { clientX: 600, clientY: 500 },
      ]);
      canvas.dispatchEvent(touchMoveEvent2);

      expect(onZoom).toHaveBeenCalledTimes(2);
      
      // Should still use the same fixed center point
      const [, center2] = onZoom.mock.calls[1];
      expect(center2).toEqual({ x: 400, y: 300 }); // Same as before
    });

    it('should apply zoom dampening to pinch gestures', () => {
      getScale.mockReturnValue(2); // Current scale

      // Start pinch
      canvas.dispatchEvent(createTouchEvent('touchstart', [
        { clientX: 300, clientY: 300 },
        { clientX: 500, clientY: 300 },
      ]));

      // Move to double the distance (2x zoom factor)
      canvas.dispatchEvent(createTouchEvent('touchmove', [
        { clientX: 200, clientY: 300 },
        { clientX: 600, clientY: 300 },
      ]));

      expect(onZoom).toHaveBeenCalledTimes(1);
      
      // With 50% dampening: 1 + (2 - 1) * 0.5 = 1.5
      // Applied to scale 2: 2 * 1.5 = 3
      const [newScale] = onZoom.mock.calls[0];
      expect(newScale).toBe(3);
    });

    it('should handle pinch-to-pan transition without accidental panning', () => {
      // Start pinch
      canvas.dispatchEvent(createTouchEvent('touchstart', [
        { clientX: 300, clientY: 300 },
        { clientX: 500, clientY: 300 },
      ]));

      // Do a pinch zoom
      canvas.dispatchEvent(createTouchEvent('touchmove', [
        { clientX: 250, clientY: 300 },
        { clientX: 550, clientY: 300 },
      ]));

      expect(onZoom).toHaveBeenCalledTimes(1);

      // Lift one finger (transition to single touch)
      canvas.dispatchEvent(createTouchEvent('touchend', [
        { clientX: 250, clientY: 300 }, // Only one touch remains
      ]));

      // Immediately move the remaining finger - should NOT trigger panning
      canvas.dispatchEvent(createTouchEvent('touchmove', [
        { clientX: 260, clientY: 310 }, // Small movement
      ]));

      expect(onPan).not.toHaveBeenCalled(); // Should be blocked by transition delay
    });

    it('should allow panning after transition delay', (done) => {
      // Start and end pinch
      canvas.dispatchEvent(createTouchEvent('touchstart', [
        { clientX: 300, clientY: 300 },
        { clientX: 500, clientY: 300 },
      ]));

      canvas.dispatchEvent(createTouchEvent('touchend', [
        { clientX: 300, clientY: 300 },
      ]));

      // Wait for transition delay (200ms) then try panning
      setTimeout(() => {
        canvas.dispatchEvent(createTouchEvent('touchmove', [
          { clientX: 350, clientY: 350 },
        ]));

        expect(onPan).toHaveBeenCalledTimes(1); // Should now allow panning
        done();
      }, 250); // Wait longer than 200ms transition delay
    });
  });

  describe('State Management', () => {
    it('should reset pinch state when all touches end', () => {
      // Start pinch
      canvas.dispatchEvent(createTouchEvent('touchstart', [
        { clientX: 300, clientY: 300 },
        { clientX: 500, clientY: 300 },
      ]));

      // End all touches
      canvas.dispatchEvent(createTouchEvent('touchend', []));

      // Start new single touch - should work normally (no transition delay)
      canvas.dispatchEvent(createTouchEvent('touchstart', [
        { clientX: 400, clientY: 400 },
      ]));

      canvas.dispatchEvent(createTouchEvent('touchmove', [
        { clientX: 450, clientY: 450 },
      ]));

      expect(onPan).toHaveBeenCalledTimes(1); // Should pan immediately
    });

    it('should allow zoom even when in edit mode', () => {
      // Mock edit mode active
      handler.setEditMode(true);

      // Try wheel zoom
      canvas.dispatchEvent(new WheelEvent('wheel', {
        deltaY: 100,
        bubbles: true,
        cancelable: true,
      }));

      // Should still allow zoom in edit mode
      expect(onZoom).toHaveBeenCalled();
    });
  });

  describe('Performance Optimizations', () => {
    it('should call draw on pan operations', () => {
      // Start pan
      canvas.dispatchEvent(createTouchEvent('touchstart', [
        { clientX: 400, clientY: 300 },
      ]));

      // Do a single pan move
      canvas.dispatchEvent(createTouchEvent('touchmove', [
        { clientX: 450, clientY: 350 },
      ]));

      // Should call both pan and draw
      expect(onPan).toHaveBeenCalledTimes(1);
      expect(draw).toHaveBeenCalled();
    });
  });
});