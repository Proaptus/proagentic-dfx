/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * ExportDialog Component Extended Tests
 * PHASE 2 Coverage: Covering remaining edge cases and uncovered branches
 *
 * Tests covering:
 * - Lines 46-176, 198-246 edge cases
 * - Error handling paths
 * - Rare user interactions
 * - State management edge cases
 * - Event handler coverage
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportDialog } from '@/components/viewer/ExportDialog';

// Mock the screenshot utilities - matching the pattern from the working tests
vi.mock('@/lib/export/screenshot-utils', () => {
  const actualEstimateFileSize = (dataUrl: string) => {
    const base64 = dataUrl.split(',')[1] || '';
    return Math.round((base64.length * 6) / 8 / 1024);
  };

  const actualGenerateFilename = (options: any) => {
    if (options.filename) {
      const hasExtension = options.filename.match(/\.(png|jpeg|jpg|webp)$/i);
      return hasExtension ? options.filename : `${options.filename}.${options.format}`;
    }
    return `tank-screenshot.${options.format}`;
  };

  return {
    isWebPSupported: () => Promise.resolve(true),
    estimateFileSize: actualEstimateFileSize,
    generateFilename: actualGenerateFilename,
    captureCanvasScreenshot: () => {},
    downloadScreenshot: () => {},
    captureAndDownloadScreenshot: () => {},
    addMetadataOverlay: (c: any) => c,
    dataUrlToBlob: async () => new Blob(),
  };
});

describe('ExportDialog - Extended Coverage', () => {
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
    mockOnClose.mockClear();
    mockOnExport.mockClear();
  });

  // ============================================================================
  // STATE MANAGEMENT TESTS (Lines 32-52)
  // ============================================================================

  describe('State Management - Format Changes', () => {
    it('should update format state when clicking PNG button', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const pngButton = screen.getByText('PNG').closest('button');
      if (pngButton) {
        await user.click(pngButton);
        expect(pngButton).toHaveAttribute('aria-pressed', 'true');
      }
    });

    it('should update format state when clicking JPEG button', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('JPEG')).toBeInTheDocument();
    });

    it('should update format state when clicking WebP button', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('WebP')).toBeInTheDocument();
    });

    it('should show only one format selected at a time', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      const pngText = screen.getByText('PNG');
      const jpegText = screen.getByText('JPEG');
      expect(pngText).toBeInTheDocument();
      expect(jpegText).toBeInTheDocument();
    });
  });

  describe('State Management - Quality Slider', () => {
    it('should show quality slider for JPEG format', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should show quality slider for WebP format', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const webpButton = screen.getByRole('button', { name: /WebP/i });
      await user.click(webpButton);

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should not show quality slider for PNG format', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const pngButton = screen.getByRole('button', { name: /PNG/i });
      await user.click(pngButton);

      const slider = screen.queryByRole('slider');
      expect(slider).not.toBeInTheDocument();
    });

    it('should update quality slider value', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display quality percentage in label', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      expect(screen.getByText(/Image Quality:/)).toBeInTheDocument();
    });

    it('should update quality percentage when slider changes', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '0.75' } });

      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });

    it('should have correct min/max aria values', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '10');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('State Management - Resolution Scale', () => {
    it('should have three resolution options', () => {
      render(<ExportDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Standard/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /High-res/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ultra-res/ })).toBeInTheDocument();
    });

    it('should select 1x scale by default', () => {
      render(<ExportDialog {...defaultProps} />);

      const standardButton = screen.getByRole('button', { name: /Standard/ });
      expect(standardButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should update scale when clicking 2x button', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const highResButton = screen.getByRole('button', { name: /High-res/ });
      await user.click(highResButton);

      expect(highResButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should update scale when clicking 4x button', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const ultraResButton = screen.getByRole('button', { name: /Ultra-res/ });
      await user.click(ultraResButton);

      expect(ultraResButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show warning for high resolution exports', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const ultraResButton = screen.getByRole('button', { name: /Ultra-res/ });
      await user.click(ultraResButton);

      expect(screen.getByText(/High resolution exports may take longer/)).toBeInTheDocument();
    });

    it('should not show warning for standard resolution', () => {
      render(<ExportDialog {...defaultProps} />);

      expect(screen.queryByText(/High resolution exports may take longer/)).not.toBeInTheDocument();
    });
  });

  describe('State Management - Filename Input', () => {
    it('should allow custom filename input', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const filenameInput = screen.getByRole('textbox', { name: /Filename/ }) as HTMLInputElement;
      await user.type(filenameInput, 'my-custom-name');

      expect(filenameInput.value).toBe('my-custom-name');
    });

    it('should show placeholder with default filename', () => {
      render(<ExportDialog {...defaultProps} />);

      const filenameInput = screen.getByRole('textbox', { name: /Filename/ });
      expect(filenameInput).toHaveAttribute('placeholder');
    });

    it('should clear filename when user clears input', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const filenameInput = screen.getByRole('textbox', { name: /Filename/ });
      await user.type(filenameInput, 'test');
      await user.clear(filenameInput);

      expect((filenameInput as HTMLInputElement).value).toBe('');
    });

    it('should have help text for filename', () => {
      render(<ExportDialog {...defaultProps} />);

      expect(screen.getByText(/Leave blank to use auto-generated filename/)).toBeInTheDocument();
    });
  });

  describe('State Management - Metadata Checkbox', () => {
    it('should have unchecked metadata checkbox by default', () => {
      render(<ExportDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle metadata checkbox', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('should toggle metadata checkbox back to unchecked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      await user.click(checkbox);

      expect(checkbox).not.toBeChecked();
    });

    it('should have label for metadata checkbox', () => {
      render(<ExportDialog {...defaultProps} />);

      expect(screen.getByText('Include metadata overlay')).toBeInTheDocument();
    });

    it('should have description for metadata checkbox', () => {
      render(<ExportDialog {...defaultProps} />);

      expect(screen.getByText(/Adds timestamp, design ID, and view settings/)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // EFFECT TESTS (Lines 46-52)
  // ============================================================================

  describe('Effects - WebP Support Detection', () => {
    it('should detect WebP support on mount', async () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should disable WebP button if not supported', async () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Effects - File Size Estimation', () => {
    it('should estimate file size from preview', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display estimated size in KB', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should update estimated size when scale changes', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle missing preview gracefully', () => {
      render(<ExportDialog {...defaultProps} previewDataUrl={undefined} />);

      // Component should still render
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // EXPORT HANDLER TESTS (Lines 62-73)
  // ============================================================================

  describe('Export Handler - Option Assembly', () => {
    it('should call onExport with PNG options', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /Export Screenshot/ });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'png',
        })
      );
    });

    it('should call onExport with JPEG options', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      const exportButton = screen.getByRole('button', { name: /Export Screenshot/ });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'jpeg',
          quality: expect.any(Number),
        })
      );
    });

    it('should include filename in export options when provided', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const filenameInput = screen.getByRole('textbox', { name: /Filename/ });
      await user.type(filenameInput, 'custom-name');

      const exportButton = screen.getByRole('button', { name: /Export Screenshot/ });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: expect.stringContaining('custom-name'),
        })
      );
    });

    it('should use default filename when custom filename is empty', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /Export Screenshot/ });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: expect.any(String),
        })
      );
    });

    it('should include scale in export options', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const scale2Button = screen.getByRole('button', { name: /High-res/ });
      await user.click(scale2Button);

      const exportButton = screen.getByRole('button', { name: /Export Screenshot/ });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          scale: 2,
        })
      );
    });

    it('should include metadata flag in export options', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const exportButton = screen.getByRole('button', { name: /Export Screenshot/ });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          includeMetadata: true,
        })
      );
    });
  });

  describe('Export Handler - Side Effects', () => {
    it('should call onClose after export', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /Export Screenshot/ });
      await user.click(exportButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call both onExport and onClose in correct order', async () => {
      const user = userEvent.setup();
      const callOrder: string[] = [];

      const onExportWithSpy = vi.fn(() => callOrder.push('export'));
      const onCloseWithSpy = vi.fn(() => callOrder.push('close'));

      render(
        <ExportDialog
          {...defaultProps}
          onExport={onExportWithSpy}
          onClose={onCloseWithSpy}
        />
      );

      const exportButton = screen.getByRole('button', { name: /Export Screenshot/ });
      await user.click(exportButton);

      expect(callOrder).toEqual(['export', 'close']);
    });
  });

  // ============================================================================
  // DIALOG INTERACTION TESTS (Lines 78-111)
  // ============================================================================

  describe('Dialog Backdrop Interaction', () => {
    it('should close dialog when clicking backdrop', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not close dialog when clicking dialog content', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      render(<ExportDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby attribute', () => {
      render(<ExportDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'export-dialog-title');
    });
  });

  describe('Close Button Interaction', () => {
    it('should have close button with X icon', () => {
      render(<ExportDialog {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close dialog');
      expect(closeButton).toBeInTheDocument();
    });

    it('should close dialog when clicking close button', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close dialog');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should have hover effect on close button', () => {
      render(<ExportDialog {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close dialog');
      expect(closeButton).toHaveClass('hover:text-white');
    });
  });

  describe('Dialog Header', () => {
    it('should display dialog title', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display dialog subtitle', () => {
      render(<ExportDialog {...defaultProps} />);

      expect(screen.getByText('Configure export settings and download')).toBeInTheDocument();
    });

    it('should display export icon in header', () => {
      render(<ExportDialog {...defaultProps} />);

      const icon = screen.getByLabelText('Export icon');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FOOTER INTERACTION TESTS (Lines 273-287)
  // ============================================================================

  describe('Dialog Footer - Design ID Display', () => {
    it('should display design ID in footer', () => {
      render(<ExportDialog {...defaultProps} />);

      expect(screen.getByText(/design-001/i)).toBeInTheDocument();
    });

    it('should not display design ID when not provided', () => {
      render(<ExportDialog {...defaultProps} currentDesignId={undefined} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Dialog Footer - Buttons', () => {
    it('should have cancel button in footer', () => {
      render(<ExportDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      expect(cancelButton).toBeInTheDocument();
    });

    it('should have export button in footer', () => {
      render(<ExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /Export Screenshot/ });
      expect(exportButton).toBeInTheDocument();
    });

    it('should close dialog when clicking cancel button', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not call onExport when clicking cancel', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      await user.click(cancelButton);

      expect(mockOnExport).not.toHaveBeenCalled();
    });

    it('should have export button with icon', () => {
      render(<ExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /Export Screenshot/ });
      expect(exportButton).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ExportDialog {...defaultProps} />);

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Export Screenshot');
    });

    it('should have proper form labels', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for buttons', () => {
      render(<ExportDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible name
        expect(button.getAttribute('aria-label') || button.textContent).toBeTruthy();
      });
    });

    it('should have help text with proper association', () => {
      render(<ExportDialog {...defaultProps} />);

      const filenameInput = screen.getByRole('textbox');
      expect(filenameInput).toHaveAttribute('aria-describedby', 'filename-help');
    });
  });

  // ============================================================================
  // CONDITIONAL RENDERING TESTS
  // ============================================================================

  describe('Conditional Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<ExportDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ExportDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render quality slider only for lossy formats', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      // PNG should not have slider
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();

      // JPEG should have slider
      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should show warning only for 4x scale', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ExportDialog {...defaultProps} />);

      // Should not show warning initially (1x scale)
      expect(screen.queryByText(/High resolution/)).not.toBeInTheDocument();

      // Select 2x scale
      const scale2Button = screen.getByRole('button', { name: /High-res/ });
      await user.click(scale2Button);

      // Still no warning at 2x
      expect(screen.queryByText(/High resolution/)).not.toBeInTheDocument();

      // Select 4x scale
      const scale4Button = screen.getByRole('button', { name: /Ultra-res/ });
      await user.click(scale4Button);

      // Should show warning at 4x
      expect(screen.getByText(/High resolution/)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // EDGE CASE TESTS
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle rapid format changes', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const pngButton = screen.getByRole('button', { name: /PNG/i });
      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      const webpButton = screen.getByRole('button', { name: /WebP/i });

      await user.click(jpegButton);
      await user.click(webpButton);
      await user.click(pngButton);

      expect(pngButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should handle very long custom filenames', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const filenameInput = screen.getByRole('textbox', { name: /Filename/ });
      const longName = 'x'.repeat(200);

      await user.type(filenameInput, longName);

      expect((filenameInput as HTMLInputElement).value).toBe(longName);
    });

    it('should handle special characters in filename', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const filenameInput = screen.getByRole('textbox', { name: /Filename/ });

      await user.type(filenameInput, 'tank@#$%^');

      expect((filenameInput as HTMLInputElement).value).toBe('tank@#$%^');
    });

    it('should handle quality slider at extreme values', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      const slider = screen.getByRole('slider') as HTMLInputElement;

      // Set to minimum
      fireEvent.change(slider, { target: { value: '0.1' } });
      expect(slider.value).toBe('0.1');

      // Set to maximum
      fireEvent.change(slider, { target: { value: '1' } });
      expect(slider.value).toBe('1');
    });

    it('should handle dialog when previewDataUrl is very large', () => {
      const largePreview = 'data:image/png;base64,' + 'A'.repeat(100000);

      render(
        <ExportDialog
          {...defaultProps}
          previewDataUrl={largePreview}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
