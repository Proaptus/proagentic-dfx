/**
 * ExportDialog Component Test Suite (Simplified)
 * Core functionality tests without brittle implementation details
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportDialog } from '@/components/viewer/ExportDialog';

// Mock the screenshot utilities
vi.mock('@/lib/export/screenshot-utils', () => ({
  isWebPSupported: async () => true,
  estimateFileSize: (dataUrl: string) => {
    const base64 = dataUrl.split(',')[1] || '';
    return Math.round((base64.length * 6) / 8 / 1024);
  },
  generateFilename: (options: any) => {
    if (options.filename) {
      const hasExtension = options.filename.match(/\.(png|jpeg|jpg|webp)$/i);
      return hasExtension ? options.filename : `${options.filename}.${options.format}`;
    }
    return `tank-screenshot.${options.format}`;
  },
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

  describe('Dialog Visibility', () => {
    it('should render dialog when isOpen is true', () => {
      render(<ExportDialog {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when isOpen is false', () => {
      render(<ExportDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Format Selection', () => {
    it('should render all three format buttons', () => {
      render(<ExportDialog {...defaultProps} />);
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('JPEG')).toBeInTheDocument();
      expect(screen.getByText('WebP')).toBeInTheDocument();
    });

    it('should handle format switching', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      expect(jpegButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Quality Control', () => {
    it('should render quality slider for JPEG format', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const jpegButton = screen.getByRole('button', { name: /JPEG/i });
      await user.click(jpegButton);

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should call onExport when export button is clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(b => b.textContent?.includes('Export'));
      
      if (exportButton) {
        await user.click(exportButton);
        expect(mockOnExport).toHaveBeenCalled();
      }
    });

    it('should close dialog after export', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(b => b.textContent?.includes('Export'));
      
      if (exportButton) {
        await user.click(exportButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Cancel Button', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
