/**
 * Screenshot Utils - Edge Cases and Additional Coverage
 * Focus on uncovered branches for screenshot-utils
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  captureCanvasScreenshot,
  downloadScreenshot,
  captureAndDownloadScreenshot,
  addMetadataOverlay,
  dataUrlToBlob,
  isWebPSupported,
  type ScreenshotOptions,
  type ScreenshotMetadata,
} from '@/lib/export/screenshot-utils';

describe('Screenshot Utils - Edge Cases', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Create mock context
    mockContext = {
      drawImage: vi.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      measureText: vi.fn(() => ({ width: 100 })),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      fillStyle: '',
      font: '',
    } as unknown as CanvasRenderingContext2D;

    // Create mock canvas
    mockCanvas = {
      width: 800,
      height: 600,
      toDataURL: vi.fn((mimeType: string, quality?: number) => {
        return `data:${mimeType};base64,mockbase64data${quality || ''}`;
      }),
      getContext: vi.fn((type: string) => {
        if (type === '2d') return mockContext;
        return null;
      }),
      remove: vi.fn(),
    } as unknown as HTMLCanvasElement;
  });

  describe('captureCanvasScreenshot - Scaling Branches', () => {
    it('should handle scale=2 with proper canvas setup', () => {
      // Mock createElement to return properly configured canvas
      const mockScaledCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockContext;
          return null;
        }),
        toDataURL: vi.fn(() => 'data:image/png;base64,scaled'),
        remove: vi.fn(),
      } as unknown as HTMLCanvasElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockScaledCanvas;
        }
        return document.createElement(tag);
      });

      const options: ScreenshotOptions = {
        format: 'png',
        quality: 0.92,
        scale: 2,
      };

      const result = captureCanvasScreenshot(mockCanvas, options);

      expect(mockScaledCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(mockScaledCanvas.remove).toHaveBeenCalled();
      expect(result).toContain('scaled');

      createElementSpy.mockRestore();
    });

    it('should set canvas dimensions correctly for scaled capture', () => {
      const mockScaledCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
        toDataURL: vi.fn(() => 'data:image/png;base64,scaled'),
        remove: vi.fn(),
      } as unknown as HTMLCanvasElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockScaledCanvas;
        }
        return document.createElement(tag);
      });

      const options: ScreenshotOptions = {
        format: 'jpeg',
        quality: 0.8,
        scale: 3,
      };

      captureCanvasScreenshot(mockCanvas, options);

      // Scaled dimensions should be 800*3 x 600*3
      expect(mockScaledCanvas.width).toBe(2400);
      expect(mockScaledCanvas.height).toBe(1800);

      createElementSpy.mockRestore();
    });

    it('should configure image smoothing for scaled canvas', () => {
      const mockScaledCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
        toDataURL: vi.fn(() => 'data:image/png;base64,scaled'),
        remove: vi.fn(),
      } as unknown as HTMLCanvasElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockScaledCanvas;
        }
        return document.createElement(tag);
      });

      const options: ScreenshotOptions = {
        format: 'png',
        quality: 1,
        scale: 2,
      };

      captureCanvasScreenshot(mockCanvas, options);

      expect(mockContext.imageSmoothingEnabled).toBe(true);
      expect(mockContext.imageSmoothingQuality).toBe('high');

      createElementSpy.mockRestore();
    });

    it('should throw error when canvas 2d context is not available', () => {
      const badCanvas = {
        width: 800,
        height: 600,
        toDataURL: vi.fn(() => 'data:image/png;base64,test'),
        getContext: vi.fn(() => null), // Returns null for 2d context
      } as unknown as HTMLCanvasElement;

      const mockScaledCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => null), // Always null
        toDataURL: vi.fn(),
        remove: vi.fn(),
      } as unknown as HTMLCanvasElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockScaledCanvas;
        }
        return document.createElement(tag);
      });

      const options: ScreenshotOptions = {
        format: 'png',
        quality: 0.92,
        scale: 2,
      };

      expect(() => captureCanvasScreenshot(badCanvas, options)).toThrow(
        'Failed to get 2D context for screenshot canvas'
      );

      createElementSpy.mockRestore();
    });
  });

  describe('addMetadataOverlay - Context Handling', () => {
    it('should handle canvas with no 2d context gracefully', () => {
      const badCanvas = {
        width: 800,
        height: 600,
        getContext: vi.fn(() => null),
      } as unknown as HTMLCanvasElement;

      const mockScaledCanvas = {
        width: 800,
        height: 600,
        getContext: vi.fn(() => null),
        remove: vi.fn(),
      } as unknown as HTMLCanvasElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockScaledCanvas as unknown as HTMLElement);

      const metadata: ScreenshotMetadata = {
        timestamp: '2024-01-15T10:30:00Z',
        designId: 'test-123',
      };

      const result = addMetadataOverlay(badCanvas, metadata);

      // Should return original canvas when context fails
      expect(result).toBe(badCanvas);

      createElementSpy.mockRestore();
    });

    it('should draw metadata overlay with all view settings enabled', () => {
      const mockScaledCanvas = {
        width: 800,
        height: 600,
        getContext: vi.fn(() => mockContext),
        remove: vi.fn(),
      } as unknown as HTMLCanvasElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockScaledCanvas as unknown as HTMLElement);

      const metadata: ScreenshotMetadata = {
        timestamp: '2024-01-15T10:30:00Z',
        designId: 'design-A',
        viewSettings: {
          showStress: true,
          showWireframe: true,
          showCrossSection: true,
          visibleLayers: [1, 2, 3, 4, 5],
        },
      };

      addMetadataOverlay(mockCanvas, metadata);

      // Should have called context methods for drawing
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockCanvas, 0, 0);
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    it('should handle metadata with only timestamp', () => {
      const mockScaledCanvas = {
        width: 800,
        height: 600,
        getContext: vi.fn(() => mockContext),
        remove: vi.fn(),
      } as unknown as HTMLCanvasElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockScaledCanvas as unknown as HTMLElement);

      const metadata: ScreenshotMetadata = {
        timestamp: '2024-01-15T10:30:00Z',
      };

      const result = addMetadataOverlay(mockCanvas, metadata);

      expect(result).toBeDefined();
      expect(mockContext.fillText).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    it('should position metadata overlay correctly', () => {
      const mockScaledCanvas = {
        width: 800,
        height: 600,
        getContext: vi.fn(() => mockContext),
        remove: vi.fn(),
      } as unknown as HTMLCanvasElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockScaledCanvas as unknown as HTMLElement);

      const metadata: ScreenshotMetadata = {
        timestamp: '2024-01-15T10:30:00Z',
        designId: 'test-design',
      };

      addMetadataOverlay(mockCanvas, metadata);

      // fillRect should be called for background
      expect(mockContext.fillRect).toHaveBeenCalledWith(
        expect.any(Number),
        10,
        expect.any(Number),
        expect.any(Number)
      );

      createElementSpy.mockRestore();
    });
  });

  describe('dataUrlToBlob - Async Conversion', () => {
    it('should convert valid data URL to blob', async () => {
      const mockBlob = new Blob(['test data'], { type: 'image/png' });
      const fetchSpy = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });
      global.fetch = fetchSpy;

      const result = await dataUrlToBlob('data:image/png;base64,test');

      expect(fetchSpy).toHaveBeenCalledWith('data:image/png;base64,test');
      expect(result).toBe(mockBlob);
    });

    it('should handle different image formats', async () => {
      const mockBlob = new Blob(['jpeg data'], { type: 'image/jpeg' });
      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      const result = await dataUrlToBlob('data:image/jpeg;base64,jpegtest');

      expect(result.type).toBe('image/jpeg');
    });

    it('should handle WebP format', async () => {
      const mockBlob = new Blob(['webp data'], { type: 'image/webp' });
      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      const result = await dataUrlToBlob('data:image/webp;base64,webptest');

      expect(result.type).toBe('image/webp');
    });
  });

  describe('isWebPSupported - Browser Detection', () => {
    it('should detect WebP support correctly', async () => {
      const mockCanvas = {
        width: 1,
        height: 1,
        toDataURL: vi.fn((type: string) => {
          return type === 'image/webp' ? 'data:image/webp;base64,test' : 'data:image/png;base64,test';
        }),
      } as unknown as HTMLCanvasElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLElement);

      const result = await isWebPSupported();

      expect(typeof result).toBe('boolean');

      createElementSpy.mockRestore();
    });

    it('should return false when canvas creation fails', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('Canvas creation failed');
      });

      const result = await isWebPSupported();

      expect(result).toBe(false);

      createElementSpy.mockRestore();
    });

    it('should return false when toDataURL fails', async () => {
      const mockCanvas = {
        width: 1,
        height: 1,
        toDataURL: vi.fn(() => {
          throw new Error('toDataURL failed');
        }),
      } as unknown as HTMLCanvasElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLElement);

      const result = await isWebPSupported();

      expect(result).toBe(false);

      createElementSpy.mockRestore();
    });
  });

  describe('downloadScreenshot - Edge Cases', () => {
    it('should handle various data URL formats', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      const longDataUrl = `data:image/png;base64,${'A'.repeat(10000)}`;
      downloadScreenshot(longDataUrl, 'large-image.png');

      expect(mockLink.href).toBe(longDataUrl);
      expect(mockLink.download).toBe('large-image.png');
      expect(mockLink.click).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should handle very long filenames', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      const longFilename = `${'very-long-design-name-'.repeat(10)}.png`;
      downloadScreenshot('data:image/png;base64,test', longFilename);

      expect(mockLink.download).toBe(longFilename);
      expect(mockLink.click).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('captureAndDownloadScreenshot - Integration', () => {
    it('should handle capture errors gracefully', () => {
      const badCanvas = {
        width: 800,
        height: 600,
        toDataURL: vi.fn(() => {
          throw new Error('Canvas error');
        }),
        getContext: vi.fn(() => null),
      } as unknown as HTMLCanvasElement;

      const options: ScreenshotOptions = {
        format: 'png',
        quality: 0.92,
        scale: 1,
      };

      expect(() => captureAndDownloadScreenshot(badCanvas, options)).toThrow('Canvas error');
    });

    it('should capture screenshot with custom filename and format', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      const options: ScreenshotOptions = {
        format: 'webp',
        quality: 0.95,
        scale: 1,
        filename: 'custom-design.webp',
      };

      captureAndDownloadScreenshot(mockCanvas, options);

      expect(mockLink.download).toBe('custom-design.webp');
      expect(mockLink.click).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
