import { Point } from '../core/types.js';
import { PlacementState } from '../core/PlacementManager.js';
import { CanvasMouseMoveEvent } from '../core/events.js';

export class StatusBarManager {
  private statusBar: HTMLElement;
  private coordinateDisplay: HTMLElement;
  private statusTimeout: number | undefined;

  private boundShowStatusMessageHandler: (event: Event) => void;
  private boundHideStatusHandler: () => void;
  private boundHandleCanvasMouseMove: (event: Event) => void;

  constructor() {
    this.statusBar = document.getElementById('status-bar') as HTMLElement;
    this.coordinateDisplay = document.getElementById('coordinate-display') as HTMLElement;

    this.boundShowStatusMessageHandler = this.showStatusMessageHandler.bind(this);
    this.boundHideStatusHandler = this.hideStatus.bind(this);
    this.boundHandleCanvasMouseMove = this.handleCanvasMouseMove.bind(this);

    document.addEventListener('showStatus', this.boundShowStatusMessageHandler);
    document.addEventListener('hideStatus', this.boundHideStatusHandler);
    document.addEventListener('canvasMouseMove', this.boundHandleCanvasMouseMove);
  }

  public updatePlacementStatus(state: PlacementState): void {
    let message = '';
    switch (state) {
      case PlacementState.PLACING:
        message = 'Click and drag to place the shape (Esc to cancel)';
        break;
      case PlacementState.IDLE:
        this.hideStatus();
        return;
      case PlacementState.PLACED:
        message = 'Shape placed';
        break;
      case PlacementState.CANCELLED:
        message = 'Shape placement cancelled';
        break;
    }
    this.showStatusMessage(message, 2000);
  }

  private showStatusMessageHandler(event: Event): void {
    const customEvent = event as CustomEvent;
    if (customEvent.detail) {
      const { message, duration } = customEvent.detail;
      this.showStatusMessage(message, duration);
    }
  }

  public showStatusMessage(message: string, duration = 3000): void {
    if (!this.statusBar) return;
    this.statusBar.textContent = message;
    this.statusBar.style.display = 'block';

    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }

    if (duration > 0) {
      this.statusTimeout = window.setTimeout(() => {
        if (this.statusBar && this.statusBar.textContent === message) {
          this.statusBar.style.display = 'none';
          this.statusBar.textContent = '';
        }
      }, duration);
    }
  }

  public hideStatus(): void {
    if (this.statusBar) {
      this.statusBar.style.display = 'none';
      this.statusBar.textContent = '';
    }
  }

  private handleCanvasMouseMove(event: Event): void {
    const customEvent = event as CanvasMouseMoveEvent;
    if (customEvent.detail && customEvent.detail.worldPos) {
      this.updateCoordinateDisplay(customEvent.detail.worldPos);
    }
  }

  public updateCoordinateDisplay(worldPos: Point): void {
    if (this.coordinateDisplay) {
      const x = worldPos.x.toFixed(1);
      const y = worldPos.y.toFixed(1);
      this.coordinateDisplay.textContent = `X: ${x}mm, Y: ${y}mm`;
    }
  }

  public destroy(): void {
    document.removeEventListener('showStatus', this.boundShowStatusMessageHandler);
    document.removeEventListener('hideStatus', this.boundHideStatusHandler);
    document.removeEventListener('canvasMouseMove', this.boundHandleCanvasMouseMove);
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }
  }
}
