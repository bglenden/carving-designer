import { BackgroundImage } from './BackgroundImage.js';
import { Point } from '../core/types.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { BackgroundImageManager } from './BackgroundImageManager.js';

export class CalibrationManager {
  private calibrationPoints: Point[] = [];
  private calibratingImage: BackgroundImage | null = null;
  private currentMousePosition: Point | null = null;

  constructor(
    private backgroundImageManager: BackgroundImageManager,
    private canvasManager: CanvasManager,
  ) {}

  public startCalibration(): BackgroundImage | null {
    this.calibrationPoints = [];
    this.calibratingImage = null;

    // Select the currently selected image for calibration
    this.calibratingImage = this.backgroundImageManager.getSelectedImage();

    // If no image is selected, try to select the first available image
    if (!this.calibratingImage) {
      const images = this.backgroundImageManager.getImages();
      if (images.length > 0) {
        this.backgroundImageManager.setSelectedImage(images[0]);
        this.calibratingImage = images[0];
        this.canvasManager.render(); // Re-render to show selection
      } else {
        // No images available - show error message
        document.dispatchEvent(
          new CustomEvent('showStatus', {
            detail: {
              message: 'Please load a background image before calibrating.',
              isError: true,
              duration: 3000,
            },
          }),
        );
        return null;
      }
    }

    return this.calibratingImage;
  }

  public addCalibrationPoint(point: Point): {
    completed: boolean;
    calibratedImage: BackgroundImage | null;
  } {
    if (this.calibrationPoints.length < 2) {
      this.calibrationPoints.push({ ...point });
      this.canvasManager.render(); // Re-render to show the new point

      if (this.calibrationPoints.length === 2) {
        // Show calibration dialog and return result
        return this.showCalibrationDialog();
      }
    }
    return { completed: false, calibratedImage: null };
  }

  public getCalibrationPoints(): Point[] {
    return [...this.calibrationPoints];
  }

  public getCalibratingImage(): BackgroundImage | null {
    return this.calibratingImage;
  }

  public setCurrentMousePosition(position: Point | null): void {
    this.currentMousePosition = position;
  }

  public getCurrentMousePosition(): Point | null {
    return this.currentMousePosition;
  }

  public reset(): BackgroundImage | null {
    const calibratedImage = this.calibratingImage;
    this.calibrationPoints = [];
    this.calibratingImage = null;
    this.currentMousePosition = null;
    return calibratedImage;
  }

  public draw(ctx: CanvasRenderingContext2D, scale: number): void {
    if (this.calibrationPoints.length > 0) {
      ctx.save();
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2 / scale;

      for (const point of this.calibrationPoints) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5 / scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      // Draw line between points if we have 2
      if (this.calibrationPoints.length === 2) {
        ctx.beginPath();
        ctx.moveTo(this.calibrationPoints[0].x, this.calibrationPoints[0].y);
        ctx.lineTo(this.calibrationPoints[1].x, this.calibrationPoints[1].y);
        ctx.strokeStyle = 'red';
        ctx.stroke();
      }

      // Draw dotted line from first point to current mouse position if we have 1 point
      if (this.calibrationPoints.length === 1 && this.currentMousePosition) {
        ctx.beginPath();
        ctx.setLineDash([5 / scale, 5 / scale]); // Dotted line pattern
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1 / scale;
        ctx.moveTo(this.calibrationPoints[0].x, this.calibrationPoints[0].y);
        ctx.lineTo(this.currentMousePosition.x, this.currentMousePosition.y);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
      }

      ctx.restore();
    }
  }

  private showCalibrationDialog(): { completed: boolean; calibratedImage: BackgroundImage | null } {
    const message = `Enter the distance between the two points.
    
Examples of accepted formats:
• 25.4mm or 25.4 (millimeters)
• 1" or 1in (inches)
• 3 3/8" or 3 3/8in (inches with fractions)
• 7/16" or 7/16in (fractions)
• 12.5" or 12.5in (decimal inches)`;

    const distance = prompt(message);
    if (distance && this.calibratingImage && this.calibrationPoints.length === 2) {
      const distanceMM = this.parseDistance(distance.trim());
      if (distanceMM !== null && distanceMM > 0) {
        this.calibratingImage.scaleFromTwoPoints(
          this.calibrationPoints[0],
          this.calibrationPoints[1],
          distanceMM,
        );
        this.canvasManager.render();
      } else {
        // Show error message for invalid input
        document.dispatchEvent(
          new CustomEvent('showStatus', {
            detail: {
              message:
                'Invalid distance format. Please use formats like: 25.4mm, 1", 3 3/8", 7/16"',
              isError: true,
              duration: 4000,
            },
          }),
        );
        return { completed: false, calibratedImage: null }; // Don't exit calibration mode on invalid input
      }
    }

    // Store the calibrated image before reset
    const calibratedImage = this.calibratingImage;
    this.reset();
    return { completed: true, calibratedImage };
  }

  private parseDistance(input: string): number | null {
    // Remove extra whitespace and convert to lowercase for processing
    const cleaned = input.replace(/\s+/g, ' ').trim();

    // Check for millimeter units (explicit or implicit)
    const mmMatch = cleaned.match(/^(\d+(?:\.\d+)?)(?:\s*mm)?$/i);
    if (mmMatch) {
      return parseFloat(mmMatch[1]);
    }

    // Check for inch units with various formats
    // Pattern handles: "1"", "1in", "1inch", "3 3/8"", "7/16"", "12.5""
    const inchPattern =
      /^(?:(\d+(?:\.\d+)?)\s+)?(\d+)\/(\d+)(?:\s*(?:"|in|inch))?$|^(\d+(?:\.\d+)?)(?:\s*(?:"|in|inch))$/i;
    const inchMatch = cleaned.match(inchPattern);

    if (inchMatch) {
      let totalInches = 0;

      if (inchMatch[4]) {
        // Simple decimal inches (e.g., "1"", "12.5"")
        totalInches = parseFloat(inchMatch[4]);
      } else {
        // Mixed number or pure fraction (e.g., "3 3/8"", "7/16"")
        // Whole number part (e.g., "3" in "3 3/8")
        if (inchMatch[1]) {
          totalInches += parseFloat(inchMatch[1]);
        }

        // Fraction part (e.g., "3/8" in "3 3/8" or standalone "7/16")
        if (inchMatch[2] && inchMatch[3]) {
          const numerator = parseInt(inchMatch[2]);
          const denominator = parseInt(inchMatch[3]);
          if (denominator > 0) {
            totalInches += numerator / denominator;
          }
        }
      }

      // Convert inches to millimeters (1 inch = 25.4 mm)
      return totalInches * 25.4;
    }

    // Check for pure fraction format (e.g., "7/16" without units - assume inches)
    const fractionMatch = cleaned.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1]);
      const denominator = parseInt(fractionMatch[2]);
      if (denominator > 0) {
        const inches = numerator / denominator;
        return inches * 25.4;
      }
    }

    // Check for mixed number format without units (e.g., "3 3/8" - assume inches)
    const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      const whole = parseInt(mixedMatch[1]);
      const numerator = parseInt(mixedMatch[2]);
      const denominator = parseInt(mixedMatch[3]);
      if (denominator > 0) {
        const inches = whole + numerator / denominator;
        return inches * 25.4;
      }
    }

    return null; // Invalid format
  }
}
