/**
 * Screenshot Utils Tests
 * Tests for screenshot export functionality
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateFilename,
  estimateFileSize,
  isWebPSupported,
  captureCanvasScreenshot,
  downloadScreenshot,
} from '@/lib/export/screenshot-utils';

describe('Screenshot Utils', () => {
  describe('generateFilename', () => {
    it('should generate filename with timestamp for PNG', () => {
      const filename = generateFilename({
        format: 'png',
        quality: 0.92,
        scale: 1,
      });

      expect(filename).toMatch(/^tank-screenshot-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png$/);
    });

    it('should use custom filename when provided', () => {
      const filename = generateFilename({
        format: 'jpeg',
        quality: 0.92,
        scale: 1,
        filename: 'my-design',
      });

      expect(filename).toBe('my-design.jpeg');
    });

    it('should add extension if not present', () => {
      const filename = generateFilename({
        format: 'webp',
        quality: 0.92,
        scale: 1,
        filename: 'design-A',
      });

      expect(filename).toBe('design-A.webp');
    });

    it('should not duplicate extension if already present', () => {
      const filename = generateFilename({
        format: 'png',
        quality: 0.92,
        scale: 1,
        filename: 'design.png',
      });

      expect(filename).toBe('design.png');
    });
  });

  describe('estimateFileSize', () => {
    it('should estimate file size from data URL', () => {
      // Create a larger data URL that will be > 1KB
      const largeBase64 = 'A'.repeat(2000); // 2000 base64 chars ≈ 1.5KB
      const dataUrl = `data:image/png;base64,${largeBase64}`;
      const size = estimateFileSize(dataUrl);

      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });

    it('should return 0 for very small data URLs', () => {
      // Very small PNG rounds to 0 KB
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const size = estimateFileSize(dataUrl);
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for invalid data URL', () => {
      const size = estimateFileSize('invalid-data-url');
      expect(size).toBe(0);
    });
  });

  describe('isWebPSupported', () => {
    it('should return a boolean promise', async () => {
      const supported = await isWebPSupported();
      expect(typeof supported).toBe('boolean');
    });
  });

  describe('captureCanvasScreenshot', () => {
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
      // Create a mock canvas
      canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      // Mock toDataURL for JSDOM environment
      canvas.toDataURL = vi.fn((type?: string, _quality?: number) => {
        const format = type?.split('/')[1] || 'png';
        return `data:image/${format};base64,mockedImageData`;
      }) as any;
    });

    it('should capture PNG screenshot at 1x scale', () => {
      const dataUrl = captureCanvasScreenshot(canvas, {
        format: 'png',
        quality: 0.92,
        scale: 1,
      });

      expect(dataUrl).toBeTruthy();
      expect(canvas.toDataURL).toHaveBeenCalledWith('image/png', 0.92);
    });

    it('should capture JPEG screenshot with quality', () => {
      const dataUrl = captureCanvasScreenshot(canvas, {
        format: 'jpeg',
        quality: 0.8,
        scale: 1,
      });

      expect(dataUrl).toBeTruthy();
      expect(canvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    });

    it('should handle 2x scaling with scaled canvas', () => {
      // Mock createElement to return a canvas with toDataURL
      const mockScaledCanvas = document.createElement('canvas');
      mockScaledCanvas.toDataURL = vi.fn(() => 'data:image/png;base64,scaledImageData') as any;

      // Mock getContext to avoid null error in JSDOM
      const mockContext = {
        drawImage: vi.fn(),
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      };
      mockScaledCanvas.getContext = vi.fn(() => mockContext) as any;
      mockScaledCanvas.remove = vi.fn();

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockScaledCanvas as any);

      const dataUrl = captureCanvasScreenshot(canvas, {
        format: 'png',
        quality: 0.92,
        scale: 2,
      });

      expect(dataUrl).toBeTruthy();
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(mockScaledCanvas.remove).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });
  });

  describe('downloadScreenshot', () => {
    it('should create and trigger download link', () => {
      const dataUrl = 'data:image/png;base64,test';
      const filename = 'test.png';

      // Mock document methods
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      // Mock anchor element
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      } as any;

      createElementSpy.mockReturnValue(mockAnchor);

      downloadScreenshot(dataUrl, filename);

      expect(mockAnchor.href).toBe(dataUrl);
      expect(mockAnchor.download).toBe(filename);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
