import { Point } from '../core/types.js';

export interface IBackgroundImageData {
  id: string;
  imageData: string; // Base64 encoded image data
  position: Point;
  rotation: number; // in radians
  scale: number;
  opacity: number; // 0-1
  naturalWidth: number;
  naturalHeight: number;
}

export class BackgroundImageData {
  /**
   * Convert BackgroundImage data to JSON format for serialization
   */
  static toJSON(imageData: IBackgroundImageData): any {
    return {
      id: imageData.id,
      imageData: imageData.imageData,
      position: { ...imageData.position },
      rotation: imageData.rotation,
      scale: imageData.scale,
      opacity: imageData.opacity,
      naturalWidth: imageData.naturalWidth,
      naturalHeight: imageData.naturalHeight,
    };
  }

  /**
   * Create BackgroundImage data from JSON format
   */
  static fromJSON(data: any): IBackgroundImageData {
    if (!BackgroundImageData.validate(data)) {
      throw new Error('Invalid background image data format');
    }

    return {
      id: data.id,
      imageData: data.imageData,
      position: { ...data.position },
      rotation: data.rotation,
      scale: data.scale,
      opacity: data.opacity,
      naturalWidth: data.naturalWidth,
      naturalHeight: data.naturalHeight,
    };
  }

  /**
   * Validate background image data structure
   */
  static validate(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const requiredFields = [
      'id',
      'imageData',
      'position',
      'rotation',
      'scale',
      'opacity',
      'naturalWidth',
      'naturalHeight',
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        return false;
      }
    }

    // Validate position is a valid Point
    if (
      !data.position ||
      typeof data.position.x !== 'number' ||
      typeof data.position.y !== 'number'
    ) {
      return false;
    }

    // Validate numeric fields
    if (
      typeof data.rotation !== 'number' ||
      typeof data.scale !== 'number' ||
      typeof data.opacity !== 'number' ||
      typeof data.naturalWidth !== 'number' ||
      typeof data.naturalHeight !== 'number'
    ) {
      return false;
    }

    // Validate string fields
    if (typeof data.id !== 'string' || typeof data.imageData !== 'string') {
      return false;
    }

    return true;
  }

  /**
   * Create default background image data
   */
  static createDefault(
    imageData: string,
    position: Point = { x: 0, y: 0 },
    id?: string,
  ): IBackgroundImageData {
    return {
      id: id || `bg_img_${Math.random().toString(36).substr(2, 9)}`,
      imageData,
      position: { ...position },
      rotation: 0,
      scale: 1,
      opacity: 0.5,
      naturalWidth: 0,
      naturalHeight: 0,
    };
  }
}
