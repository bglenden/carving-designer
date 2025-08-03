import { Point } from '../core/types.js';
import { BackgroundImageData as BgImageData, IBackgroundImageData } from './BackgroundImageData.js';

// Re-export the interface for backward compatibility
export type BackgroundImageData = IBackgroundImageData;

export class BackgroundImageCore {
  public id: string;
  public selected = false;
  protected img: HTMLImageElement;
  protected imageData: string;
  protected position: Point;
  protected rotation: number;
  protected scale: number;
  protected opacity: number;
  protected naturalWidth: number;
  protected naturalHeight: number;
  protected loaded = false;
  protected restoredFromJSON = false;
  protected lazyLoadInProgress = false;

  constructor(
    imageData: string,
    position: Point = { x: 0, y: 0 },
    id?: string,
    restoredFromJSON = false,
  ) {
    const startTime = performance.now();
    console.log(`[PERF] BackgroundImage constructor started for image ${id || 'new'}`);

    // Use data utility to create default data
    const defaultData = BgImageData.createDefault(imageData, position, id);

    this.id = defaultData.id;
    this.imageData = defaultData.imageData;
    this.position = { ...defaultData.position };
    this.rotation = defaultData.rotation;
    this.scale = defaultData.scale;
    this.opacity = defaultData.opacity;
    this.naturalWidth = defaultData.naturalWidth;
    this.naturalHeight = defaultData.naturalHeight;
    this.restoredFromJSON = restoredFromJSON;

    const imageDataSize = new Blob([imageData]).size;
    console.log(`[PERF] Image data size: ${(imageDataSize / 1024).toFixed(1)}KB`);

    this.img = new Image();

    // Optimization: For restored images, defer image creation until needed
    if (this.restoredFromJSON) {
      console.log(`[PERF] Deferring image decoding for restored image ${this.id}`);
      this.loaded = true; // Mark as loaded since we have dimensions
      // Don't set img.src yet - wait until draw() is called
    } else {
      this.img.onload = () => {
        const loadTime = performance.now();
        console.log(`[PERF] Image ${this.id} loaded in ${(loadTime - startTime).toFixed(2)}ms`);

        this.naturalWidth = this.img.naturalWidth;
        this.naturalHeight = this.img.naturalHeight;
        this.loaded = true;
      };

      const setSrcStartTime = performance.now();
      this.img.src = imageData;
      const setSrcEndTime = performance.now();
      console.log(`[PERF] Setting img.src took ${(setSrcEndTime - setSrcStartTime).toFixed(2)}ms`);
    }
  }

  public getCenter(): Point {
    const width = this.naturalWidth * this.scale;
    const height = this.naturalHeight * this.scale;
    return {
      x: this.position.x + width / 2,
      y: this.position.y + height / 2,
    };
  }

  public setOpacity(opacity: number): void {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  public getRotation(): number {
    return this.rotation;
  }

  public setRotation(rotation: number): void {
    this.rotation = rotation;
  }

  public updateImageData(newImageData: string): void {
    this.imageData = newImageData;
    this.img.src = newImageData;
  }

  protected restoreFromJSONData(data: BackgroundImageData): void {
    this.rotation = data.rotation;
    this.scale = data.scale;
    this.opacity = data.opacity;
    this.naturalWidth = data.naturalWidth;
    this.naturalHeight = data.naturalHeight;
    this.loaded = true;
  }

  public toJSON(): BackgroundImageData {
    return BgImageData.toJSON({
      id: this.id,
      imageData: this.imageData,
      position: this.position,
      rotation: this.rotation,
      scale: this.scale,
      opacity: this.opacity,
      naturalWidth: this.naturalWidth,
      naturalHeight: this.naturalHeight,
    });
  }

  public static fromJSON(data: BackgroundImageData): BackgroundImageCore {
    const startTime = performance.now();
    console.log(`[PERF] BackgroundImage.fromJSON started for ${data.id}`);

    // Use data utility to validate and create from JSON
    const validatedData = BgImageData.fromJSON(data);

    const img = new BackgroundImageCore(
      validatedData.imageData,
      validatedData.position,
      validatedData.id,
      true,
    );
    img.rotation = validatedData.rotation;
    img.scale = validatedData.scale;
    img.opacity = validatedData.opacity;
    img.naturalWidth = validatedData.naturalWidth;
    img.naturalHeight = validatedData.naturalHeight;
    img.loaded = true; // Assume loaded since we have the data

    const endTime = performance.now();
    console.log(
      `[PERF] BackgroundImage.fromJSON completed for ${data.id} in ${(endTime - startTime).toFixed(
        2,
      )}ms`,
    );

    return img;
  }
}
