import { Point } from '../core/types.js';

export class TouchGestureHandler {
  private canvas: HTMLCanvasElement;
  private getDpr: () => number;
  private getOffset: () => Point;
  private onPan: (offset: Point) => void;
  private getScale: () => number;
  private onZoom: (scale: number, center: Point) => void;
  private draw: () => void;
  private canPan: () => boolean;

  // Touch/pinch gesture state
  private touches: Map<number, Point> = new Map();
  private lastPinchDistance = 0;
  private isPinching = false;
  private justFinishedPinching = false;
  private pinchEndTime = 0;
  private pinchCenter: Point | null = null;
  private isDragging = false;
  private lastPos: Point = { x: 0, y: 0 };

  // Throttle expensive draw operations only
  private lastDrawTime = 0;
  private drawThrottleMs = 16; // ~60fps for drawing

  // Mac trackpad gesture state
  private isTrackpadGesture = false;
  private trackpadLastPos: Point = { x: 0, y: 0 };
  private trackpadDragging = false;

  constructor(
    canvas: HTMLCanvasElement,
    getDpr: () => number,
    getOffset: () => Point,
    onPan: (offset: Point) => void,
    getScale: () => number,
    onZoom: (scale: number, center: Point) => void,
    draw: () => void,
    canPan: () => boolean,
  ) {
    this.canvas = canvas;
    this.getDpr = getDpr;
    this.getOffset = getOffset;
    this.onPan = onPan;
    this.getScale = getScale;
    this.onZoom = onZoom;
    this.draw = draw;
    this.canPan = canPan;
  }

  public handleTouchStart(e: TouchEvent): void {
    e.preventDefault();

    // Clear previous touches
    this.touches.clear();

    // Store all current touches
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      this.touches.set(touch.identifier, this.getTouchPos(touch));
    }

    if (e.touches.length === 1) {
      // Single touch - panning (but respect tool restrictions)
      if (this.canPan()) {
        this.isDragging = true;
        this.isPinching = false;
        this.justFinishedPinching = false;
        const touch = e.touches[0];
        this.lastPos = this.getTouchPos(touch);
      }
    } else if (e.touches.length === 2) {
      // Two touches - can be either pinching or panning (Mac trackpad two-finger drag)
      this.isPinching = true;
      this.justFinishedPinching = false;
      const touch1 = this.getTouchPos(e.touches[0]);
      const touch2 = this.getTouchPos(e.touches[1]);
      this.lastPinchDistance = Math.hypot(touch2.x - touch1.x, touch2.y - touch1.y);

      // Set initial pinch center and keep it fixed during the gesture
      this.pinchCenter = {
        x: (touch1.x + touch2.x) / 2,
        y: (touch1.y + touch2.y) / 2,
      };

      // Also prepare for potential two-finger panning (Mac trackpad)
      this.trackpadDragging = true;
      this.trackpadLastPos = this.pinchCenter;
    }
  }

  public handleTouchMove(e: TouchEvent): void {
    e.preventDefault();

    if (e.touches.length === 1 && this.isDragging && !this.isPinching) {
      // Single touch panning - but avoid accidental panning right after pinch-to-zoom
      const now = performance.now();
      const timeSincePinchEnd = now - this.pinchEndTime;

      if (!this.justFinishedPinching || timeSincePinchEnd > 200) {
        // Allow panning if we haven't just finished pinching, or if enough time has passed
        const touch = e.touches[0];
        const touchPos = this.getTouchPos(touch);
        const dx = touchPos.x - this.lastPos.x;
        const dy = touchPos.y - this.lastPos.y;
        const currentOffset = this.getOffset();
        const newOffset = {
          x: currentOffset.x + dx * this.getDpr(),
          y: currentOffset.y + dy * this.getDpr(),
        };
        this.onPan(newOffset);
        this.lastPos = touchPos;
        this.draw();
      }
    } else if (e.touches.length === 2 && this.isPinching) {
      // Two touch handling - detect if it's pinch-to-zoom or two-finger drag
      const touch1 = this.getTouchPos(e.touches[0]);
      const touch2 = this.getTouchPos(e.touches[1]);
      const currentDistance = Math.hypot(touch2.x - touch1.x, touch2.y - touch1.y);
      const currentCenter = {
        x: (touch1.x + touch2.x) / 2,
        y: (touch1.y + touch2.y) / 2,
      };

      // Check if the distance between fingers is changing significantly (pinch gesture)
      const distanceChange = Math.abs(currentDistance - this.lastPinchDistance);
      const centerMovement = this.pinchCenter
        ? Math.hypot(currentCenter.x - this.pinchCenter.x, currentCenter.y - this.pinchCenter.y)
        : 0;

      // If distance is changing more than center movement, treat as pinch-to-zoom
      if (distanceChange > centerMovement && this.lastPinchDistance > 0) {
        const rawZoomFactor = currentDistance / this.lastPinchDistance;
        // Dampen the zoom factor to make it less sensitive
        const zoomFactor = 1 + (rawZoomFactor - 1) * 0.5;
        const currentScale = this.getScale();
        const newScale = currentScale * zoomFactor;

        if (this.pinchCenter) {
          this.onZoom(newScale, this.pinchCenter);
        }
        this.draw();
      }
      // Otherwise, if center is moving more, treat as two-finger drag (Mac trackpad)
      else if (centerMovement > 2 && this.trackpadDragging) {
        if (this.canPan()) {
          const dx = currentCenter.x - this.trackpadLastPos.x;
          const dy = currentCenter.y - this.trackpadLastPos.y;
          const currentOffset = this.getOffset();
          const newOffset = {
            x: currentOffset.x + dx * this.getDpr(),
            y: currentOffset.y + dy * this.getDpr(),
          };
          this.onPan(newOffset);

          // Throttle expensive draw calls
          const now = performance.now();
          if (now - this.lastDrawTime > this.drawThrottleMs) {
            this.draw();
            this.lastDrawTime = now;
          }
        }
        this.trackpadLastPos = currentCenter;
      }

      this.lastPinchDistance = currentDistance;
    }
  }

  public handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();

    // Update touches map
    this.touches.clear();
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      this.touches.set(touch.identifier, this.getTouchPos(touch));
    }

    if (e.touches.length === 0) {
      // No more touches
      this.isDragging = false;
      this.isPinching = false;
      this.trackpadDragging = false;
      this.lastPinchDistance = 0;
      this.justFinishedPinching = false;
      this.pinchCenter = null;
    } else if (e.touches.length === 1) {
      // Switch from pinch to pan - but mark that we just finished pinching to avoid accidental panning
      const wasJustPinching = this.isPinching;
      this.isPinching = false;
      this.trackpadDragging = false;

      // Only start single-finger dragging if tool restrictions allow it
      if (this.canPan()) {
        this.isDragging = true;
        this.lastPos = this.getTouchPos(e.touches[0]);
      }

      if (wasJustPinching) {
        this.justFinishedPinching = true;
        this.pinchEndTime = performance.now();
        this.pinchCenter = null;
      }
    }
  }

  public handleGestureStart(e: any): void {
    e.preventDefault();
    this.isTrackpadGesture = true;

    // If it's a scale gesture (pinch), handle as zoom
    if (e.scale !== undefined && Math.abs(e.scale - 1) > 0.01) {
      // This is a pinch-to-zoom gesture
      return;
    }

    // For translation gestures, start tracking position
    this.trackpadDragging = true;
    this.trackpadLastPos = { x: e.clientX, y: e.clientY };
  }

  public handleGestureChange(e: any): void {
    e.preventDefault();

    if (!this.isTrackpadGesture) return;

    // Handle pinch-to-zoom
    if (e.scale !== undefined && Math.abs(e.scale - 1) > 0.01) {
      const rect = this.canvas.getBoundingClientRect();
      const center = { x: rect.width / 2, y: rect.height / 2 };

      const currentScale = this.getScale();
      const newScale = currentScale * e.scale;

      this.onZoom(newScale, center);
      this.draw();
      return;
    }

    // Handle translation (panning) - respect tool mode restrictions
    if (this.trackpadDragging && e.clientX !== undefined && e.clientY !== undefined) {
      if (this.canPan()) {
        const currentPos = { x: e.clientX, y: e.clientY };
        const dx = currentPos.x - this.trackpadLastPos.x;
        const dy = currentPos.y - this.trackpadLastPos.y;

        const currentOffset = this.getOffset();
        const newOffset = {
          x: currentOffset.x + dx * this.getDpr(),
          y: currentOffset.y + dy * this.getDpr(),
        };

        this.onPan(newOffset);
        this.trackpadLastPos = currentPos;

        // Throttle expensive draw calls
        const now = performance.now();
        if (now - this.lastDrawTime > this.drawThrottleMs) {
          this.draw();
          this.lastDrawTime = now;
        }
      }
    }
  }

  public handleGestureEnd(e: any): void {
    e.preventDefault();
    this.isTrackpadGesture = false;
    this.trackpadDragging = false;
  }

  private getTouchPos(touch: Touch): Point {
    const rect = this.canvas.getBoundingClientRect();
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }
}
