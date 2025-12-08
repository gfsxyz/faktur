/**
 * Image processing utilities for handling file uploads and format conversions
 */

/**
 * Allowed image MIME types for upload
 */
export const ALLOWED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

/**
 * Maximum file size for image uploads (2MB)
 */
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/**
 * Image formats that need conversion for PDF compatibility
 */
const FORMATS_REQUIRING_CONVERSION = ["image/webp"];

/**
 * Validates if a file is an allowed image format
 */
export function isAllowedImageFormat(file: File): boolean {
  return ALLOWED_IMAGE_FORMATS.includes(
    file.type.toLowerCase() as (typeof ALLOWED_IMAGE_FORMATS)[number]
  );
}

/**
 * Checks if an image format needs conversion for PDF compatibility
 */
function needsConversion(mimeType: string): boolean {
  return FORMATS_REQUIRING_CONVERSION.includes(mimeType.toLowerCase());
}

/**
 * Converts an image file to PNG format using Canvas API
 * Used for formats that aren't natively supported by PDF renderers (e.g., WebP)
 */
async function convertImageToPNG(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Clean up object URL
        URL.revokeObjectURL(objectUrl);

        // Create canvas with image dimensions
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw image and convert to PNG
        ctx.drawImage(img, 0, 0);
        const pngBase64 = canvas.toDataURL("image/png", 1.0);

        resolve(pngBase64);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

/**
 * Converts a file to base64 string without any conversion
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as base64"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Processes an image file for upload
 * - Validates format and size
 * - Converts WebP to PNG for PDF compatibility
 * - Returns base64 string for other formats as-is
 *
 * @throws Error if validation fails or conversion fails
 */
export async function processImageForUpload(file: File): Promise<string> {
  // Validate file size
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be smaller than 2MB");
  }

  // Validate file format
  if (!isAllowedImageFormat(file)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed");
  }

  // Convert WebP to PNG for PDF compatibility, pass through others as-is
  if (needsConversion(file.type)) {
    return await convertImageToPNG(file);
  }

  // For JPG/PNG, return base64 without conversion
  return await fileToBase64(file);
}
