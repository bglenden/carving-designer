import { ROTATION_HANDLE_RADIUS } from '../core/SelectionManager.js';
import { TransformMode } from '../core/TransformationManager.js';
import { CanvasManager } from './CanvasManager.js';

export class CanvasDrawing {
  private manager: CanvasManager;

  constructor(manager: CanvasManager) {
    this.manager = manager;
  }

  public draw(): void {
    const ctx = this.manager.context;
    const canvas = this.manager.getCanvas();
    // console.log('[CanvasDrawing][draw] called. Canvas size:', canvas.width, canvas.height, 'DPR:', this.manager['dpr'], 'scale:', this.manager.getScale());
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#f8f8ff'; // ghostwhite, visible on white
    // console.log('[CanvasDrawing][draw] before fillRect, fillStyle:', ctx.fillStyle, 'transform:', ctx.getTransform());
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // console.log('[CanvasDrawing][draw] after fillRect, fillStyle:', ctx.fillStyle, 'transform:', ctx.getTransform());

    // Set world-to-screen transform: scale, invert Y, center origin
    const scale = this.manager.getScale();
    const offset = (this.manager as any).offset;
    ctx.setTransform(scale, 0, 0, -scale, offset.x, offset.y);
    // console.log('[CanvasDrawing][draw] setTransform for world->screen:', scale, offset.x, offset.y);

    this.drawGridAndAxes();

    // Draw background images first (behind everything else)
    this.drawBackgroundImages();

    this.manager.getShapes().forEach((shape) => {
      if (typeof shape.draw === 'function') {
        // Determine if this shape is selected
        const selectedShapes = this.manager.getSelectionManager().get();
        const isSelected = selectedShapes?.has(shape) ?? false;
        shape.draw(ctx, this.manager.getScale(), isSelected);
      }
    });
    this.drawHandles();
    this.drawPreviewLines();
    ctx.restore();
  }

  private drawBackgroundImages(): void {
    const ctx = this.manager.context;
    const backgroundImageManager = this.manager.getBackgroundImageManager();
    const backgroundImageHandler = this.manager.getBackgroundImageHandler();

    // Get hover state if handler is available
    const hoveredImage = backgroundImageHandler?.getHoveredImage() || undefined;
    const hoveredRegion = backgroundImageHandler?.getHoveredRegion() || undefined;

    backgroundImageManager.draw(ctx, this.manager.getScale(), hoveredImage, hoveredRegion);

    // Draw calibration UI overlay (points, lines, etc.)
    if (backgroundImageHandler) {
      backgroundImageHandler.draw(ctx, this.manager.getScale());
    }
  }

  private drawHandles(): void {
    const ctx = this.manager.context;
    const selectedShapes = this.manager.getSelectionManager().get();
    if (selectedShapes) {
      selectedShapes.forEach((shape: any) => {
        shape.drawHandles(ctx, this.manager.getScale());
      });
    }
    if (this.manager.getTransformationManager().getCurrentMode() === TransformMode.ROTATE) {
      const handlePos = this.manager
        .getSelectionManager()
        .getRotationHandlePosition(this.manager.getScale());
      if (handlePos) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const screenPos = this.manager.worldToScreen(handlePos);
        ctx.beginPath();
        ctx.arc(
          screenPos.x * this.manager['dpr'],
          screenPos.y * this.manager['dpr'],
          ROTATION_HANDLE_RADIUS * this.manager['dpr'],
          0,
          2 * Math.PI,
        );
        ctx.fillStyle = 'rgba(0, 123, 255, 0.9)';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2 * this.manager['dpr'];
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  public drawPreviewLines(): void {
    const ctx = this.manager.context;
    if (this.manager['previewLines'].length === 0) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 2 / this.manager.getScale();
    ctx.setLineDash([4 / this.manager.getScale(), 4 / this.manager.getScale()]);
    ctx.beginPath();
    for (const line of this.manager['previewLines']) {
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
    }
    ctx.stroke();
    // console.log('[CanvasDrawing][drawPreviewLines] stroke called');
    ctx.restore();
  }

  public drawGridAndAxes(): void {
    // console.log('[CanvasDrawing][drawGridAndAxes] called');
    const ctx = this.manager.context;
    const gridSize = 10;
    const viewMinWorld = this.manager.screenToWorld({
      x: 0,
      y: this.manager.getCanvas().height / this.manager['dpr'],
    });
    const viewMaxWorld = this.manager.screenToWorld({
      x: this.manager.getCanvas().width / this.manager['dpr'],
      y: 0,
    });
    // console.log('[CanvasDrawing][drawGridAndAxes] strokeStyle:', ctx.strokeStyle, 'lineWidth:', ctx.lineWidth, 'setLineDash:', ctx.getLineDash());
    // console.log('[CanvasDrawing][drawGridAndAxes] before grid and axes drawing. Context state: transform:', ctx.getTransform(), 'globalAlpha:', ctx.globalAlpha, 'canvas width/height:', this.manager.getCanvas().width, this.manager.getCanvas().height);
    // console.log('[CanvasDrawing][drawGridAndAxes] world bounding box for grid and axes:', viewMinWorld.x, viewMinWorld.y, viewMaxWorld.x, viewMaxWorld.y);

    // Draw grid lines
    ctx.save();
    ctx.strokeStyle = '#e0e0e0'; // fainter grid

    // Adaptive line width for grid: use world units at low zoom, but ensure minimum screen pixels at high zoom
    const worldLineWidth = 0.25; // 0.25mm in world units
    const minScreenPixels = 0.5; // Minimum 0.5 pixels on screen for grid visibility
    const scale = this.manager.getScale();
    const gridLineWidth = Math.max(worldLineWidth, minScreenPixels / scale);

    ctx.lineWidth = gridLineWidth;
    ctx.setLineDash([]);
    const startX = Math.floor(viewMinWorld.x / gridSize) * gridSize;
    const endX = Math.ceil(viewMaxWorld.x / gridSize) * gridSize;
    const startY = Math.floor(viewMinWorld.y / gridSize) * gridSize;
    const endY = Math.ceil(viewMaxWorld.y / gridSize) * gridSize;
    // Vertical grid lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    // Horizontal grid lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
    ctx.restore();

    // Draw axes
    ctx.save();
    ctx.strokeStyle = 'black';

    // Adaptive line width for axes: slightly thicker than grid for better visibility
    const axesLineWidth = Math.max(worldLineWidth, (minScreenPixels * 1.2) / scale);

    ctx.lineWidth = axesLineWidth;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.lineTo(0, endY);
    ctx.moveTo(startX, 0);
    ctx.lineTo(endX, 0);
    ctx.stroke();
    ctx.restore();

    // console.log('[CanvasDrawing][drawGridAndAxes] after grid and axes drawing. Context state: transform:', ctx.getTransform(), 'globalAlpha:', ctx.globalAlpha);
    ctx.setLineDash([]);
  }
}
