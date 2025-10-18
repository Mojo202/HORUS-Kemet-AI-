/**
 * Converts an image data URL (e.g., JPEG, PNG) to a WebP data URL using a canvas.
 * @param imageDataUrl The base64 data URL of the source image.
 * @param quality A number between 0 and 1 indicating the image quality.
 * @returns A promise that resolves with the base64 data URL of the WebP image.
 */
export function convertToWebp(imageDataUrl: string, quality: number = 0.9): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Could not get 2D context from canvas.'));
      }

      ctx.drawImage(img, 0, 0);
      
      // Convert the canvas content to a WebP data URL.
      // The second parameter is the quality, ranging from 0 to 1.
      const webpDataUrl = canvas.toDataURL('image/webp', quality);
      resolve(webpDataUrl);
    };

    img.onerror = (error) => {
      console.error("Error loading image for conversion:", error);
      reject(new Error('Failed to load the image for conversion.'));
    };

    img.src = imageDataUrl;
  });
}

/**
 * Resizes and crops an image to exact dimensions using a canvas, maintaining aspect ratio.
 * This function performs a "center-crop" to fit the image within the target dimensions.
 * @param imageDataUrl The base64 data URL of the source image.
 * @param targetWidth The desired final width in pixels.
 * @param targetHeight The desired final height in pixels.
 * @returns A promise that resolves with the new base64 data URL of the cropped and resized image.
 */
export function resizeAndCropImage(imageDataUrl: string, targetWidth: number, targetHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Could not get 2D context from canvas.'));
      }

      const sourceWidth = img.width;
      const sourceHeight = img.height;
      const targetAspectRatio = targetWidth / targetHeight;
      const sourceAspectRatio = sourceWidth / sourceHeight;

      let sx, sy, sWidth, sHeight;

      if (sourceAspectRatio > targetAspectRatio) {
        // Source image is wider than target
        sHeight = sourceHeight;
        sWidth = sHeight * targetAspectRatio;
        sx = (sourceWidth - sWidth) / 2;
        sy = 0;
      } else {
        // Source image is taller than target
        sWidth = sourceWidth;
        sHeight = sWidth / targetAspectRatio;
        sx = 0;
        sy = (sourceHeight - sHeight) / 2;
      }
      
      // Draw the calculated portion of the source image onto the full canvas
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      
      const resultDataUrl = canvas.toDataURL('image/webp', 0.95); // High quality for resized images
      resolve(resultDataUrl);
    };

    img.onerror = (error) => {
      console.error("Error loading image for resizing:", error);
      reject(new Error('Failed to load the image for resizing.'));
    };

    img.src = imageDataUrl;
  });
}