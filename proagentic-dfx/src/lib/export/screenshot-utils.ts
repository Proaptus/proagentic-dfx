/**
 * Screenshot Export Utilities
 * REQ-XXX: Export 3D CAD views as high-quality images
 *
 * Provides utilities for capturing canvas screenshots with quality options,
 * format selection, and resolution scaling.
 */

export interface ScreenshotOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0-1 for jpeg/webp (ignored for png)
  scale: number;   // 1 = current size, 2 = 2x resolution, 4 = 4x resolution
  filename?: string;
  includeMetadata?: boolean;
}

export interface ScreenshotMetadata {
  timestamp: string;
  designId?: string;
  viewSettings?: {
    showStress?: boolean;
    showWireframe?: boolean;
    showCrossSection?: boolean;
    visibleLayers?: number[];
  };
}

/**
 * Captures a screenshot from an HTML canvas element
 * @param canvas The canvas element to capture
 * @param options Screenshot options including format, quality, and scale
 * @returns Data URL of the captured image
 */
export function captureCanvasScreenshot(
  canvas: HTMLCanvasElement,
  options: ScreenshotOptions
): string {
  const {
    format = 'png',
    quality = 0.92,
    scale = 1,
  } = options;

  // If scale is 1, use the canvas directly
  if (scale === 1) {
    const mimeType = getMimeType(format);
    return canvas.toDataURL(mimeType, quality);
  }

  // For higher resolution, create a temporary canvas with scaled dimensions
  const scaledCanvas = document.createElement('canvas');
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;

  scaledCanvas.width = originalWidth * scale;
  scaledCanvas.height = originalHeight * scale;

  const ctx = scaledCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context for screenshot canvas');
  }

  // Disable image smoothing for crisp scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the original canvas scaled up
  ctx.drawImage(
    canvas,
    0,
    0,
    originalWidth,
    originalHeight,
    0,
    0,
    scaledCanvas.width,
    scaledCanvas.height
  );

  const mimeType = getMimeType(format);
  const dataUrl = scaledCanvas.toDataURL(mimeType, quality);

  // Clean up
  scaledCanvas.remove();

  return dataUrl;
}

/**
 * Downloads a screenshot from a data URL
 * @param dataUrl The data URL to download
 * @param filename The filename for the downloaded file
 */
export function downloadScreenshot(
  dataUrl: string,
  filename: string
): void {
  // Create a temporary anchor element
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
}

/**
 * Captures and immediately downloads a screenshot
 * @param canvas The canvas element to capture
 * @param options Screenshot options
 */
export function captureAndDownloadScreenshot(
  canvas: HTMLCanvasElement,
  options: ScreenshotOptions
): void {
  try {
    const dataUrl = captureCanvasScreenshot(canvas, options);
    const filename = generateFilename(options);
    downloadScreenshot(dataUrl, filename);
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    throw error;
  }
}

/**
 * Generates a filename for the screenshot
 * @param options Screenshot options
 * @returns Generated filename with timestamp
 */
export function generateFilename(options: ScreenshotOptions): string {
  const { format, filename } = options;

  if (filename) {
    // Ensure filename has correct extension
    const hasExtension = filename.match(/\.(png|jpeg|jpg|webp)$/i);
    return hasExtension ? filename : `${filename}.${format}`;
  }

  // Generate timestamp-based filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `tank-screenshot-${timestamp}.${format}`;
}

/**
 * Gets the MIME type for a given format
 * @param format Image format
 * @returns MIME type string
 */
function getMimeType(format: 'png' | 'jpeg' | 'webp'): string {
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  };

  return mimeTypes[format] || 'image/png';
}

/**
 * Estimates the file size of a data URL (in KB)
 * @param dataUrl Data URL to estimate
 * @returns Estimated size in kilobytes
 */
export function estimateFileSize(dataUrl: string): number {
  // Remove data URL prefix to get base64 data
  const base64 = dataUrl.split(',')[1] || '';
  // Each base64 character represents 6 bits, divide by 8 to get bytes, then KB
  return Math.round((base64.length * 6) / 8 / 1024);
}

/**
 * Adds metadata as text overlay to canvas (optional feature)
 * @param canvas Canvas to add metadata to
 * @param metadata Metadata to display
 */
export function addMetadataOverlay(
  canvas: HTMLCanvasElement,
  metadata: ScreenshotMetadata
): HTMLCanvasElement {
  // Create a new canvas with metadata overlay
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = canvas.width;
  overlayCanvas.height = canvas.height;

  const ctx = overlayCanvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  // Draw original canvas
  ctx.drawImage(canvas, 0, 0);

  // Add semi-transparent background for metadata
  const padding = 10;
  const fontSize = 12;
  const lineHeight = 16;
  const lines: string[] = [];

  lines.push(`Captured: ${metadata.timestamp}`);
  if (metadata.designId) {
    lines.push(`Design: ${metadata.designId}`);
  }
  if (metadata.viewSettings) {
    const settings = metadata.viewSettings;
    if (settings.showStress) lines.push('Stress: ON');
    if (settings.showWireframe) lines.push('Wireframe: ON');
    if (settings.showCrossSection) lines.push('Cross-Section: ON');
  }

  const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
  const bgHeight = lines.length * lineHeight + padding * 2;
  const bgWidth = textWidth + padding * 2;

  // Draw background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(
    canvas.width - bgWidth - 10,
    10,
    bgWidth,
    bgHeight
  );

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.font = `${fontSize}px sans-serif`;
  lines.forEach((line, index) => {
    ctx.fillText(
      line,
      canvas.width - bgWidth - 10 + padding,
      10 + padding + (index + 1) * lineHeight
    );
  });

  return overlayCanvas;
}

/**
 * Converts data URL to Blob for advanced processing
 * @param dataUrl Data URL to convert
 * @returns Blob of the image data
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Checks if WebP format is supported by the browser
 * @returns Promise resolving to boolean indicating WebP support
 */
export async function isWebPSupported(): Promise<boolean> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/webp');
    return dataUrl.startsWith('data:image/webp');
  } catch {
    return false;
  }
}
