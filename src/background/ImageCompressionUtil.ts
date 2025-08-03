export class ImageCompressionUtil {
  public static compressImageData(img: HTMLImageElement, backgroundImage: any): void {
    try {
      console.log('[PERF] Starting image compression');
      const compressStartTime = performance.now();

      // Create a canvas to redraw the image at a reasonable quality
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set reasonable max dimensions (e.g., 2048x2048) to reduce file size
      const maxDimension = 2048;
      const aspectRatio = img.width / img.height;

      if (img.width > maxDimension || img.height > maxDimension) {
        if (img.width > img.height) {
          canvas.width = maxDimension;
          canvas.height = maxDimension / aspectRatio;
        } else {
          canvas.height = maxDimension;
          canvas.width = maxDimension * aspectRatio;
        }
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Try WebP lossless first (better compression), fallback to PNG
      let compressedData: string;
      try {
        // WebP lossless compression
        compressedData = canvas.toDataURL('image/webp', 1.0);

        // Fallback to PNG if WebP isn't supported or didn't compress well
        if (!compressedData.startsWith('data:image/webp')) {
          compressedData = canvas.toDataURL('image/png');
          console.log('[PERF] Using PNG lossless compression (WebP not supported)');
        } else {
          console.log('[PERF] Using WebP lossless compression');
        }
      } catch (e) {
        // Fallback to PNG if WebP fails
        compressedData = canvas.toDataURL('image/png');
        console.log('[PERF] Using PNG lossless compression (WebP failed)');
      }

      const originalSize = new Blob([backgroundImage.imageData]).size;
      const compressedSize = new Blob([compressedData]).size;
      const compressionRatio = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

      if (compressedSize < originalSize) {
        console.log(
          `[PERF] Image compression successful: ${(originalSize / 1024).toFixed(1)}KB -> ${(
            compressedSize / 1024
          ).toFixed(1)}KB (${compressionRatio}% reduction)`,
        );

        // Update the background image with compressed data
        const img2 = new Image();
        img2.onload = () => {
          backgroundImage.updateImageData(compressedData, img2);
        };
        img2.src = compressedData;
      } else {
        console.log(
          `[PERF] Compression did not reduce size: ${(originalSize / 1024).toFixed(1)}KB -> ${(
            compressedSize / 1024
          ).toFixed(1)}KB, keeping original`,
        );
      }

      const compressEndTime = performance.now();
      console.log(
        `[PERF] Image compression took ${(compressEndTime - compressStartTime).toFixed(2)}ms`,
      );
    } catch (e) {
      console.warn('Image compression failed:', e);
    }
  }
}
