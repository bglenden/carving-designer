import { BaseShape } from '../shapes/BaseShape.js';
import { Point } from '../core/types.js';
import { CanvasMouseMoveEvent } from '../core/events.js';
import { PanAndZoomHandler } from './PanAndZoomHandler.js';
import { SelectionManager } from '../core/SelectionManager.js';
import { TransformationManager } from '../core/TransformationManager.js';
import { BackgroundImageManager } from '../background/BackgroundImageManager.js';
import { BackgroundImageHandler } from '../background/BackgroundImageHandler.js';

import { CanvasDrawing } from './CanvasDrawing.js';
import { CanvasEvents } from './CanvasEvents.js';

export class CanvasManager {
  private shapes: BaseShape[] = [];
  private canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;
  private dpr = 1;
  private scale = 1;
  private worldDimensionX = 120; // -60 to +60 mm
  private worldDimensionY = 100; // -50 to +50 mm
  private offset: Point = { x: 0, y: 0 };

  private previewLines: { start: Point; end: Point }[] = [];
  private panAndZoomHandler: PanAndZoomHandler;
  private placementModeActive = false;
  private selectionManager: SelectionManager;
  private transformationManager: TransformationManager;
  private backgroundImageManager: BackgroundImageManager;
  private backgroundImageHandler: BackgroundImageHandler | null = null;

  public getSelectionManager(): SelectionManager {
    return this.selectionManager;
  }

  public getTransformationManager(): TransformationManager {
    return this.transformationManager;
  }

  public getBackgroundImageManager(): BackgroundImageManager {
    return this.backgroundImageManager;
  }

  public setBackgroundImageHandler(handler: BackgroundImageHandler): void {
    this.backgroundImageHandler = handler;
  }

  public getBackgroundImageHandler(): BackgroundImageHandler | null {
    return this.backgroundImageHandler;
  }

  public drawing: CanvasDrawing;
  public events: CanvasEvents;

  constructor(
    canvas: HTMLCanvasElement,
    selectionManager: SelectionManager,
    transformationManager: TransformationManager,
    backgroundImageManager?: BackgroundImageManager,
  ) {
    this.canvas = canvas;
    this.selectionManager = selectionManager;
    this.transformationManager = transformationManager;
    this.backgroundImageManager = backgroundImageManager || new BackgroundImageManager();
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.context = context;

    // Configure canvas for better rendering quality at high zoom levels
    this.context.imageSmoothingEnabled = false; // Crisp lines without blur
    this.context.lineCap = 'round'; // Smooth line endings
    this.context.lineJoin = 'round'; // Smooth corners instead of sharp miters

    this.drawing = new CanvasDrawing(this);
    this.events = new CanvasEvents(this);
    this.events.setupCanvas();

    this.panAndZoomHandler = new PanAndZoomHandler(
      this.canvas,
      () => this.dpr,
      () => this.offset,
      (newOffset) => (this.offset = newOffset),
      () => this.scale,
      (newScale: number, center: Point) => this.handleZoom(newScale, center),
      () => this.drawing.draw(),
      (screenPos) => {
        const worldPos = this.screenToWorld(screenPos);
        document.dispatchEvent(new CanvasMouseMoveEvent(worldPos));
      },
      (screenPos: Point) => this.events.handleCanvasClick(screenPos),
      () => this.placementModeActive,
    );

    // Listen for background image loading completion to trigger re-render
    document.addEventListener('backgroundImageLoaded', () => {
      console.log('[PERF] Background image loaded, triggering re-render');
      this.drawing.draw();
    });
  }

  // --- Public API ---

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getPanAndZoomHandler(): PanAndZoomHandler {
    return this.panAndZoomHandler;
  }

  public getScale(): number {
    return this.scale;
  }

  public addShape(shape: BaseShape): void {
    this.shapes.push(shape);
    this.drawing.draw();
  }

  public removeShapes(shapesToRemove: BaseShape[]): void {
    this.shapes = this.shapes.filter((shape) => !shapesToRemove.includes(shape));
    this.drawing.draw();
  }

  public getShapes(): BaseShape[] {
    return this.shapes;
  }

  public setShapes(shapes: BaseShape[]): void {
    this.shapes = shapes;
    this.drawing.draw();
  }

  public getShapeAtPoint(worldPos: Point): BaseShape | null {
    // Iterate backwards to check top-most shapes first
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i];
      const doesContain = shape.contains(worldPos);
      if (doesContain) {
        return shape;
      }
    }
    return null;
  }

  public setPreviewLines(lines: { start: Point; end: Point }[]): void {
    this.previewLines = lines;
    this.drawing.draw();
  }

  public handleResize(): void {
    this.events.handleResize();
  }

  public destroy(): void {
    this.panAndZoomHandler.destroy();
  }

  public setEditMode(isActive: boolean): void {
    this.panAndZoomHandler.setEditMode(isActive);
  }

  public setPlacementMode(isActive: boolean): void {
    this.placementModeActive = isActive;
    this.panAndZoomHandler.setPlacementMode(isActive);
  }

  public setBackgroundMode(isActive: boolean): void {
    this.panAndZoomHandler.setBackgroundMode(isActive);
  }

  public getPlacementMode(): boolean {
    return this.placementModeActive;
  }

  public getCanvasCenter(): Point {
    return this.screenToWorld({
      x: this.canvas.width / (2 * this.dpr),
      y: this.canvas.height / (2 * this.dpr),
    });
  }

  public getCanvasWorldBounds(): { width: number; height: number } {
    return {
      width: this.worldDimensionX,
      height: this.worldDimensionY,
    };
  }

  private handleZoom(newScale: number, center: Point): void {
    // Apply zoom limits
    const minScale =
      Math.min(
        this.canvas.width / this.worldDimensionX,
        this.canvas.height / this.worldDimensionY,
      ) * 0.1;
    const maxScale =
      Math.min(
        this.canvas.width / this.worldDimensionX,
        this.canvas.height / this.worldDimensionY,
      ) * 10;
    // Import ValidationUtils if not already imported
    // const clampedScale = ValidationUtils.clamp(newScale, minScale, maxScale);
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));

    // If scale didn't actually change, don't update anything to avoid jitter
    if (Math.abs(clampedScale - this.scale) < 0.001) {
      return;
    }

    // Calculate world position of zoom center before scale change
    const worldCenter = this.screenToWorld(center);

    // Update scale
    this.scale = clampedScale;

    // Adjust offset to keep zoom center at the same screen position
    const deviceCenter = {
      x: center.x * this.dpr,
      y: center.y * this.dpr,
    };

    // More precise offset calculation to prevent drift
    this.offset.x = deviceCenter.x - worldCenter.x * this.scale;
    this.offset.y = deviceCenter.y + worldCenter.y * this.scale;
  }

  public resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;

    // Center the world origin
    this.offset.x = this.canvas.width / 2;
    this.offset.y = this.canvas.height / 2;

    // Calculate scale so the world (-60..+60, -50..+50) mm fills the canvas
    const scaleX = this.canvas.width / this.worldDimensionX;
    const scaleY = this.canvas.height / this.worldDimensionY;
    this.scale = Math.min(scaleX, scaleY);
  }

  // Restore legacy API for tests and compatibility
  public draw(): void {
    this.drawing.draw();
  }

  public render(): void {
    this.drawing.draw();
  }

  public handleCanvasClick(screenPos: Point): void {
    this.events.handleCanvasClick(screenPos);
  }

  public drawPreviewLines(): void {
    this.drawing.drawPreviewLines();
  }

  // --- Coordinate Conversion ---

  public screenToWorld(screenPos: Point): Point {
    const deviceX = screenPos.x * this.dpr;
    const deviceY = screenPos.y * this.dpr;

    return {
      x: (deviceX - this.offset.x) / this.scale,
      y: -(deviceY - this.offset.y) / this.scale, // Invert y-axis
    };
  }

  public worldToScreen(worldPoint: Point): Point {
    const { x, y } = worldPoint;

    const deviceX = this.offset.x + x * this.scale;
    const deviceY = this.offset.y - y * this.scale;

    return { x: deviceX / this.dpr, y: deviceY / this.dpr };
  }
}
