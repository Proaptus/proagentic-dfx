/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Screenshot Utilities Comprehensive Test Suite
 * Coverage Target: 80%
 *
 * Tests all functions with proper Canvas API mocking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  captureCanvasScreenshot,
  downloadScreenshot,
  captureAndDownloadScreenshot,
  generateFilename,
  estimateFileSize,
  addMetadataOverlay,
  dataUrlToBlob,
  isWebPSupported,
  type ScreenshotOptions,
  type ScreenshotMetadata,
} from '@/lib/export/screenshot-utils';

// Mock canvas
const createMockCanvas = (width = 800, height = 600) => {
  const mockContext = {
    drawImage: vi.fn(),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    measureText: vi.fn(() => ({ width: 100 })),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '',
    font: '',
  };

  const mockCanvas = {
    width,
    height,
    toDataURL: vi.fn((mimeType: string, quality?: number) => {
      return `data:${mimeType};base64,mockbase64data`;
    }),
    getContext: vi.fn((type: string) => {
      if (type === '2d') return mockContext;
      return null;
    }),
    remove: vi.fn(),
  };

  return { mockCanvas: mockCanvas as unknown as HTMLCanvasElement, mockContext };
};

describe('Screenshot Utilities', () => {
  let originalCreateElement: typeof document.createElement;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: ReturnType<typeof createMockCanvas>['mockContext'];

  beforeEach(() => {
    vi.clearAllMocks();

    // Store original and set up mock
    originalCreateElement = document.createElement.bind(document);

    const mocks = createMockCanvas();
    mockCanvas = mocks.mockCanvas;
    mockContext = mocks.mockContext;

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return createMockCanvas().mockCanvas as unknown as HTMLCanvasElement;
      }
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
        } as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('captureCanvasScreenshot', () => {
    it('should capture screenshot at scale 1', () => {
      const options: ScreenshotOptions = {
        format: 'png',
        quality: 0.92,
        scale: 1,
      };

      const result = captureCanvasScreenshot(mockCanvas, options);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 0.92);
      expect(result).toContain('data:image/png');
    });

    it('should capture screenshot with jpeg format', () => {
      const options: ScreenshotOptions = {
        format: 'jpeg',
        quality: 0.8,
        scale: 1,
      };

      const result = captureCanvasScreenshot(mockCanvas, options);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
      expect(result).toContain('data:image/jpeg');
    });

    it('should capture screenshot with webp format', () => {
      const options: ScreenshotOptions = {
        format: 'webp',
        quality: 0.9,
        scale: 1,
      };

      const result = captureCanvasScreenshot(mockCanvas, options);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/webp', 0.9);
    });

    it('should create scaled canvas when scale > 1', () => {
      const options: ScreenshotOptions = {
        format: 'png',
        quality: 0.92,
        scale: 2,
      };

      // Need to set up createMockCanvas to return proper canvas for scaling
      captureCanvasScreenshot(mockCanvas, options);

      expect(document.createElement).toHaveBeenCalledWith('canvas');
    });

    it('should handle scale = 4 for 4x resolution', () => {
      const options: ScreenshotOptions = {
        format: 'png',
        quality: 1,
        scale: 4,
      };

      captureCanvasScreenshot(mockCanvas, options);

      expect(document.createElement).toHaveBeenCalledWith('canvas');
    });

    it('should use default values when options are partial', () => {
      const options = { scale: 1 } as ScreenshotOptions;

      captureCanvasScreenshot(mockCanvas, options);

      // Should use default format 'png'
      expect(mockCanvas.toDataURL).toHaveBeenCalled();
    });
  });

  describe('downloadScreenshot', () => {
    it('should create download link and trigger click', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      downloadScreenshot('data:image/png;base64,test', 'test.png');

      expect(mockLink.href).toBe('data:image/png;base64,test');
      expect(mockLink.download).toBe('test.png');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });

  describe('captureAndDownloadScreenshot', () => {
    it('should capture and download screenshot', () => {
      const options: ScreenshotOptions = {
        format: 'png',
        quality: 0.92,
        scale: 1,
        filename: 'test-screenshot.png',
      };

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      vi.spyOn(document.body, 'removeChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      captureAndDownloadScreenshot(mockCanvas, options);

      expect(mockCanvas.toDataURL).toHaveBeenCalled();
    });

    it('should throw error on capture failure', () => {
      const badCanvas = {
        toDataURL: vi.fn(() => {
          throw new Error('Canvas error');
        }),
        width: 800,
        height: 600,
      } as unknown as HTMLCanvasElement;

      const options: ScreenshotOptions = {
        format: 'png',
        quality: 0.92,
        scale: 1,
      };

      expect(() => captureAndDownloadScreenshot(badCanvas, options)).toThrow();
    });
  });

  describe('generateFilename', () => {
    it('should return custom filename with correct extension', () => {
      const options: ScreenshotOptions = {
        format: 'png',
        quality: 0.92,
        scale: 1,
        filename: 'my-screenshot.png',
      };

      const result = generateFilename(options);

      expect(result).toBe('my-screenshot.png');
    });

    it('should add extension if missing', () => {
      const options: ScreenshotOptions = {
        format: 'jpeg',
        quality: 0.92,
        scale: 1,
        filename: 'my-screenshot',
      };

      const result = generateFilename(options);

      expect(result).toBe('my-screenshot.jpeg');
    });

    it('should generate timestamp-based filename when no filename provided', () => {
      const options: ScreenshotOptions = {
        format: 'png',
        quality: 0.92,
        scale: 1,
      };

      const result = generateFilename(options);

      expect(result).toMatch(/^tank-screenshot-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png$/);
    });

    it('should handle webp format in generated filename', () => {
      const options: ScreenshotOptions = {
        format: 'webp',
        quality: 0.9,
        scale: 1,
      };

      const result = generateFilename(options);

      expect(result).toContain('.webp');
    });

    it('should preserve existing extension', () => {
      const options: ScreenshotOptions = {
        format: 'png',
        quality: 0.92,
        scale: 1,
        filename: 'export.jpeg',
      };

      const result = generateFilename(options);

      expect(result).toBe('export.jpeg');
    });
  });

  describe('estimateFileSize', () => {
    it('should estimate file size from data URL', () => {
      // base64 string of ~1000 chars should be ~750 bytes
      const base64Data = 'A'.repeat(1000);
      const dataUrl = `data:image/png;base64,${base64Data}`;

      const result = estimateFileSize(dataUrl);

      // 1000 chars * 6 bits / 8 / 1024 ≈ 0.73 KB
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(2);
    });

    it('should handle empty data URL', () => {
      const dataUrl = 'data:image/png;base64,';

      const result = estimateFileSize(dataUrl);

      expect(result).toBe(0);
    });

    it('should handle large data URLs', () => {
      const base64Data = 'A'.repeat(100000);
      const dataUrl = `data:image/png;base64,${base64Data}`;

      const result = estimateFileSize(dataUrl);

      expect(result).toBeGreaterThan(50);
    });
  });

  describe('addMetadataOverlay', () => {
    it('should add metadata overlay to canvas', () => {
      const metadata: ScreenshotMetadata = {
        timestamp: '2024-01-15T10:30:00Z',
        designId: 'design-123',
        viewSettings: {
          showStress: true,
          showWireframe: false,
        },
      };

      const result = addMetadataOverlay(mockCanvas, metadata);

      // Should return a canvas (either original or new)
      expect(result).toBeDefined();
    });

    it('should handle missing viewSettings', () => {
      const metadata: ScreenshotMetadata = {
        timestamp: '2024-01-15T10:30:00Z',
      };

      const result = addMetadataOverlay(mockCanvas, metadata);

      expect(result).toBeDefined();
    });

    it('should handle all viewSettings options', () => {
      const metadata: ScreenshotMetadata = {
        timestamp: '2024-01-15T10:30:00Z',
        designId: 'design-456',
        viewSettings: {
          showStress: true,
          showWireframe: true,
          showCrossSection: true,
          visibleLayers: [1, 2, 3],
        },
      };

      const result = addMetadataOverlay(mockCanvas, metadata);

      expect(result).toBeDefined();
    });

    it('should return original canvas if context creation fails', () => {
      const badCanvas = {
        ...mockCanvas,
        width: 800,
        height: 600,
        getContext: vi.fn(() => null),
      } as unknown as HTMLCanvasElement;

      // Mock createElement to return a canvas that fails getContext
      vi.spyOn(document, 'createElement').mockReturnValue({
        width: 800,
        height: 600,
        getContext: () => null,
      } as unknown as HTMLCanvasElement);

      const metadata: ScreenshotMetadata = {
        timestamp: '2024-01-15T10:30:00Z',
      };

      const result = addMetadataOverlay(badCanvas, metadata);

      expect(result).toBe(badCanvas);
    });
  });

  describe('dataUrlToBlob', () => {
    it('should convert data URL to blob', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      const result = await dataUrlToBlob('data:image/png;base64,test');

      expect(result).toBe(mockBlob);
      expect(global.fetch).toHaveBeenCalledWith('data:image/png;base64,test');
    });
  });

  describe('isWebPSupported', () => {
    it('should check WebP support', async () => {
      // The mock canvas returns a WebP data URL
      const result = await isWebPSupported();

      // The result depends on the mock implementation
      expect(typeof result).toBe('boolean');
    });

    it('should return false on error', async () => {
      // Mock to throw error
      vi.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('Canvas error');
      });

      const result = await isWebPSupported();

      expect(result).toBe(false);
    });
  });
});
