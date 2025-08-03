import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { PanAndZoomHandler } from '../../src/canvas/PanAndZoomHandler.js';
import { Point } from '../../src/core/types.js';
import { createMouseEvent, createTouchEvent } from '../setupTests.js';

describe('PanAndZoomHandler', () => {
  let canvas: HTMLCanvasElement;
  let getDpr;
  let getOffset;
  let onPan;
  let getScale;
  let onZoom;
  let draw;
  let onMouseMove;
  let placementModeActive;
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

  it('should be created and setup event listeners', () => {
    const addEventSpy = vi.spyOn(canvas, 'addEventListener');
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
    expect(addEventSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(addEventSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(addEventSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(addEventSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    expect(addEventSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), {
      passive: false,
    });
    expect(addEventSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
    expect(addEventSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: false });
  });

  it('should remove event listeners on destroy', () => {
    const removeEventSpy = vi.spyOn(canvas, 'removeEventListener');
    handler.destroy();
    expect(removeEventSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
  });

  it('should pan on mouse drag', () => {
    // Panning is done with the middle mouse button (button: 1)
    canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100, { button: 1 }));
    canvas.dispatchEvent(createMouseEvent('mousemove', 200, 150, { button: 1, buttons: 4 }));

    expect(onPan).toHaveBeenCalledTimes(1);
    const currentOffset = getOffset();
    const dpr = getDpr();
    const dx = (200 - 100) * dpr;
    const dy = (150 - 100) * dpr;
    expect(onPan).toHaveBeenCalledWith({ x: currentOffset.x + dx, y: currentOffset.y + dy });
    expect(draw).toHaveBeenCalledTimes(1);

    canvas.dispatchEvent(createMouseEvent('mouseup', 200, 150, { button: 1 }));
    expect((handler as any).isDragging).toBe(false);
  });

  it('should not pan if not dragging', () => {
    canvas.dispatchEvent(createMouseEvent('mousemove', 200, 150));
    expect(onPan).not.toHaveBeenCalled();
    expect(draw).not.toHaveBeenCalled();
  });

  it('should not pan on touch if not dragging', () => {
    // Ensure isDragging is false, which is the default state
    canvas.dispatchEvent(createTouchEvent('touchmove', [{ clientX: 200, clientY: 150 }]));
    expect(onPan).not.toHaveBeenCalled();
    expect(draw).not.toHaveBeenCalled();
  });

  it('should not start panning when placement mode is active', () => {
    placementModeActive.mockReturnValue(true);
    canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
    expect((handler as any).isDragging).toBe(false);
  });

  describe('onMouseMove callback', () => {
    it('should be triggered when provided', () => {
      canvas.dispatchEvent(createMouseEvent('mousemove', 250, 300));
      expect(onMouseMove).toHaveBeenCalledTimes(1);
      expect(onMouseMove).toHaveBeenCalledWith({ x: 250, y: 300 });
    });

    it('should not cause an error if null', () => {
      // Create a completely new canvas to avoid shared state
      const newCanvas = document.createElement('canvas');
      const newOnMouseMove = vi.fn();

      const handlerWithNullCallback = new PanAndZoomHandler(
        newCanvas,
        getDpr,
        getOffset,
        onPan,
        getScale,
        onZoom,
        draw,
        null,
        null,
        placementModeActive,
      );

      const moveAction = () => newCanvas.dispatchEvent(createMouseEvent('mousemove', 250, 300));

      expect(moveAction).not.toThrow();
      // The new onMouseMove mock should not be called since we passed null
      expect(newOnMouseMove).not.toHaveBeenCalled();
      // The original onMouseMove mock should also not be called by the new handler
      expect(onMouseMove).not.toHaveBeenCalled();

      handlerWithNullCallback.destroy();
    });

    it('should be triggered during placement mode without panning', () => {
      placementModeActive.mockReturnValue(true);

      canvas.dispatchEvent(createMouseEvent('mousemove', 300, 350));

      expect(onMouseMove).toHaveBeenCalledTimes(1);
      expect(onMouseMove).toHaveBeenCalledWith({ x: 300, y: 350 });
      expect(onPan).not.toHaveBeenCalled();
    });
  });

  it('should pan on touch drag', () => {
    canvas.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    canvas.dispatchEvent(createTouchEvent('touchmove', [{ clientX: 200, clientY: 150 }]));

    expect(onPan).toHaveBeenCalledTimes(1);
    const currentOffset = getOffset();
    const dpr = getDpr();
    const dx = (200 - 100) * dpr;
    const dy = (150 - 100) * dpr;
    expect(onPan).toHaveBeenCalledWith({ x: currentOffset.x + dx, y: currentOffset.y + dy });
    expect(draw).toHaveBeenCalledTimes(1);

    canvas.dispatchEvent(createTouchEvent('touchend', []));
    expect((handler as any).isDragging).toBe(false);
  });

  it('should not start panning with more than one touch', () => {
    canvas.dispatchEvent(
      createTouchEvent('touchstart', [
        { clientX: 100, clientY: 100 },
        { clientX: 200, clientY: 200 },
      ]),
    );
    expect((handler as any).isDragging).toBe(false);
  });

  it('should not pan with more than one touch', () => {
    canvas.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    canvas.dispatchEvent(
      createTouchEvent('touchmove', [
        { clientX: 150, clientY: 150 },
        { clientX: 250, clientY: 250 },
      ]),
    );
    expect(onPan).not.toHaveBeenCalled();
  });

  describe('onClick callback', () => {
    let onClick: Mock<(pos: Point) => void>;

    beforeEach(() => {
      onClick = vi.fn();
      handler.destroy(); // destroy the old handler
      handler = new PanAndZoomHandler(
        canvas,
        getDpr,
        getOffset,
        onPan,
        getScale,
        onZoom,
        draw,
        onMouseMove,
        onClick,
        placementModeActive,
      );
    });

    it('should be triggered on click', () => {
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      canvas.dispatchEvent(createMouseEvent('mouseup', 100, 100));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith({ x: 100, y: 100 });
    });

    it('should not be triggered when placement mode is active', () => {
      placementModeActive.mockReturnValue(true);
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      canvas.dispatchEvent(createMouseEvent('mouseup', 100, 100));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not be triggered on drag', () => {
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      canvas.dispatchEvent(createMouseEvent('mousemove', 110, 110)); // drag
      canvas.dispatchEvent(createMouseEvent('mouseup', 110, 110));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not be triggered on mouseleave', () => {
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      canvas.dispatchEvent(new MouseEvent('mouseleave'));
      expect(onClick).not.toHaveBeenCalled();
      expect((handler as any).isDragging).toBe(false);
    });

    it('should not cause an error if null', () => {
      // Re-create handler with null callback
      handler.destroy();
      const handlerWithNullCallback = new PanAndZoomHandler(
        canvas,
        getDpr,
        getOffset,
        onPan,
        draw,
        onMouseMove,
        null,
        placementModeActive,
      );

      const clickAction = () => {
        canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
        canvas.dispatchEvent(createMouseEvent('mouseup', 100, 100));
      };

      expect(clickAction).not.toThrow();
      handlerWithNullCallback.destroy();
    });
  });
});
