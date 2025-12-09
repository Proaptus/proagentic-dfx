'use client';

/**
 * Export Dialog Component
 * REQ-XXX: Screenshot export dialog with quality and format options
 *
 * Provides a professional dialog for configuring and exporting
 * 3D CAD viewer screenshots with various options.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Download, Image } from 'lucide-react';
import { isWebPSupported, estimateFileSize, generateFilename } from '@/lib/export/screenshot-utils';
import type { ScreenshotOptions } from '@/lib/export/screenshot-utils';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ScreenshotOptions) => void;
  currentDesignId?: string;
  previewDataUrl?: string;
}

export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  currentDesignId,
  previewDataUrl,
}: ExportDialogProps) {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(0.92);
  const [scale, setScale] = useState<number>(1);
  const [filename, setFilename] = useState<string>('');
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(false);
  const [webpSupported, setWebpSupported] = useState<boolean>(true);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);

  // Check WebP support on mount
  useEffect(() => {
    isWebPSupported().then(setWebpSupported);
  }, []);

  // Update estimated file size when preview changes
  useEffect(() => {
    if (previewDataUrl) {
      const size = estimateFileSize(previewDataUrl);
      // Adjust for scale (approximate)
      setEstimatedSize(Math.round(size * scale * scale));
    }
  }, [previewDataUrl, scale]);

  // Generate default filename
  const defaultFilename = generateFilename({
    format,
    quality: 0.92,
    scale: 1,
    filename: currentDesignId
  });

  const handleExport = () => {
    const options: ScreenshotOptions = {
      format,
      quality,
      scale,
      filename: filename || defaultFilename,
      includeMetadata,
    };

    onExport(options);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Image className="text-white" size={24} />
            </div>
            <div>
              <h2 id="export-dialog-title" className="text-xl font-bold text-white">
                Export Screenshot
              </h2>
              <p className="text-blue-100 text-sm">
                Configure export settings and download
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close dialog"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Image Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFormat('png')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  format === 'png'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                aria-pressed={format === 'png'}
              >
                <div className="font-semibold">PNG</div>
                <div className="text-xs mt-1">Lossless</div>
              </button>
              <button
                onClick={() => setFormat('jpeg')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  format === 'jpeg'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                aria-pressed={format === 'jpeg'}
              >
                <div className="font-semibold">JPEG</div>
                <div className="text-xs mt-1">Smaller size</div>
              </button>
              <button
                onClick={() => setFormat('webp')}
                disabled={!webpSupported}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  format === 'webp'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-pressed={format === 'webp'}
              >
                <div className="font-semibold">WebP</div>
                <div className="text-xs mt-1">
                  {webpSupported ? 'Modern' : 'Not supported'}
                </div>
              </button>
            </div>
          </div>

          {/* Quality Slider (for JPEG/WebP) */}
          {(format === 'jpeg' || format === 'webp') && (
            <div>
              <label htmlFor="quality-slider" className="block text-sm font-semibold text-gray-700 mb-3">
                Image Quality: {Math.round(quality * 100)}%
              </label>
              <input
                id="quality-slider"
                type="range"
                min="0.1"
                max="1"
                step="0.01"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                aria-valuemin={10}
                aria-valuemax={100}
                aria-valuenow={Math.round(quality * 100)}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Lower size</span>
                <span>Higher quality</span>
              </div>
            </div>
          )}

          {/* Resolution Scale */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Resolution
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 4].map((scaleValue) => (
                <button
                  key={scaleValue}
                  onClick={() => setScale(scaleValue)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    scale === scaleValue
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                  aria-pressed={scale === scaleValue}
                >
                  <div className="font-semibold">{scaleValue}x</div>
                  <div className="text-xs mt-1">
                    {scaleValue === 1 ? 'Standard' : scaleValue === 2 ? 'High-res' : 'Ultra-res'}
                  </div>
                </button>
              ))}
            </div>
            {scale > 2 && (
              <p className="text-xs text-amber-600 mt-2 flex items-start gap-1">
                <span>⚠</span>
                <span>High resolution exports may take longer to process</span>
              </p>
            )}
          </div>

          {/* Filename Input */}
          <div>
            <label htmlFor="filename-input" className="block text-sm font-semibold text-gray-700 mb-2">
              Filename (optional)
            </label>
            <input
              id="filename-input"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={defaultFilename}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              aria-describedby="filename-help"
            />
            <p id="filename-help" className="text-xs text-gray-500 mt-1">
              Leave blank to use auto-generated filename with timestamp
            </p>
          </div>

          {/* Metadata Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              id="metadata-checkbox"
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="metadata-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                Include metadata overlay
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Adds timestamp, design ID, and view settings to the image
              </p>
            </div>
          </div>

          {/* Estimated Size */}
          {estimatedSize > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-900">Estimated file size:</span>
              <span className="text-sm font-bold text-blue-700">
                {estimatedSize > 1024
                  ? `${(estimatedSize / 1024).toFixed(1)} MB`
                  : `${estimatedSize} KB`}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {currentDesignId && (
              <span>Design <strong>{currentDesignId}</strong></span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} icon={<Download size={16} />}>
              Export Screenshot
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
