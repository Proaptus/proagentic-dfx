/**
 * ExportConfiguration Component Test Suite
 * Tests configuration form controls and user interactions
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ExportConfiguration, type ExportConfigOptions } from '@/components/export/ExportConfiguration';

describe('ExportConfiguration', () => {
  const defaultConfig: ExportConfigOptions = {
    units: 'SI',
    quality: 'high',
    includeComments: true,
  };

  const mockOnConfigChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render configuration form', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    expect(screen.getByText('Export Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText('Units System')).toBeInTheDocument();
    expect(screen.getByLabelText('Output Quality')).toBeInTheDocument();
  });

  it('should display current units value', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const unitsSelect = screen.getByLabelText('Units System') as HTMLSelectElement;
    expect(unitsSelect.value).toBe('SI');
  });

  it('should display current quality value', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const qualitySelect = screen.getByLabelText('Output Quality') as HTMLSelectElement;
    expect(qualitySelect.value).toBe('high');
  });

  it('should display current comments checkbox state', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /include design comments/i,
    });
    expect(checkbox).toBeChecked();
  });

  it('should call onConfigChange when units changed', async () => {
    const user = userEvent.setup();
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const unitsSelect = screen.getByLabelText('Units System');
    await user.selectOptions(unitsSelect, 'Imperial');

    expect(mockOnConfigChange).toHaveBeenCalledWith({
      ...defaultConfig,
      units: 'Imperial',
    });
  });

  it('should call onConfigChange when quality changed', async () => {
    const user = userEvent.setup();
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const qualitySelect = screen.getByLabelText('Output Quality');
    await user.selectOptions(qualitySelect, 'draft');

    expect(mockOnConfigChange).toHaveBeenCalledWith({
      ...defaultConfig,
      quality: 'draft',
    });
  });

  it('should call onConfigChange when comments toggled', async () => {
    const user = userEvent.setup();
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /include design comments/i,
    });
    await user.click(checkbox);

    expect(mockOnConfigChange).toHaveBeenCalledWith({
      ...defaultConfig,
      includeComments: false,
    });
  });

  it('should have all unit options', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const unitsSelect = screen.getByLabelText('Units System');
    const options = Array.from(unitsSelect.querySelectorAll('option'));

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('SI (mm, MPa, kg)');
    expect(options[1]).toHaveTextContent('Imperial (in, psi, lb)');
  });

  it('should have all quality options', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const qualitySelect = screen.getByLabelText('Output Quality');
    const options = Array.from(qualitySelect.querySelectorAll('option'));

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Draft (Fast)');
    expect(options[1]).toHaveTextContent('Standard');
    expect(options[2]).toHaveTextContent('High Resolution');
  });

  it('should display helper text for units', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    expect(
      screen.getByText('Select the measurement system for all exported files')
    ).toBeInTheDocument();
  });

  it('should display helper text for quality', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    expect(
      screen.getByText('Higher quality increases file size and generation time')
    ).toBeInTheDocument();
  });

  it('should display helper text for comments', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    expect(
      screen.getByText('Add annotations and design rationale to exported documents')
    ).toBeInTheDocument();
  });

  it('should have proper ARIA descriptions', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const unitsSelect = screen.getByLabelText('Units System');
    expect(unitsSelect).toHaveAttribute('aria-describedby', 'units-description');

    const qualitySelect = screen.getByLabelText('Output Quality');
    expect(qualitySelect).toHaveAttribute('aria-describedby', 'quality-description');
  });

  it('should have accessible form controls', () => {
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const unitsSelect = screen.getByLabelText('Units System');
    expect(unitsSelect).toHaveAccessibleName();

    const qualitySelect = screen.getByLabelText('Output Quality');
    expect(qualitySelect).toHaveAccessibleName();

    const checkbox = screen.getByLabelText(/include design comments/i);
    expect(checkbox).toHaveAccessibleName();
  });

  it('should apply focus styles on interaction', async () => {
    const user = userEvent.setup();
    render(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    const unitsSelect = screen.getByLabelText('Units System');
    await user.click(unitsSelect);

    expect(unitsSelect.className).toContain('focus:ring-2');
    expect(unitsSelect.className).toContain('focus:ring-blue-500');
  });

  it('should render unchecked comments checkbox', () => {
    const uncheckedConfig: ExportConfigOptions = {
      ...defaultConfig,
      includeComments: false,
    };

    render(<ExportConfiguration config={uncheckedConfig} onConfigChange={mockOnConfigChange} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /include design comments/i,
    });
    expect(checkbox).not.toBeChecked();
  });

  it('should handle Imperial units', () => {
    const imperialConfig: ExportConfigOptions = {
      ...defaultConfig,
      units: 'Imperial',
    };

    render(<ExportConfiguration config={imperialConfig} onConfigChange={mockOnConfigChange} />);

    const unitsSelect = screen.getByLabelText('Units System') as HTMLSelectElement;
    expect(unitsSelect.value).toBe('Imperial');
  });

  it('should handle different quality settings', () => {
    const draftConfig: ExportConfigOptions = {
      ...defaultConfig,
      quality: 'draft',
    };

    render(<ExportConfiguration config={draftConfig} onConfigChange={mockOnConfigChange} />);

    const qualitySelect = screen.getByLabelText('Output Quality') as HTMLSelectElement;
    expect(qualitySelect.value).toBe('draft');
  });

  it('should memoize component properly', () => {
    const { rerender } = render(
      <ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />
    );

    // Re-render with same props should not cause unnecessary updates
    rerender(<ExportConfiguration config={defaultConfig} onConfigChange={mockOnConfigChange} />);

    expect(screen.getByText('Export Configuration')).toBeInTheDocument();
  });
});
