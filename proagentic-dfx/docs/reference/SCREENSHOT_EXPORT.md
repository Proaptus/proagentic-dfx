---
title: Screenshot Export Feature
category: reference
tags: [export, screenshot, 3d-viewer, cad]
related:
  - EXPORT_API.md
  - CAD_VIEWER.md
last_updated: 2025-12-09
---

# Screenshot Export Feature

## Overview

The screenshot export feature enables users to capture high-quality images of the 3D CAD tank viewer with configurable format, quality, and resolution options.

## Features

### Export Formats
- **PNG**: Lossless format, best for detailed technical images
- **JPEG**: Lossy compression, smaller file sizes
- **WebP**: Modern format with better compression (when browser supported)

### Quality Options
- Quality slider (10-100%) for JPEG and WebP
- Automatic quality selection for PNG (always lossless)

### Resolution Scaling
- **1x**: Standard resolution (current canvas size)
- **2x**: High resolution (2x width and height)
- **4x**: Ultra-high resolution (4x width and height)

### Additional Options
- Custom filename support
- Automatic filename generation with timestamp
- Optional metadata overlay (timestamp, design ID, view settings)
- File size estimation before export

## Implementation

### Core Files

1. **src/lib/export/screenshot-utils.ts**
   - Core screenshot capture and download utilities
   - Format conversion and scaling logic
   - Metadata overlay support
   - File size estimation

2. **src/components/viewer/ExportDialog.tsx**
   - Professional export configuration dialog
   - Format, quality, and resolution controls
   - Real-time preview and size estimation
   - Accessible UI with WCAG 2.1 AA compliance

3. **src/components/screens/ViewerScreen.tsx**
   - Export button integration in toolbar
   - Dialog state management
   - Canvas access and export coordination

### API Reference

#### `captureCanvasScreenshot()`

Captures a screenshot from an HTML canvas element.

```typescript
function captureCanvasScreenshot(
  canvas: HTMLCanvasElement,
  options: ScreenshotOptions
): string
```

**Parameters:**
- `canvas`: The canvas element to capture
- `options`: Screenshot configuration options

**Returns:** Data URL of the captured image

**Example:**
```typescript
const dataUrl = captureCanvasScreenshot(canvas, {
  format: 'png',
  quality: 0.92,
  scale: 2,
  filename: 'my-tank-design'
});
```

#### `downloadScreenshot()`

Downloads a screenshot from a data URL.

```typescript
function downloadScreenshot(
  dataUrl: string,
  filename: string
): void
```

**Example:**
```typescript
downloadScreenshot(dataUrl, 'tank-design.png');
```

#### `captureAndDownloadScreenshot()`

Convenience function that captures and immediately downloads.

```typescript
function captureAndDownloadScreenshot(
  canvas: HTMLCanvasElement,
  options: ScreenshotOptions
): void
```

**Example:**
```typescript
captureAndDownloadScreenshot(canvas, {
  format: 'jpeg',
  quality: 0.85,
  scale: 1,
  filename: 'design-A'
});
```

#### Types

```typescript
interface ScreenshotOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number;      // 0-1 for jpeg/webp
  scale: number;        // 1, 2, or 4
  filename?: string;
  includeMetadata?: boolean;
}

interface ScreenshotMetadata {
  timestamp: string;
  designId?: string;
  viewSettings?: {
    showStress?: boolean;
    showWireframe?: boolean;
    showCrossSection?: boolean;
    visibleLayers?: number[];
  };
}
```

## Usage

### Basic Export

1. Click the "Export" button in the 3D Viewer toolbar
2. Select desired format (PNG, JPEG, or WebP)
3. Adjust quality slider (if applicable)
4. Choose resolution (1x, 2x, or 4x)
5. Optionally enter a custom filename
6. Click "Export Screenshot" to download

### With Metadata

Enable "Include metadata overlay" to add:
- Capture timestamp
- Design identifier
- Active view settings (stress, wireframe, cross-section)

### Programmatic Export

```typescript
// Get canvas element
const canvas = document.querySelector('canvas') as HTMLCanvasElement;

// Export with specific options
captureAndDownloadScreenshot(canvas, {
  format: 'png',
  quality: 0.92,
  scale: 2,
  filename: 'design-C-stress-view',
  includeMetadata: true
});
```

## Performance Considerations

### Resolution Scaling

- **1x**: Instant capture, smallest file size
- **2x**: ~4x larger file, slight processing delay
- **4x**: ~16x larger file, noticeable processing delay

### Format Comparison

| Format | Compression | Quality | File Size | Browser Support |
|--------|-------------|---------|-----------|-----------------|
| PNG    | Lossless    | Best    | Large     | 100%            |
| JPEG   | Lossy       | Good    | Medium    | 100%            |
| WebP   | Lossy       | Good    | Small     | ~96%            |

### Recommended Settings

**For documentation:**
- Format: PNG
- Scale: 2x
- Metadata: Enabled

**For sharing:**
- Format: JPEG or WebP
- Quality: 85-92%
- Scale: 1x or 2x

**For printing:**
- Format: PNG
- Scale: 4x
- Metadata: Disabled

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ WebP may not be supported in older browsers

The implementation automatically detects WebP support and disables the option if unavailable.

## Accessibility

- Keyboard accessible dialog controls
- ARIA labels and roles
- Focus management
- Screen reader friendly
- High contrast compatible

## Testing

Comprehensive test suite in `src/__tests__/lib/export/screenshot-utils.test.ts`:

- ✅ Filename generation
- ✅ File size estimation
- ✅ Format conversion
- ✅ Resolution scaling
- ✅ Download triggering
- ✅ WebP support detection

Run tests:
```bash
npm run test -- screenshot-utils.test.ts
```

## Future Enhancements

### Planned Features
- [ ] Batch export (multiple views)
- [ ] Export animation frames
- [ ] Custom watermarks
- [ ] Export to clipboard
- [ ] PDF export with multiple views
- [ ] Cloud storage integration

### Performance Improvements
- [ ] Web Workers for scaling
- [ ] Progressive rendering for 4x
- [ ] Client-side image compression
- [ ] Streaming large exports

## Related Documentation

- [Export API Reference](./EXPORT_API.md)
- [CAD Viewer Documentation](./CAD_VIEWER.md)
- [3D Visualization Guide](../howto/3D_VISUALIZATION.md)
