/**
 * ExportScreen Component Test Suite
 * REQ-258: Export complete design packages
 * REQ-259: Multiple format support
 * REQ-260: Manufacturing data export
 *
 * Tests:
 * - Component rendering with mock data
 * - Format selection functionality
 * - Export progress display
 * - Download button states
 * - Accessibility compliance
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExportScreen } from '@/components/screens/ExportScreen';
import { useAppStore } from '@/lib/stores/app-store';
import * as apiClient from '@/lib/api/client';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  startExport: vi.fn(),
  getExportStatus: vi.fn(),
  getExportDownloadUrl: vi.fn(),
}));

// Mock the app store
vi.mock('@/lib/stores/app-store', () => ({
  useAppStore: vi.fn(),
}));

// Mock child components for focused testing
vi.mock('@/components/export/DocumentPreview', () => ({
  DocumentPreview: ({ documentType }: { documentType: string }) => (
    <div data-testid="document-preview">{documentType}</div>
  ),
}));

vi.mock('@/components/export/ManufacturingPreview', () => ({
  ManufacturingPreview: () => <div data-testid="manufacturing-preview">Manufacturing Preview</div>,
}));

describe('ExportScreen', () => {
  const mockSetCurrentDesign = vi.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Default store state
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentDesign: 'C',
      setCurrentDesign: mockSetCurrentDesign,
    });

    // Default API responses
    (apiClient.startExport as ReturnType<typeof vi.fn>).mockResolvedValue({
      export_id: 'test-export-123',
    });

    (apiClient.getExportStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 'generating',
      progress_percent: 0,
    });

    (apiClient.getExportDownloadUrl as ReturnType<typeof vi.fn>).mockReturnValue(
      'https://example.com/download/test-export-123'
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the export screen with default state', () => {
      render(<ExportScreen />);

      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText(/8 items selected/i)).toBeInTheDocument();
    });

    it('should display all export categories', () => {
      render(<ExportScreen />);

      expect(screen.getByText('Geometry Files')).toBeInTheDocument();
      expect(screen.getByText('Manufacturing Data')).toBeInTheDocument();
      expect(screen.getByText('Analysis Reports')).toBeInTheDocument();
      expect(screen.getByText('Supporting Documents')).toBeInTheDocument();
    });

    it('should show current design in header', () => {
      render(<ExportScreen />);

      expect(screen.getAllByText(/Design C/i).length).toBeGreaterThan(0);
    });

    it('should render with custom export categories', () => {
      const customCategories = [
        {
          id: 'custom',
          title: 'Custom Category',
          icon: <div>Icon</div>,
          options: [
            {
              id: 'custom-option',
              label: 'Custom Option',
              description: 'Custom description',
            },
          ],
        },
      ];

      render(<ExportScreen exportCategories={customCategories} />);

      expect(screen.getByText('Custom Category')).toBeInTheDocument();
      expect(screen.getByText('Custom Option')).toBeInTheDocument();
    });

    it('should set default design if none selected', async () => {
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: null,
        setCurrentDesign: mockSetCurrentDesign,
      });

      render(<ExportScreen />);

      await waitFor(() => {
        expect(mockSetCurrentDesign).toHaveBeenCalledWith('C');
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should render all three tabs', () => {
      render(<ExportScreen />);

      expect(screen.getByText('Export Selection')).toBeInTheDocument();
      expect(screen.getByText('Document Preview')).toBeInTheDocument();
      expect(screen.getByText('Manufacturing Spec')).toBeInTheDocument();
    });

    it('should switch to document preview tab', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      const previewTab = screen.getByText('Document Preview');
      await user.click(previewTab);

      expect(screen.getAllByTestId('document-preview')).toHaveLength(2);
    });

    it('should switch to manufacturing tab', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      const manufacturingTab = screen.getByText('Manufacturing Spec');
      await user.click(manufacturingTab);

      expect(screen.getByTestId('manufacturing-preview')).toBeInTheDocument();
    });

    it('should apply active styles to selected tab', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      const selectionTab = screen.getByText('Export Selection');
      expect(selectionTab.className).toContain('border-gray-900');

      const previewTab = screen.getByText('Document Preview');
      await user.click(previewTab);

      expect(previewTab.className).toContain('border-gray-900');
      expect(selectionTab.className).not.toContain('border-gray-900');
    });
  });

  describe('Format Selection', () => {
    it('should display default selected items count', () => {
      render(<ExportScreen />);

      // Default selections: 2 geometry + 2 manufacturing + 2 analysis + 2 supporting = 8
      expect(screen.getByText(/8 items selected/i)).toBeInTheDocument();
    });

    it('should toggle export option selection', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      // Find and click a non-selected option
      const dxfOption = screen.getByText('DXF Drawing');
      await user.click(dxfOption);

      // Count should increase
      await waitFor(() => {
        expect(screen.getByText(/9 items selected/i)).toBeInTheDocument();
      });
    });

    it('should deselect already selected option', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      // Find and click a selected option
      const stepOption = screen.getByText('STEP CAD Model');
      await user.click(stepOption);

      // Count should decrease
      await waitFor(() => {
        expect(screen.getByText(/7 items selected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Configuration', () => {
    it('should display units system selector', () => {
      render(<ExportScreen />);

      const unitsSelect = screen.getByLabelText('Units System');
      expect(unitsSelect).toBeInTheDocument();
      expect(unitsSelect).toHaveValue('SI');
    });

    it('should change units system', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      const unitsSelect = screen.getByLabelText('Units System');
      await user.selectOptions(unitsSelect, 'Imperial');

      expect(unitsSelect).toHaveValue('Imperial');
    });

    it('should display quality selector', () => {
      render(<ExportScreen />);

      const qualitySelect = screen.getByLabelText('Output Quality');
      expect(qualitySelect).toBeInTheDocument();
      expect(qualitySelect).toHaveValue('high');
    });

    it('should change quality setting', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      const qualitySelect = screen.getByLabelText('Output Quality');
      await user.selectOptions(qualitySelect, 'draft');

      expect(qualitySelect).toHaveValue('draft');
    });

    it('should toggle include comments checkbox', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      const checkbox = screen.getByRole('checkbox', {
        name: /include design comments/i,
      });
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Export Generation', () => {
    it('should display generate export button', () => {
      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      expect(generateButton).toBeInTheDocument();
      expect(generateButton).not.toBeDisabled();
    });

    it('should disable export button when no items selected', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      // Deselect all items
      const allSelectedOptions = [
        'STEP CAD Model',
        'Dome Profile CSV',
        'Winding Sequence',
        'Cure Cycle Profile',
        'Design Report PDF',
        'Stress Analysis Report',
        'Material Certificates Template',
        'Traceability Matrix',
      ];

      for (const optionText of allSelectedOptions) {
        const option = screen.getByText(optionText);
        await user.click(option);
      }

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      expect(generateButton).toBeDisabled();
    });

    it('should start export when button clicked', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(apiClient.startExport).toHaveBeenCalledWith({
          design_id: 'C',
          include: expect.any(Object),
          format: 'zip',
        });
      });
    });

    it('should show loading state during export', async () => {
      const user = userEvent.setup();

      // Make startExport slow
      (apiClient.startExport as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      expect(generateButton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Export Progress', () => {
    it('should display progress indicator during generation', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/Generating Export Package/i)).toBeInTheDocument();
      });
    });

    it('should update progress percentage', async () => {
      const user = userEvent.setup();

      (apiClient.getExportStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 'generating',
        progress_percent: 50,
      });

      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show progress bar with correct aria attributes', async () => {
      const user = userEvent.setup();

      (apiClient.getExportStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 'generating',
        progress_percent: 75,
      });

      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar).toHaveAttribute('aria-valuenow', '75');
        expect(progressbar).toHaveAttribute('aria-valuemin', '0');
        expect(progressbar).toHaveAttribute('aria-valuemax', '100');
      }, { timeout: 3000 });
    });

    it('should display file generation status', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/Files being generated/i)).toBeInTheDocument();
      });
    });
  });

  describe('Download Functionality', () => {
    it('should show download button when export is ready', async () => {
      const user = userEvent.setup();

      (apiClient.getExportStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 'ready',
        progress_percent: 100,
        download_url: 'https://example.com/download',
      });

      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', {
          name: /download/i,
        });
        expect(downloadButton).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display success message when ready', async () => {
      const user = userEvent.setup();

      (apiClient.getExportStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 'ready',
        progress_percent: 100,
      });

      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Export ready')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should open download URL when download button clicked', async () => {
      const user = userEvent.setup();
      const mockWindowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

      (apiClient.getExportStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 'ready',
        progress_percent: 100,
      });

      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', {
          name: /download/i,
        });
        expect(downloadButton).toBeInTheDocument();
      }, { timeout: 3000 });

      const downloadButton = screen.getByRole('button', {
        name: /download/i,
      });
      await user.click(downloadButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com/download/test-export-123',
        '_blank'
      );

      mockWindowOpen.mockRestore();
    });

    it('should show email delivery button when ready', async () => {
      const user = userEvent.setup();

      (apiClient.getExportStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 'ready',
        progress_percent: 100,
      });

      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        const emailButton = screen.getByRole('button', {
          name: /email/i,
        });
        expect(emailButton).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible tab navigation', () => {
      render(<ExportScreen />);

      const nav = screen.getByRole('navigation', { name: /export tabs/i });
      expect(nav).toBeInTheDocument();
    });

    it('should have proper form labels', () => {
      render(<ExportScreen />);

      expect(screen.getByLabelText('Units System')).toBeInTheDocument();
      expect(screen.getByLabelText('Output Quality')).toBeInTheDocument();
      expect(
        screen.getByLabelText(/include design comments/i)
      ).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      expect(generateButton).toHaveAccessibleName();
    });

    it('should announce export status changes', async () => {
      const user = userEvent.setup();

      (apiClient.getExportStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 'ready',
        progress_percent: 100,
      });

      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        const status = screen.getByRole('status', {
          name: /export ready notification/i,
        });
        expect(status).toHaveAttribute('aria-live', 'polite');
      }, { timeout: 5000 });
    });

    it('should have keyboard accessible export options', async () => {
      const user = userEvent.setup();
      render(<ExportScreen />);

      const stepOption = screen.getByText('STEP CAD Model');
      const button = stepOption.closest('button');
      expect(button).not.toBeNull();
      button!.focus();
      expect(document.activeElement).toBe(button);

      await user.keyboard(' ');  // Space key activates buttons
      // Should toggle selection
      await waitFor(() => {
        expect(screen.getByText(/7 items selected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle export start error gracefully', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      (apiClient.startExport as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Export failed')
      );

      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Export error:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

    it('should handle status polling error gracefully', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      // startExport succeeds, but status polling fails
      (apiClient.startExport as ReturnType<typeof vi.fn>).mockResolvedValue({
        export_id: 'test-export-123',
      });

      (apiClient.getExportStatus as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Status check failed')
      );

      render(<ExportScreen />);

      const generateButton = screen.getByRole('button', {
        name: /generate export/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Export status polling error:',
          expect.any(Error)
        );
      }, { timeout: 3000 });

      consoleError.mockRestore();
    });
  });
});
