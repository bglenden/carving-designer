import { Point } from '../core/types.js';
import { MouseHandler } from './MouseHandler.js';
import { TouchGestureHandler } from './TouchGestureHandler.js';

export class PanAndZoomHandler {
  private canvas: HTMLCanvasElement;
  private placementModeActive: (() => boolean) | null;
  private placementModeActiveState = false;
  private editModeActive = false;
  private backgroundModeActive = false;

  private mouseHandler: MouseHandler;
  private touchHandler: TouchGestureHandler;

  // Bound event handlers for correct listener removal
  private boundHandleContextMenu: (e: Event) => void;

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
    placementModeActive: () => boolean,
  ) {
    this.canvas = canvas;
    this.placementModeActive = placementModeActive;

    // Create handler instances
    this.mouseHandler = new MouseHandler(
      canvas,
      getDpr,
      getOffset,
      onPan,
      getScale,
      onZoom,
      draw,
      onMouseMove,
      onClick,
      () => this.canPan(),
      () => this.canInteract(),
    );

    this.touchHandler = new TouchGestureHandler(
      canvas,
      getDpr,
      getOffset,
      onPan,
      getScale,
      onZoom,
      draw,
      () => this.canPan(),
    );

    this.boundHandleContextMenu = this.handleContextMenu.bind(this);

    this.setupEventHandlers();
  }

  public setEditMode(isActive: boolean): void {
    this.editModeActive = isActive;
  }

  public setPlacementMode(isActive: boolean): void {
    // Store internally but keep the original function working
    this.placementModeActiveState = isActive;
  }

  public setBackgroundMode(isActive: boolean): void {
    this.backgroundModeActive = isActive;
  }

  private isPlacementModeActive(): boolean {
    return (
      (this.placementModeActive ? this.placementModeActive() : false) ||
      this.placementModeActiveState
    );
  }

  private canPan(): boolean {
    return !this.isPlacementModeActive() && !this.editModeActive && !this.backgroundModeActive;
  }

  private canInteract(): boolean {
    return !this.isPlacementModeActive() && !this.editModeActive && !this.backgroundModeActive;
  }

  public isPanning(e: MouseEvent): boolean {
    return this.mouseHandler.isPanning(e);
  }

  public destroy(): void {
    this.canvas.removeEventListener('mousedown', (e) => this.mouseHandler.handleMouseDown(e));
    this.canvas.removeEventListener('mousemove', (e) => this.mouseHandler.handleMouseMove(e));
    this.canvas.removeEventListener('mouseup', (e) => this.mouseHandler.handleMouseUp(e));
    this.canvas.removeEventListener('mouseleave', () => this.mouseHandler.handleMouseLeave());
    this.canvas.removeEventListener('wheel', (e) => this.mouseHandler.handleWheel(e));
    this.canvas.removeEventListener('touchstart', (e) => this.touchHandler.handleTouchStart(e));
    this.canvas.removeEventListener('touchmove', (e) => this.touchHandler.handleTouchMove(e));
    this.canvas.removeEventListener('touchend', (e) => this.touchHandler.handleTouchEnd(e));
    this.canvas.removeEventListener('contextmenu', this.boundHandleContextMenu);
    this.canvas.removeEventListener('gesturestart', (e) => this.touchHandler.handleGestureStart(e));
    this.canvas.removeEventListener('gesturechange', (e) =>
      this.touchHandler.handleGestureChange(e),
    );
    this.canvas.removeEventListener('gestureend', (e) => this.touchHandler.handleGestureEnd(e));
  }

  private setupEventHandlers(): void {
    this.canvas.addEventListener('mousedown', (e) => this.mouseHandler.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.mouseHandler.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.mouseHandler.handleMouseUp(e));
    this.canvas.addEventListener('mouseleave', () => this.mouseHandler.handleMouseLeave());
    this.canvas.addEventListener('wheel', (e) => this.mouseHandler.handleWheel(e), {
      passive: false,
    });
    this.canvas.addEventListener('touchstart', (e) => this.touchHandler.handleTouchStart(e), {
      passive: false,
    });
    this.canvas.addEventListener('touchmove', (e) => this.touchHandler.handleTouchMove(e), {
      passive: false,
    });
    this.canvas.addEventListener('touchend', (e) => this.touchHandler.handleTouchEnd(e), {
      passive: false,
    });
    this.canvas.addEventListener('contextmenu', this.boundHandleContextMenu);

    // Mac trackpad gesture events
    this.canvas.addEventListener('gesturestart', (e) => this.touchHandler.handleGestureStart(e), {
      passive: false,
    });
    this.canvas.addEventListener('gesturechange', (e) => this.touchHandler.handleGestureChange(e), {
      passive: false,
    });
    this.canvas.addEventListener('gestureend', (e) => this.touchHandler.handleGestureEnd(e), {
      passive: false,
    });
  }

  private handleContextMenu(e: Event): void {
    // Prevent context menu on canvas to avoid interference with trackpad gestures
    e.preventDefault();
    e.stopPropagation();
  }

  public getMousePos(e: MouseEvent | Touch): Point {
    return this.mouseHandler.getMousePos(e);
  }

  // Expose internal state for tests
  public get isDragging(): boolean {
    return (this.mouseHandler as any).isDragging;
  }
}
