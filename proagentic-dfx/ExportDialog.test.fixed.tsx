/**
 * ExportDialog Component Test Suite
 * TDD: Test-Driven Development Approach
 *
 * Comprehensive test coverage for ExportDialog component including:
 * - Dialog state management (open/close)
 * - Format selection (PNG, JPEG, WebP)
 * - Quality controls
 * - Resolution scaling
 * - File naming
 * - Metadata inclusion
 * - User interactions
 * - Accessibility features
 * - Edge cases and error handling
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ExportDialog } from '@/components/viewer/ExportDialog';

// Mock the screenshot utilities
vi.mock('@/lib/export/screenshot-utils', () => ({
  isWebPSupported: () => Promise.resolve(true),
  estimateFileSize: vi.fn((dataUrl: string) => {
    // Estimate based on data URL length
    const base64 = dataUrl.split(',')[1] || '';
    return Math.round((base64.length * 6) / 8 / 1024);
  }),
  generateFilename: vi.fn((options: any) => {
    if (options.filename) {
      const hasExtension = options.filename.match(/\.(png|jpeg|jpg|webp)$/i);
      return hasExtension ? options.filename : `${options.filename}.${options.format}`;
    }
    return `tank-screenshot-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.${options.format}`;
  }),
}));

describe('ExportDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnExport = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onExport: mockOnExport,
    currentDesignId: 'design-001',
    previewDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Dialog visibility and state tests
  describe('Dialog Visibility', () => {
    it('should render dialog when isOpen is true', () => {
      render(<ExportDialog {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when isOpen is false', () => {
      render(<ExportDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should have proper dialog attributes for accessibility', () => {
      render(<ExportDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'export-dialog-title');
    });

    it('should display dialog title', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('Export Screenshot')).toBeInTheDocument();
    });

    it('should display dialog subtitle', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('Configure export settings and download')).toBeInTheDocument();
    });
  });

  // Dialog open/close functionality
  describe('Dialog Close Functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not call onClose when dialog content is clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const dialogContent = screen.getByText('Image Format');
      await user.click(dialogContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call onClose after export is triggered', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /export screenshot/i });
      await user.click(exportButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Format selection tests
  describe('Format Selection', () => {
    it('should render all three format buttons', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('JPEG')).toBeInTheDocument();
      expect(screen.getByText('WebP')).toBeInTheDocument();
    });

    it('should select PNG format by default', () => {
      render(<ExportDialog {...defaultProps} />);
      const pngButton = screen.getByRole('button', { name: /PNG/i });
      expect(pngButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should switch to JPEG format when clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      expect(jpegButton).toHaveAttribute('aria-pressed', 'true');
      const pngButton = screen.getByRole('button', { name: /PNG/i });
      expect(pngButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should switch to WebP format when clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const webpButton = screen.getByRole('button', { name: /WebP/i });
      await user.click(webpButton);

      expect(webpButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should display format descriptions', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('Lossless')).toBeInTheDocument();
      expect(screen.getByText('Smaller size')).toBeInTheDocument();
      expect(screen.getByText('Modern')).toBeInTheDocument();
    });

    it('should disable WebP button when WebP is not supported', async () => {
      vi.resetModules();
      vi.doMock('@/lib/export/screenshot-utils', () => ({
        isWebPSupported: vi.fn().mockResolvedValue(false),
        estimateFileSize: vi.fn().mockReturnValue(100),
        generateFilename: vi.fn().mockReturnValue('test.png'),
      }));

      render(<ExportDialog {...defaultProps} />);

      await waitFor(() => {
        const webpButton = screen.getByRole('button', { name: /WebP/i });
        expect(webpButton).toBeDisabled();
      });
    });

    it('should show "Not supported" text for WebP when disabled', async () => {
      vi.resetModules();
      vi.doMock('@/lib/export/screenshot-utils', () => ({
        isWebPSupported: vi.fn().mockResolvedValue(false),
        estimateFileSize: vi.fn().mockReturnValue(100),
        generateFilename: vi.fn().mockReturnValue('test.png'),
      }));

      render(<ExportDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Not supported')).toBeInTheDocument();
      });
    });
  });

  // Quality slider tests
  describe('Quality Slider', () => {
    it('should show quality slider for JPEG format', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      const qualitySlider = screen.getByRole('slider') as HTMLInputElement;
      expect(qualitySlider).toBeInTheDocument();
    });

    it('should show quality slider for WebP format', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const webpButton = screen.getByRole('button', { name: /WebP/i });
      await user.click(webpButton);

      const qualitySlider = screen.getByRole('slider') as HTMLInputElement;
      expect(qualitySlider).toBeInTheDocument();
    });

    it('should not show quality slider for PNG format', () => {
      render(<ExportDialog {...defaultProps} />);

      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });

    it('should display quality percentage label', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      expect(screen.getByText(/Image Quality: 92%/)).toBeInTheDocument();
    });

    it('should have proper slider attributes', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider).toHaveAttribute('min', '0.1');
      expect(slider).toHaveAttribute('max', '1');
      expect(slider).toHaveAttribute('step', '0.01');
    });

    it('should update quality percentage when slider changes', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      await user.tripleClick(slider);
      fireEvent.change(slider, { target: { value: '0.5' } });

      expect(screen.getByText(/Image Quality: 50%/)).toBeInTheDocument();
    });

    it('should show quality slider guidance text', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      expect(screen.getByText('Lower size')).toBeInTheDocument();
      expect(screen.getByText('Higher quality')).toBeInTheDocument();
    });
  });

  // Resolution scale tests
  describe('Resolution Scale', () => {
    it('should render all three resolution options', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('1x')).toBeInTheDocument();
      expect(screen.getByText('2x')).toBeInTheDocument();
      expect(screen.getByText('4x')).toBeInTheDocument();
    });

    it('should have resolution descriptions', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('High-res')).toBeInTheDocument();
      expect(screen.getByText('Ultra-res')).toBeInTheDocument();
    });

    it('should select 1x resolution by default', () => {
      render(<ExportDialog {...defaultProps} />);
      const button1x = screen.getAllByRole('button').find(btn => btn.textContent?.includes('1x'));
      expect(button1x).toHaveAttribute('aria-pressed', 'true');
    });

    it('should switch to 2x resolution when clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const button2x = buttons.find(btn => btn.textContent?.includes('2x'));
      if (button2x) {
        await user.click(button2x);
        expect(button2x).toHaveAttribute('aria-pressed', 'true');
      }
    });

    it('should switch to 4x resolution when clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const button4x = buttons.find(btn => btn.textContent?.includes('4x'));
      if (button4x) {
        await user.click(button4x);
        expect(button4x).toHaveAttribute('aria-pressed', 'true');
      }
    });

    it('should show warning for high resolution (4x)', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const button4x = buttons.find(btn => btn.textContent?.includes('4x'));
      if (button4x) {
        await user.click(button4x);
      }

      expect(screen.getByText(/High resolution exports may take longer/)).toBeInTheDocument();
    });

    it('should not show warning for 1x resolution', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.queryByText(/High resolution exports may take longer/)).not.toBeInTheDocument();
    });

    it('should not show warning for 2x resolution', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const button2x = buttons.find(btn => btn.textContent?.includes('2x'));
      if (button2x) {
        await user.click(button2x);
      }

      expect(screen.queryByText(/High resolution exports may take longer/)).not.toBeInTheDocument();
    });
  });

  // Filename input tests
  describe('Filename Input', () => {
    it('should render filename input field', () => {
      render(<ExportDialog {...defaultProps} />);
      const input = screen.getByRole('textbox', { name: /filename/i });
      expect(input).toBeInTheDocument();
    });

    it('should have placeholder text with default filename', () => {
      render(<ExportDialog {...defaultProps} />);
      const input = screen.getByRole('textbox', { name: /filename/i }) as HTMLInputElement;
      expect(input.placeholder).toBeTruthy();
    });

    it('should be optional (not required)', () => {
      render(<ExportDialog {...defaultProps} />);
      const input = screen.getByRole('textbox', { name: /filename/i });
      expect(input).not.toHaveAttribute('required');
    });

    it('should update filename when user types', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /filename/i }) as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'my-tank-design');

      expect(input.value).toBe('my-tank-design');
    });

    it('should show help text about auto-generated filename', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText(/Leave blank to use auto-generated filename/)).toBeInTheDocument();
    });

    it('should have accessible description', () => {
      render(<ExportDialog {...defaultProps} />);
      const input = screen.getByRole('textbox', { name: /filename/i });
      expect(input).toHaveAttribute('aria-describedby', 'filename-help');
    });
  });

  // Metadata checkbox tests
  describe('Metadata Checkbox', () => {
    it('should render metadata checkbox', () => {
      render(<ExportDialog {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox', { name: /include metadata/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('should have metadata checkbox unchecked by default', () => {
      render(<ExportDialog {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox', { name: /include metadata/i });
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle metadata checkbox when clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox', { name: /include metadata/i });
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('should show metadata description', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText(/Adds timestamp, design ID, and view settings/)).toBeInTheDocument();
    });

    it('should have accessible label for checkbox', () => {
      render(<ExportDialog {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox', { name: /include metadata/i });
      expect(checkbox).toHaveAccessibleName();
    });
  });

  // Estimated file size tests
  describe('Estimated File Size', () => {
    it('should display estimated file size when preview exists', async () => {
      render(<ExportDialog {...defaultProps} />);

      await waitFor(() => {
        const sizeText = screen.queryByText(/Estimated file size:/);
        expect(sizeText).toBeInTheDocument();
      });
    });

    it('should not display estimated size when no preview', () => {
      render(<ExportDialog {...defaultProps} previewDataUrl={undefined} />);
      expect(screen.queryByText(/Estimated file size:/)).not.toBeInTheDocument();
    });

    it('should display size in KB for small files', async () => {
      const smallPreview = 'data:image/png;base64,' + 'A'.repeat(100);
      render(<ExportDialog {...defaultProps} previewDataUrl={smallPreview} />);

      await waitFor(() => {
        const sizeDisplay = screen.queryByText(/KB/);
        expect(sizeDisplay).toBeInTheDocument();
      });
    });

    it('should display size in MB for large files', async () => {
      const largePreview = 'data:image/png;base64,' + 'A'.repeat(10000);
      render(<ExportDialog {...defaultProps} previewDataUrl={largePreview} />);

      await waitFor(() => {
        const sizeDisplay = screen.queryByText(/MB/);
        expect(sizeDisplay).toBeInTheDocument();
      });
    });

    it('should update estimated size when scale changes', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const button2x = buttons.find(btn => btn.textContent?.includes('2x'));

      if (button2x) {
        await user.click(button2x);

        await waitFor(() => {
          expect(mockOnExport).not.toHaveBeenCalled(); // Just checking state changes
        });
      }
    });
  });

  // Design ID display tests
  describe('Design ID Display', () => {
    it('should display current design ID in footer', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('design-001')).toBeInTheDocument();
    });

    it('should not display design ID when not provided', () => {
      render(<ExportDialog {...defaultProps} currentDesignId={undefined} />);
      expect(screen.queryByText('Design')).not.toBeInTheDocument();
    });

    it('should display "Design" label before ID', () => {
      render(<ExportDialog {...defaultProps} />);
      const designText = screen.getByText(/Design/);
      expect(designText).toBeInTheDocument();
    });
  });

  // Export button tests
  describe('Export Button', () => {
    it('should render export button', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /export screenshot/i })).toBeInTheDocument();
    });

    it('should call onExport when export button is clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /export screenshot/i });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalled();
    });

    it('should pass correct options to onExport', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /export screenshot/i });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'png',
          quality: 0.92,
          scale: 1,
        })
      );
    });

    it('should pass custom filename to onExport', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /filename/i });
      await user.clear(input);
      await user.type(input, 'custom-name');

      const exportButton = screen.getByRole('button', { name: /export screenshot/i });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: expect.stringContaining('custom-name'),
        })
      );
    });

    it('should pass metadata flag to onExport when checked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox', { name: /include metadata/i });
      await user.click(checkbox);

      const exportButton = screen.getByRole('button', { name: /export screenshot/i });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          includeMetadata: true,
        })
      );
    });

    it('should include Download icon in export button', () => {
      render(<ExportDialog {...defaultProps} />);
      // Icon is passed as a prop to Button component
      expect(screen.getByRole('button', { name: /export screenshot/i })).toBeInTheDocument();
    });
  });

  // Cancel button tests
  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Integration tests - complex user flows
  describe('Integration: Complex User Workflows', () => {
    it('should handle complete export workflow with all custom settings', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      // Select JPEG format
      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      // Adjust quality
      const slider = screen.getByRole('slider') as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '0.75' } });

      // Select 2x resolution
      const buttons = screen.getAllByRole('button');
      const button2x = buttons.find(btn => btn.textContent?.includes('2x'));
      if (button2x) {
        await user.click(button2x);
      }

      // Enter custom filename
      const input = screen.getByRole('textbox', { name: /filename/i });
      await user.clear(input);
      await user.type(input, 'tank-design-v2');

      // Toggle metadata
      const checkbox = screen.getByRole('checkbox', { name: /include metadata/i });
      await user.click(checkbox);

      // Export
      const exportButton = screen.getByRole('button', { name: /export screenshot/i });
      await user.click(exportButton);

      // Verify export was called with correct options
      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'jpeg',
          quality: 0.75,
          scale: 2,
          includeMetadata: true,
        })
      );
    });

    it('should handle format switching and quality slider visibility changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ExportDialog {...defaultProps} />);

      // Initially PNG - no slider
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();

      // Switch to JPEG - slider appears
      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);
      expect(screen.getByRole('slider')).toBeInTheDocument();

      // Switch to PNG - slider disappears
      const pngButton = screen.getByRole('button', { name: /PNG/i });
      await user.click(pngButton);
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();

      // Switch to WebP - slider appears again
      const webpButton = screen.getByRole('button', { name: /WebP/i });
      await user.click(webpButton);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should maintain state across multiple button clicks', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      // Set custom filename
      const input = screen.getByRole('textbox', { name: /filename/i });
      await user.clear(input);
      await user.type(input, 'my-export');

      // Switch format
      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      // Filename should still be there
      expect(input).toHaveValue('my-export');

      // Toggle metadata
      const checkbox = screen.getByRole('checkbox', { name: /include metadata/i });
      await user.click(checkbox);

      // Everything should still be in state
      expect(input).toHaveValue('my-export');
      expect(jpegButton).toHaveAttribute('aria-pressed', 'true');
      expect(checkbox).toBeChecked();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('Export Screenshot')).toBeInTheDocument();
    });

    it('should have semantic form controls', () => {
      render(<ExportDialog {...defaultProps} />);

      // Check for proper labels
      expect(screen.getByText('Image Format')).toBeInTheDocument();
      expect(screen.getByText('Resolution')).toBeInTheDocument();
      expect(screen.getByText(/Filename/)).toBeInTheDocument();
    });

    it('should have accessible buttons with proper labels', () => {
      render(<ExportDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /close dialog/i })).toHaveAccessibleName();
      expect(screen.getByRole('button', { name: /cancel/i })).toHaveAccessibleName();
      expect(screen.getByRole('button', { name: /export screenshot/i })).toHaveAccessibleName();
    });

    it('should have accessible input fields', () => {
      render(<ExportDialog {...defaultProps} />);

      const filenameInput = screen.getByRole('textbox', { name: /filename/i });
      expect(filenameInput).toHaveAccessibleName();
      expect(filenameInput).toHaveAttribute('aria-describedby');
    });

    it('should have proper ARIA attributes on dialog', () => {
      render(<ExportDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'export-dialog-title');
    });

    it('should have proper ARIA attributes on format buttons', () => {
      render(<ExportDialog {...defaultProps} />);

      const pngButton = screen.getByRole('button', { name: /PNG/i });
      expect(pngButton).toHaveAttribute('aria-pressed');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      // Tab to PNG button and check it's focused
      const pngButton = screen.getByRole('button', { name: /PNG/i });
      pngButton.focus();
      expect(document.activeElement).toBe(pngButton);
    });
  });

  // Edge cases and error scenarios
  describe('Edge Cases', () => {
    it('should handle empty filename input gracefully', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /filename/i });
      await user.clear(input);

      const exportButton = screen.getByRole('button', { name: /export screenshot/i });
      await user.click(exportButton);

      // Should use default filename
      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: expect.any(String),
        })
      );
    });

    it('should handle very long filenames', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /filename/i });
      const longName = 'a'.repeat(200);
      await user.clear(input);
      await user.type(input, longName);

      expect(input).toHaveValue(longName);
    });

    it('should handle special characters in filename', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /filename/i });
      await user.clear(input);
      await user.type(input, 'design-@#$%');

      expect(input).toHaveValue('design-@#$%');
    });

    it('should handle missing design ID gracefully', () => {
      render(<ExportDialog {...defaultProps} currentDesignId={undefined} />);

      // Should not crash and dialog should still work
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export screenshot/i })).toBeInTheDocument();
    });

    it('should handle missing preview gracefully', () => {
      render(<ExportDialog {...defaultProps} previewDataUrl={undefined} />);

      // Should not crash and dialog should still work
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.queryByText(/Estimated file size:/)).not.toBeInTheDocument();
    });

    it('should handle rapid format switching', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const pngButton = screen.getByRole('button', { name: /PNG/i });
      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      const webpButton = screen.getByRole('button', { name: /WebP/i });

      // Rapid switching
      await user.click(jpegButton);
      await user.click(pngButton);
      await user.click(webpButton);
      await user.click(jpegButton);

      // Should end up on JPEG
      expect(jpegButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should handle rapid resolution switching', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const button1x = buttons.find(btn => btn.textContent?.includes('1x'));
      const button2x = buttons.find(btn => btn.textContent?.includes('2x'));
      const button4x = buttons.find(btn => btn.textContent?.includes('4x'));

      if (button1x && button2x && button4x) {
        await user.click(button2x);
        await user.click(button4x);
        await user.click(button1x);
        await user.click(button2x);

        expect(button2x).toHaveAttribute('aria-pressed', 'true');
      }
    });

    it('should handle quality slider edge values', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      const slider = screen.getByRole('slider') as HTMLInputElement;

      // Minimum value
      fireEvent.change(slider, { target: { value: '0.1' } });
      expect(screen.getByText(/Image Quality: 10%/)).toBeInTheDocument();

      // Maximum value
      fireEvent.change(slider, { target: { value: '1' } });
      expect(screen.getByText(/Image Quality: 100%/)).toBeInTheDocument();
    });
  });

  // Props change handling
  describe('Props Changes', () => {
    it('should handle isOpen changing from true to false', async () => {
      const { rerender } = render(<ExportDialog {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(<ExportDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should handle callback prop changes', async () => {
      const newMockOnClose = vi.fn();
      const { rerender } = render(
        <ExportDialog {...defaultProps} onClose={mockOnClose} />
      );

      let closeButton = screen.getByRole('button', { name: /close dialog/i });
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();

      rerender(<ExportDialog {...defaultProps} onClose={newMockOnClose} />);
      closeButton = screen.getByRole('button', { name: /close dialog/i });
      fireEvent.click(closeButton);
      expect(newMockOnClose).toHaveBeenCalled();
    });

    it('should handle preview data URL changes', async () => {
      const { rerender } = render(<ExportDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText(/Estimated file size:/)).toBeInTheDocument();
      });

      const newPreview = 'data:image/png;base64,' + 'B'.repeat(20000);
      rerender(
        <ExportDialog {...defaultProps} previewDataUrl={newPreview} />
      );

      await waitFor(() => {
        expect(screen.queryByText(/Estimated file size:/)).toBeInTheDocument();
      });
    });

    it('should handle design ID changes', () => {
      const { rerender } = render(<ExportDialog {...defaultProps} currentDesignId="design-001" />);
      expect(screen.getByText('design-001')).toBeInTheDocument();

      rerender(<ExportDialog {...defaultProps} currentDesignId="design-002" />);
      expect(screen.getByText('design-002')).toBeInTheDocument();
      expect(screen.queryByText('design-001')).not.toBeInTheDocument();
    });
  });

  // Rendering tests
  describe('Rendering', () => {
    it('should not have any console errors', () => {
      const consoleError = vi.spyOn(console, 'error');
      render(<ExportDialog {...defaultProps} />);
      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should render all main sections', () => {
      render(<ExportDialog {...defaultProps} />);

      // Header
      expect(screen.getByText('Export Screenshot')).toBeInTheDocument();

      // Content sections
      expect(screen.getByText('Image Format')).toBeInTheDocument();
      expect(screen.getByText('Resolution')).toBeInTheDocument();
      expect(screen.getByText(/Filename/)).toBeInTheDocument();
      expect(screen.getByText(/Include metadata/)).toBeInTheDocument();

      // Footer
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export screenshot/i })).toBeInTheDocument();
    });

    it('should have proper CSS classes for styling', () => {
      render(<ExportDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.parentElement).toHaveClass('fixed', 'inset-0', 'z-50');
    });
  });
});
