import { BackgroundImage, BackgroundImageData } from './BackgroundImage.js';
import { Point, HitResult, HitRegion } from '../core/types.js';

export class BackgroundImageManager {
  private images: BackgroundImage[] = [];
  private selectedImage: BackgroundImage | null = null;
  private globalOpacity = 0.5;

  constructor() {
    // Intentionally empty - manager initializes with empty state
  }

  public addImage(imageData: string, position?: Point): BackgroundImage {
    const image = new BackgroundImage(imageData, position);
    image.setOpacity(this.globalOpacity);
    this.images.push(image);
    return image;
  }

  public removeImage(image: BackgroundImage): void {
    const index = this.images.indexOf(image);
    if (index !== -1) {
      this.images.splice(index, 1);
      if (this.selectedImage === image) {
        this.selectedImage = null;
      }
    }
  }

  public removeSelectedImage(): boolean {
    if (this.selectedImage) {
      this.removeImage(this.selectedImage);
      return true;
    }
    return false;
  }

  public getImages(): BackgroundImage[] {
    return [...this.images];
  }

  public getSelectedImage(): BackgroundImage | null {
    return this.selectedImage;
  }

  public setSelectedImage(image: BackgroundImage | null): void {
    if (this.selectedImage !== image) {
      if (this.selectedImage) {
        this.selectedImage.selected = false;
      }
      this.selectedImage = image;
      if (image) {
        image.selected = true;
      }
    }
  }

  public clearSelection(): void {
    this.setSelectedImage(null);
  }

  public setGlobalOpacity(opacity: number): void {
    this.globalOpacity = Math.max(0, Math.min(1, opacity));
    // Update all images
    for (const image of this.images) {
      image.setOpacity(this.globalOpacity);
    }
  }

  public getGlobalOpacity(): number {
    return this.globalOpacity;
  }

  public hitTest(
    point: Point,
    scale: number,
  ): { image: BackgroundImage | null; hitResult: HitResult } {
    // Test in reverse order (top to bottom)
    for (let i = this.images.length - 1; i >= 0; i--) {
      const image = this.images[i];
      const hitResult = image.hitTest(point, scale);
      if (hitResult.region !== HitRegion.NONE) {
        return { image, hitResult };
      }
    }
    return { image: null, hitResult: { region: HitRegion.NONE } };
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    scale: number,
    hoveredImage?: BackgroundImage,
    hoveredRegion?: HitRegion,
  ): void {
    // Draw all background images in order
    for (const image of this.images) {
      const isHandleHovered = hoveredImage === image && hoveredRegion === HitRegion.ROTATION_HANDLE;
      image.draw(ctx, scale, image.selected, isHandleHovered);
    }
  }

  public moveToFront(image: BackgroundImage): void {
    const index = this.images.indexOf(image);
    if (index !== -1 && index < this.images.length - 1) {
      this.images.splice(index, 1);
      this.images.push(image);
    }
  }

  public moveToBack(image: BackgroundImage): void {
    const index = this.images.indexOf(image);
    if (index > 0) {
      this.images.splice(index, 1);
      this.images.unshift(image);
    }
  }

  public toJSON(): BackgroundImageData[] {
    return this.images.map((img) => img.toJSON());
  }

  public fromJSON(data: BackgroundImageData[]): void {
    const startTime = performance.now();
    console.log(`[PERF] BackgroundImageManager.fromJSON started with ${data.length} images`);

    this.images = data.map((imgData, index) => {
      const imageStartTime = performance.now();
      console.log(`[PERF] Creating image ${index + 1}/${data.length}`);
      const img = BackgroundImage.fromJSON(imgData);
      const imageEndTime = performance.now();
      console.log(
        `[PERF] Image ${index + 1} created in ${(imageEndTime - imageStartTime).toFixed(2)}ms`,
      );
      return img;
    });

    this.selectedImage = null;
    const totalTime = performance.now() - startTime;
    console.log(`[PERF] BackgroundImageManager.fromJSON completed in ${totalTime.toFixed(2)}ms`);
  }

  public clear(): void {
    this.images = [];
    this.selectedImage = null;
  }
}
