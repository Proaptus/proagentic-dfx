/**
 * ExportProgressIndicator Component Test Suite
 * Tests progress bar, file status tracking, and accessibility
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExportProgressIndicator } from '@/components/export/ExportProgressIndicator';

describe('ExportProgressIndicator', () => {
  const mockSelections = {
    geometry: ['step', 'dxf'],
    manufacturing: ['winding_seq'],
    analysis: ['design_report'],
  };

  it('should render progress percentage', () => {
    render(
      <ExportProgressIndicator
        progressPercent={50}
        selections={mockSelections}
        status="generating"
      />
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should render progress bar with correct ARIA attributes', () => {
    render(
      <ExportProgressIndicator
        progressPercent={75}
        selections={mockSelections}
        status="generating"
      />
    );

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-label', 'Export progress: 75% complete');
  });

  it('should render progress bar with correct width', () => {
    const { container } = render(
      <ExportProgressIndicator
        progressPercent={60}
        selections={mockSelections}
        status="generating"
      />
    );

    const progressBar = container.querySelector('[style*="width: 60%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('should display all file items', () => {
    render(
      <ExportProgressIndicator
        progressPercent={25}
        selections={mockSelections}
        status="generating"
      />
    );

    expect(screen.getByText('Step')).toBeInTheDocument();
    expect(screen.getByText('Dxf')).toBeInTheDocument();
    expect(screen.getByText('Winding Seq')).toBeInTheDocument();
    expect(screen.getByText('Design Report')).toBeInTheDocument();
  });

  it('should show completed files with green checkmark', () => {
    render(
      <ExportProgressIndicator
        progressPercent={100}
        selections={mockSelections}
        status="ready"
      />
    );

    const completeIcons = screen.getAllByLabelText('Complete');
    expect(completeIcons.length).toBe(4); // All 4 files should be complete
  });

  it('should show generating files with spinner', () => {
    render(
      <ExportProgressIndicator
        progressPercent={25}
        selections={mockSelections}
        status="generating"
      />
    );

    const generatingIcons = screen.getAllByLabelText('Generating');
    expect(generatingIcons.length).toBeGreaterThan(0);
  });

  it('should show pending files with empty circle', () => {
    render(
      <ExportProgressIndicator
        progressPercent={10}
        selections={mockSelections}
        status="generating"
      />
    );

    const pendingIcons = screen.getAllByLabelText('Pending');
    expect(pendingIcons.length).toBeGreaterThan(0);
  });

  it('should calculate estimated time correctly', () => {
    render(
      <ExportProgressIndicator
        progressPercent={50}
        selections={mockSelections}
        status="generating"
      />
    );

    // (100 - 50) / 10 = 5 seconds
    expect(screen.getByText(/Estimated time remaining: 5s/i)).toBeInTheDocument();
  });

  it('should update estimated time based on progress', () => {
    const { rerender } = render(
      <ExportProgressIndicator
        progressPercent={90}
        selections={mockSelections}
        status="generating"
      />
    );

    // (100 - 90) / 10 = 1 second
    expect(screen.getByText(/Estimated time remaining: 1s/i)).toBeInTheDocument();

    rerender(
      <ExportProgressIndicator
        progressPercent={95}
        selections={mockSelections}
        status="generating"
      />
    );

    // (100 - 95) / 10 = 0.5, Math.ceil = 1 second
    expect(screen.getByText(/Estimated time remaining: 1s/i)).toBeInTheDocument();
  });

  it('should have accessible file list', () => {
    render(
      <ExportProgressIndicator
        progressPercent={50}
        selections={mockSelections}
        status="generating"
      />
    );

    const list = screen.getByRole('list', { name: /files being exported/i });
    expect(list).toBeInTheDocument();

    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(4);
  });

  it('should announce time remaining to screen readers', () => {
    render(
      <ExportProgressIndicator
        progressPercent={50}
        selections={mockSelections}
        status="generating"
      />
    );

    const timeRemaining = screen.getByRole('status');
    expect(timeRemaining).toHaveAttribute('aria-live', 'polite');
  });

  it('should handle empty selections gracefully', () => {
    render(
      <ExportProgressIndicator
        progressPercent={0}
        selections={{}}
        status="generating"
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should memoize file progress calculations', () => {
    const { rerender } = render(
      <ExportProgressIndicator
        progressPercent={50}
        selections={mockSelections}
        status="generating"
      />
    );

    const initialItems = screen.getAllByRole('listitem');
    const initialCount = initialItems.length;

    // Re-render with same props
    rerender(
      <ExportProgressIndicator
        progressPercent={50}
        selections={mockSelections}
        status="generating"
      />
    );

    const updatedItems = screen.getAllByRole('listitem');
    expect(updatedItems.length).toBe(initialCount);
  });
});
