import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PanAndZoomHandler } from '../../src/canvas/PanAndZoomHandler.js';
import type { Point } from '../../src/core/types.js';

// Utility to create a MouseEvent with desired button and coords
function makeMouseEvent(type: string, options: Partial<MouseEventInit> = {}): MouseEvent {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: 100,
    clientY: 80,
    button: 1,
    ...options,
  });
}

describe('PanAndZoomHandler utility behaviour', () => {
  let canvas: HTMLCanvasElement;
  let handler: PanAndZoomHandler;
  let offset: Point;
  const draw = vi.fn();
  const onPan = vi.fn((o: Point) => {
    offset = o;
  });

  beforeEach(() => {
    canvas = document.createElement('canvas');
    // Mock getBoundingClientRect so that clientX/clientY calculations are predictable
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 20,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 10,
      y: 20,
      toJSON() {
        return {};
      },
    } as any);

    handler = new PanAndZoomHandler(
      canvas,
      () => 1, // DPR
      () => ({ x: 0, y: 0 }),
      onPan,
      () => 1, // scale
      () => {}, // onZoom
      draw,
      null,
      null,
      () => false,
    );
  });

  it('isPanning should detect middle mouse button', () => {
    const ev = makeMouseEvent('mousedown', { button: 1 });
    expect(handler.isPanning(ev as MouseEvent)).toBe(true);
  });

  it('getMousePos returns coords relative to canvas', () => {
    const ev = makeMouseEvent('mousemove', { clientX: 50, clientY: 70, button: 0 });
    const pos = handler.getMousePos(ev as MouseEvent);
    expect(pos).toEqual({ x: 40, y: 50 }); // subtract left/top
  });

  it('dragging middle mouse produces onPan calls and draw', () => {
    // Start drag
    canvas.dispatchEvent(makeMouseEvent('mousedown', { button: 1, clientX: 60, clientY: 60 }));
    // Move
    canvas.dispatchEvent(makeMouseEvent('mousemove', { button: 1, clientX: 80, clientY: 90 }));
    // Release
    canvas.dispatchEvent(makeMouseEvent('mouseup', { button: 1 }));

    expect(onPan).toHaveBeenCalled();
    expect(draw).toHaveBeenCalled();
    // The delta should be (20,30)
    expect(offset).toEqual({ x: 20, y: 30 });
  });
});
