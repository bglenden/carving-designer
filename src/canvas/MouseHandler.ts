import { Point } from '../core/types.js';

export class MouseHandler {
  private canvas: HTMLCanvasElement;
  private getDpr: () => number;
  private getOffset: () => Point;
  private onPan: (offset: Point) => void;
  private getScale: () => number;
  private onZoom: (scale: number, center: Point) => void;
  private draw: () => void;
  private onMouseMove: ((pos: Point) => void) | null;
  private onClick: ((pos: Point) => void) | null;
  private canPan: () => boolean;
  private canInteract: () => boolean;

  private isDragging = false;
  private hasDragged = false;
  private lastPos: Point = { x: 0, y: 0 };

  // Throttle expensive draw operations only
  private lastDrawTime = 0;
  private drawThrottleMs = 16; // ~60fps for drawing

  constructor(
    canvas: HTMLCanvasElement,
    getDpr: () => number,
    getOffset: () => Point,
    onPan: (offset: Point) => void,
    getScale: () => number,
    onZoom: (scale: number, center: Point) => void,
    draw: () => void,
    onMouseMove: ((pos: Point) => void) | null,
    onClick: ((pos: Point) => void) | null,
    canPan: () => boolean,
    canInteract: () => boolean,
  ) {
    this.canvas = canvas;
    this.getDpr = getDpr;
    this.getOffset = getOffset;
    this.onPan = onPan;
    this.getScale = getScale;
    this.onZoom = onZoom;
    this.draw = draw;
    this.onMouseMove = onMouseMove;
    this.onClick = onClick;
    this.canPan = canPan;
    this.canInteract = canInteract;
  }

  public handleMouseDown(e: MouseEvent): void {
    // Middle mouse button always works for panning, regardless of active modes
    if (e.button === 1) {
      this.isDragging = true;
      this.hasDragged = false;
      this.lastPos = this.getMousePos(e);
      e.preventDefault();
      return;
    }

    // For other mouse buttons, check if modes prevent interaction
    if (!this.canInteract()) {
      return;
    }

    // Left-click - can pan or handle shapes (when no special mode is active)
    if (e.button === 0) {
      this.isDragging = true;
      this.hasDragged = false;
      this.lastPos = this.getMousePos(e);
    }
  }

  public handleMouseMove(e: MouseEvent): void {
    const currentPos = this.getMousePos(e);

    // ALWAYS update coordinates first (before any expensive operations)
    if (this.onMouseMove) {
      this.onMouseMove(currentPos);
    }

    // Handle panning if we're dragging (middle mouse always works, left mouse only when no special modes)
    if (this.isDragging) {
      this.hasDragged = true;

      // Pan for both middle mouse button and left-click drag
      const dx = currentPos.x - this.lastPos.x;
      const dy = currentPos.y - this.lastPos.y;
      const currentOffset = this.getOffset();
      const newOffset = {
        x: currentOffset.x + dx * this.getDpr(),
        y: currentOffset.y + dy * this.getDpr(),
      };
      this.onPan(newOffset);

      // Throttle expensive draw calls to prevent UI blocking
      const now = performance.now();
      if (now - this.lastDrawTime > this.drawThrottleMs) {
        this.draw();
        this.lastDrawTime = now;
      }
    }

    this.lastPos = currentPos;
  }

  public handleMouseUp(e: MouseEvent): void {
    // Handle middle mouse up always (for panning)
    if (e.button === 1) {
      this.isDragging = false;
      this.hasDragged = false;
      return;
    }

    // For other buttons, check mode restrictions
    if (!this.canInteract()) return;

    // A left-click (button: 0) that hasn't involved a drag is a click.
    if (e.button === 0 && this.isDragging && !this.hasDragged) {
      this.onClick?.(this.getMousePos(e));
    }

    this.isDragging = false;
    this.hasDragged = false;
  }

  public handleMouseLeave(): void {
    this.isDragging = false;
    this.hasDragged = false;
  }

  public handleWheel(e: WheelEvent): void {
    e.preventDefault();

    // Detect Mac trackpad two-finger scrolling (has both deltaX and deltaY for pan)
    // vs traditional mouse wheel (only deltaY for zoom) or keyboard-modified trackpad zoom
    const hasHorizontalScroll = Math.abs(e.deltaX) > 0;
    const isKeyboardModified = e.ctrlKey || e.metaKey || e.shiftKey;
    const isTrackpadPan = hasHorizontalScroll && !isKeyboardModified;

    if (isTrackpadPan) {
      // Handle trackpad two-finger scrolling as panning (respect tool restrictions)
      if (this.canPan()) {
        const currentOffset = this.getOffset();
        const sensitivity = 1.0;
        const newOffset = {
          x: currentOffset.x - e.deltaX * sensitivity * this.getDpr(),
          y: currentOffset.y - e.deltaY * sensitivity * this.getDpr(),
        };
        this.onPan(newOffset);

        // Throttle expensive draw calls
        const now = performance.now();
        if (now - this.lastDrawTime > this.drawThrottleMs) {
          this.draw();
          this.lastDrawTime = now;
        }
      }
    } else {
      // Handle zoom (always available) - traditional mouse wheel or modified trackpad
      const rect = this.canvas.getBoundingClientRect();
      const center = { x: rect.width / 2, y: rect.height / 2 };

      const delta = e.deltaY;
      const zoomFactor = delta > 0 ? 0.95 : 1.05;

      const currentScale = this.getScale();
      const newScale = currentScale * zoomFactor;

      this.onZoom(newScale, center);
      this.draw();
    }
  }

  public isPanning(e: MouseEvent): boolean {
    // Panning is initiated by the middle mouse button.
    return e.button === 1;
  }

  public getMousePos(e: MouseEvent | Touch): Point {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}
