import { BackgroundImageManager } from './BackgroundImageManager.js';
import { BackgroundImage } from './BackgroundImage.js';
import { Point, HitRegion } from '../core/types.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { CalibrationManager } from './CalibrationManager.js';
import { ImageCompressionUtil } from './ImageCompressionUtil.js';

export enum BackgroundImageMode {
  NORMAL = 'normal',
  CALIBRATING = 'calibrating',
}

export class BackgroundImageHandler {
  private draggedImage: BackgroundImage | null = null;
  private dragOffset: Point = { x: 0, y: 0 };
  private rotatingImage: BackgroundImage | null = null;
  private rotationStartAngle = 0;
  private initialRotation = 0;
  private mode: BackgroundImageMode = BackgroundImageMode.NORMAL;
  private hoveredImage: BackgroundImage | null = null;
  private hoveredRegion: HitRegion = HitRegion.NONE;
  private calibrationManager: CalibrationManager;

  constructor(
    private backgroundImageManager: BackgroundImageManager,
    private canvasManager: CanvasManager,
  ) {
    this.calibrationManager = new CalibrationManager(backgroundImageManager, canvasManager);
  }

  public setMode(mode: BackgroundImageMode): void {
    this.mode = mode;

    if (mode === BackgroundImageMode.CALIBRATING) {
      const calibratingImage = this.calibrationManager.startCalibration();
      if (!calibratingImage) {
        this.mode = BackgroundImageMode.NORMAL;
      }
    } else {
      this.calibrationManager.reset();
    }

    // Emit calibration mode change event
    document.dispatchEvent(
      new CustomEvent('calibrationModeChanged', {
        detail: {
          active:
            mode === BackgroundImageMode.CALIBRATING &&
            this.calibrationManager.getCalibratingImage() !== null,
        },
      }),
    );
  }

  public getMode(): BackgroundImageMode {
    return this.mode;
  }

  public getHoveredImage(): BackgroundImage | null {
    return this.hoveredImage;
  }

  public getHoveredRegion(): HitRegion {
    return this.hoveredRegion;
  }

  public handleMouseDown(worldPoint: Point, scale: number): boolean {
    if (this.mode === BackgroundImageMode.CALIBRATING) {
      if (!this.calibrationManager.getCalibratingImage()) {
        document.dispatchEvent(
          new CustomEvent('showStatus', {
            detail: {
              message: 'No image selected for calibration.',
              isError: true,
              duration: 3000,
            },
          }),
        );
        return false;
      }

      // Add calibration point and check if calibration is completed
      const result = this.calibrationManager.addCalibrationPoint(worldPoint);
      if (result.completed) {
        // Calibration completed - reset mode and handle result
        this.mode = BackgroundImageMode.NORMAL;

        // Emit calibration mode change event
        document.dispatchEvent(
          new CustomEvent('calibrationModeChanged', {
            detail: { active: false },
          }),
        );

        // Keep the calibrated image selected
        if (result.calibratedImage) {
          this.backgroundImageManager.setSelectedImage(result.calibratedImage);
          this.canvasManager.render();

          // Trigger autosave after calibration
          document.dispatchEvent(new CustomEvent('backgroundImageChanged'));
        }
      }
      return true;
    }

    // Normal mode - handle selection and dragging
    const hit = this.backgroundImageManager.hitTest(worldPoint, scale);

    if (hit.image) {
      this.backgroundImageManager.setSelectedImage(hit.image);

      if (hit.hitResult.region === HitRegion.ROTATION_HANDLE) {
        // Start rotation
        this.rotatingImage = hit.image;
        this.initialRotation = hit.image.getRotation();
        const center = hit.image.getCenter();
        this.rotationStartAngle = Math.atan2(worldPoint.y - center.y, worldPoint.x - center.x);
        return true;
      } else if (hit.hitResult.region === HitRegion.BODY) {
        // Start dragging
        this.draggedImage = hit.image;
        const bounds = hit.image.getBounds();
        this.dragOffset = {
          x: worldPoint.x - bounds.x,
          y: worldPoint.y - bounds.y,
        };
        return true;
      }
    } else {
      // Clicked empty space - clear selection
      this.backgroundImageManager.clearSelection();
    }

    return false;
  }

  public handleMouseMove(worldPoint: Point, scale: number): boolean {
    // Update current mouse position for calibration mode
    this.calibrationManager.setCurrentMousePosition({ ...worldPoint });

    // Handle hover for visual feedback
    if (!this.rotatingImage && !this.draggedImage) {
      const hit = this.backgroundImageManager.hitTest(worldPoint, scale);
      const previousHoveredImage = this.hoveredImage;
      const previousHoveredRegion = this.hoveredRegion;

      this.hoveredImage = hit.image;
      this.hoveredRegion = hit.hitResult.region;

      // Trigger re-render if hover state changed or if in calibration mode (for dotted line)
      if (
        previousHoveredImage !== this.hoveredImage ||
        previousHoveredRegion !== this.hoveredRegion ||
        (this.mode === BackgroundImageMode.CALIBRATING &&
          this.calibrationManager.getCalibrationPoints().length === 1)
      ) {
        this.canvasManager.render();
      }

      // Update cursor based on hover state
      const canvas = this.canvasManager.getCanvas();
      if (this.mode === BackgroundImageMode.CALIBRATING) {
        canvas.style.cursor = 'crosshair';
      } else if (this.hoveredRegion === HitRegion.ROTATION_HANDLE) {
        canvas.style.cursor = 'grab';
      } else if (this.hoveredRegion === HitRegion.BODY) {
        canvas.style.cursor = 'move';
      } else {
        canvas.style.cursor = 'default';
      }
    }

    if (this.rotatingImage) {
      const center = this.rotatingImage.getCenter();
      const currentAngle = Math.atan2(worldPoint.y - center.y, worldPoint.x - center.x);
      const deltaAngle = currentAngle - this.rotationStartAngle;
      const newRotation = this.initialRotation + deltaAngle;

      // Set absolute rotation to avoid accumulation errors
      this.rotatingImage.setRotation(newRotation);

      // Update cursor while rotating
      const canvas = this.canvasManager.getCanvas();
      canvas.style.cursor = 'grabbing';

      return true;
    }

    if (this.draggedImage) {
      const newPosition = {
        x: worldPoint.x - this.dragOffset.x,
        y: worldPoint.y - this.dragOffset.y,
      };
      const currentBounds = this.draggedImage.getBounds();
      const delta = {
        x: newPosition.x - currentBounds.x,
        y: newPosition.y - currentBounds.y,
      };

      this.draggedImage.move(delta);

      // Update cursor while dragging
      const canvas = this.canvasManager.getCanvas();
      canvas.style.cursor = 'grabbing';

      return true;
    }

    return false;
  }

  public handleMouseUp(): void {
    const wasTransforming = this.draggedImage || this.rotatingImage;

    this.draggedImage = null;
    this.rotatingImage = null;

    // Reset cursor
    const canvas = this.canvasManager.getCanvas();
    canvas.style.cursor = 'default';

    // Trigger autosave if we were transforming an image
    if (wasTransforming) {
      document.dispatchEvent(new CustomEvent('backgroundImageChanged'));
    }
  }

  public handleKeyDown(event: KeyboardEvent): boolean {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      return this.backgroundImageManager.removeSelectedImage();
    }
    return false;
  }

  public loadImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          if (imageData) {
            // Add image centered at world origin (0,0)
            const worldOrigin = { x: 0, y: 0 };
            const image = this.backgroundImageManager.addImage(imageData, worldOrigin);

            // Wait for image to load, then fit to canvas centered at origin
            const img = new Image();
            img.onload = () => {
              const canvasWorldBounds = this.canvasManager.getCanvasWorldBounds();
              const worldOrigin = { x: 0, y: 0 };
              image.fitToCanvas(canvasWorldBounds, 0.6, worldOrigin); // Fill 60% of canvas, centered at origin
              this.canvasManager.render();

              // Compress and update the image data for more efficient storage
              ImageCompressionUtil.compressImageData(img, image);

              // Trigger autosave after image is fully loaded and positioned
              document.dispatchEvent(new CustomEvent('backgroundImageChanged'));
            };
            img.src = imageData;
          }
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }

  public draw(ctx: CanvasRenderingContext2D, scale: number): void {
    // Draw calibration UI if in calibration mode
    if (this.mode === BackgroundImageMode.CALIBRATING) {
      this.calibrationManager.draw(ctx, scale);
    }
  }
}
