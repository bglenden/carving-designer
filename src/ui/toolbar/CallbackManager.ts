import { ShapeType } from '../../core/types.js';

export class CallbackManager {
  public loadDesignCallback: (() => void) | null = null;
  public saveDesignCallback: (() => void) | null = null;
  public saveAsDesignCallback: (() => void) | null = null;
  public createShapeCallback: ((shapeType: ShapeType) => void) | null = null;
  public togglePlacementCallback: (() => void) | null = null;
  public toggleEditModeCallback: (() => void) | null = null;
  public moveCallback: (() => void) | null = null;
  public rotateCallback: (() => void) | null = null;
  public mirrorCallback: (() => void) | null = null;
  public jiggleCallback: (() => void) | null = null;
  public duplicateCallback: (() => void) | null = null;
  public deleteAllCallback: (() => void) | null = null;
  public toggleBackgroundModeCallback: (() => void) | null = null;
  public loadBackgroundImageCallback: (() => void) | null = null;
  public calibrateImageCallback: (() => void) | null = null;
  public backgroundOpacityCallback: ((opacity: number) => void) | null = null;

  public setLoadDesignCallback(callback: () => void): void {
    this.loadDesignCallback = callback;
  }

  public setSaveDesignCallback(callback: () => void): void {
    this.saveDesignCallback = callback;
  }

  public setSaveAsDesignCallback(callback: () => void): void {
    this.saveAsDesignCallback = callback;
  }

  public setCreateShapeCallback(callback: (shapeType: ShapeType) => void): void {
    this.createShapeCallback = callback;
  }

  public setTogglePlacementCallback(callback: () => void): void {
    this.togglePlacementCallback = callback;
  }

  public setToggleEditModeCallback(callback: () => void): void {
    this.toggleEditModeCallback = callback;
  }

  public setMoveCallback(callback: () => void): void {
    this.moveCallback = callback;
  }

  public setRotateCallback(callback: () => void): void {
    this.rotateCallback = callback;
  }

  public setMirrorCallback(callback: () => void): void {
    this.mirrorCallback = callback;
  }

  public setJiggleCallback(callback: () => void): void {
    this.jiggleCallback = callback;
  }

  public setDuplicateCallback(callback: () => void): void {
    this.duplicateCallback = callback;
  }

  public setDeleteAllCallback(callback: () => void): void {
    this.deleteAllCallback = callback;
  }

  public setToggleBackgroundModeCallback(callback: () => void): void {
    this.toggleBackgroundModeCallback = callback;
  }

  public setLoadBackgroundImageCallback(callback: () => void): void {
    this.loadBackgroundImageCallback = callback;
  }

  public setCalibrateImageCallback(callback: () => void): void {
    this.calibrateImageCallback = callback;
  }

  public setBackgroundOpacityCallback(callback: (opacity: number) => void): void {
    this.backgroundOpacityCallback = callback;
  }
}
