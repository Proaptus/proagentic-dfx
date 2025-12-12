/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ChartControls and ColorScaleLegend Component Tests
 * Coverage Target: 80%
 *
 * Test Coverage:
 * - ChartControls rendering (6 tests)
 * - Chart type selector (4 tests)
 * - Color mode selector (4 tests)
 * - Size metric selector (3 tests)
 * - Zoom controls (4 tests)
 * - Toggle controls (4 tests)
 * - Action buttons (3 tests)
 * - Layout and position (4 tests)
 * - ColorScaleLegend (6 tests)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartControls, ColorScaleLegend, CHART_TYPE_ICONS, CHART_TYPE_LABELS, COLOR_MODE_LABELS } from '@/components/charts/ChartControls';
import type { ChartType, ColorMode } from '@/lib/charts/chart-utils';

describe('ChartControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the controls container', () => {
      render(<ChartControls />);

      // Container should exist
      const container = document.querySelector('[class*="absolute"]');
      expect(container).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<ChartControls className="custom-class" />);

      const controls = container.firstChild;
      expect(controls).toHaveClass('custom-class');
    });

    it('should not render chart type selector without chartType prop', () => {
      render(<ChartControls availableChartTypes={['line', 'bar']} />);

      // Type label should not be visible
      expect(screen.queryByText('Type')).not.toBeInTheDocument();
    });

    it('should render with default layout horizontal', () => {
      const { container } = render(<ChartControls />);

      const controls = container.firstChild;
      expect(controls).toHaveClass('flex-row', 'gap-2');
    });

    it('should render with compact layout', () => {
      const { container } = render(<ChartControls layout="compact" />);

      const controls = container.firstChild;
      expect(controls).toHaveClass('flex-row', 'gap-1');
    });

    it('should render with minimal layout', () => {
      const { container } = render(<ChartControls layout="minimal" />);

      const controls = container.firstChild;
      expect(controls).toHaveClass('flex-col', 'gap-1');
    });
  });

  describe('Position', () => {
    it('should position top-right by default', () => {
      const { container } = render(<ChartControls />);

      const controls = container.firstChild;
      expect(controls).toHaveClass('top-2', 'right-2');
    });

    it('should position top-left when specified', () => {
      const { container } = render(<ChartControls position="top-left" />);

      const controls = container.firstChild;
      expect(controls).toHaveClass('top-2', 'left-2');
    });

    it('should position bottom-right when specified', () => {
      const { container } = render(<ChartControls position="bottom-right" />);

      const controls = container.firstChild;
      expect(controls).toHaveClass('bottom-2', 'right-2');
    });

    it('should position bottom-left when specified', () => {
      const { container } = render(<ChartControls position="bottom-left" />);

      const controls = container.firstChild;
      expect(controls).toHaveClass('bottom-2', 'left-2');
    });
  });

  describe('Chart Type Selector', () => {
    it('should render chart type buttons when chartType and handler provided', () => {
      const mockOnChange = vi.fn();
      render(
        <ChartControls
          chartType="line"
          availableChartTypes={['line', 'bar', 'area']}
          onChartTypeChange={mockOnChange}
        />
      );

      // Should show type buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });

    it('should call onChartTypeChange when type button clicked', () => {
      const mockOnChange = vi.fn();
      render(
        <ChartControls
          chartType="line"
          availableChartTypes={['line', 'bar']}
          onChartTypeChange={mockOnChange}
        />
      );

      const barButton = screen.getByTitle('Bar');
      fireEvent.click(barButton);

      expect(mockOnChange).toHaveBeenCalledWith('bar');
    });

    it('should highlight active chart type', () => {
      const mockOnChange = vi.fn();
      render(
        <ChartControls
          chartType="line"
          availableChartTypes={['line', 'bar']}
          onChartTypeChange={mockOnChange}
        />
      );

      const lineButton = screen.getByTitle('Line');
      expect(lineButton).toHaveClass('bg-blue-100', 'text-blue-600');
    });

    it('should not render type selector if only one type available', () => {
      const mockOnChange = vi.fn();
      render(
        <ChartControls
          chartType="line"
          availableChartTypes={['line']}
          onChartTypeChange={mockOnChange}
        />
      );

      expect(screen.queryByTitle('Line')).not.toBeInTheDocument();
    });
  });

  describe('Color Mode Selector', () => {
    it('should render color mode dropdown', () => {
      const mockOnChange = vi.fn();
      render(
        <ChartControls
          colorMode="default"
          availableColorModes={['default', 'gradient', 'category']}
          onColorModeChange={mockOnChange}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should call onColorModeChange when mode changed', () => {
      const mockOnChange = vi.fn();
      render(
        <ChartControls
          colorMode="default"
          availableColorModes={['default', 'gradient']}
          onColorModeChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'gradient' } });

      expect(mockOnChange).toHaveBeenCalledWith('gradient');
    });

    it('should display custom color mode labels', () => {
      const mockOnChange = vi.fn();
      const customLabels = { custom1: 'Custom Label 1', custom2: 'Custom Label 2' };

      render(
        <ChartControls<string>
          colorMode="custom1"
          availableColorModes={['custom1', 'custom2']}
          onColorModeChange={mockOnChange}
          colorModeLabels={customLabels}
        />
      );

      expect(screen.getByText('Custom Label 1')).toBeInTheDocument();
      expect(screen.getByText('Custom Label 2')).toBeInTheDocument();
    });

    it('should not render if only one color mode', () => {
      const mockOnChange = vi.fn();
      render(
        <ChartControls
          colorMode="default"
          availableColorModes={['default']}
          onColorModeChange={mockOnChange}
        />
      );

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('Size Metric Selector', () => {
    it('should render size metric dropdown', () => {
      const mockOnChange = vi.fn();
      render(
        <ChartControls
          sizeMetric="weight"
          availableSizeMetrics={[
            { value: 'weight', label: 'Weight' },
            { value: 'cost', label: 'Cost' },
          ]}
          onSizeMetricChange={mockOnChange}
        />
      );

      // Should have a combobox for size metrics
      const combos = screen.getAllByRole('combobox');
      expect(combos.length).toBeGreaterThanOrEqual(1);
    });

    it('should call onSizeMetricChange when changed', () => {
      const mockOnChange = vi.fn();
      render(
        <ChartControls
          sizeMetric="weight"
          availableSizeMetrics={[
            { value: 'weight', label: 'Weight' },
            { value: 'cost', label: 'Cost' },
          ]}
          onSizeMetricChange={mockOnChange}
        />
      );

      const combos = screen.getAllByRole('combobox');
      const sizeSelect = combos[combos.length - 1]; // Last combobox is size metric
      fireEvent.change(sizeSelect, { target: { value: 'cost' } });

      expect(mockOnChange).toHaveBeenCalledWith('cost');
    });

    it('should include Fixed Size option', () => {
      const mockOnChange = vi.fn();
      render(
        <ChartControls
          sizeMetric="weight"
          availableSizeMetrics={[{ value: 'weight', label: 'Weight' }]}
          onSizeMetricChange={mockOnChange}
        />
      );

      expect(screen.getByText('Fixed Size')).toBeInTheDocument();
    });
  });

  describe('Zoom Controls', () => {
    it('should render zoom buttons when enabled', () => {
      const mockZoomIn = vi.fn();
      const mockZoomOut = vi.fn();
      const mockZoomReset = vi.fn();

      render(
        <ChartControls
          zoomEnabled={true}
          onZoomIn={mockZoomIn}
          onZoomOut={mockZoomOut}
          onZoomReset={mockZoomReset}
        />
      );

      expect(screen.getByTitle('Zoom In')).toBeInTheDocument();
      expect(screen.getByTitle('Zoom Out')).toBeInTheDocument();
      expect(screen.getByTitle('Reset Zoom')).toBeInTheDocument();
    });

    it('should call onZoomIn when clicked', () => {
      const mockZoomIn = vi.fn();
      render(<ChartControls zoomEnabled={true} onZoomIn={mockZoomIn} />);

      fireEvent.click(screen.getByTitle('Zoom In'));
      expect(mockZoomIn).toHaveBeenCalled();
    });

    it('should call onZoomOut when clicked', () => {
      const mockZoomOut = vi.fn();
      render(<ChartControls zoomEnabled={true} onZoomOut={mockZoomOut} />);

      fireEvent.click(screen.getByTitle('Zoom Out'));
      expect(mockZoomOut).toHaveBeenCalled();
    });

    it('should call onZoomReset when clicked', () => {
      const mockZoomReset = vi.fn();
      render(<ChartControls zoomEnabled={true} onZoomReset={mockZoomReset} />);

      fireEvent.click(screen.getByTitle('Reset Zoom'));
      expect(mockZoomReset).toHaveBeenCalled();
    });

    it('should not render zoom controls when disabled', () => {
      render(
        <ChartControls
          zoomEnabled={false}
          onZoomIn={vi.fn()}
        />
      );

      expect(screen.queryByTitle('Zoom In')).not.toBeInTheDocument();
    });
  });

  describe('Toggle Controls', () => {
    it('should render grid toggle', () => {
      const mockToggle = vi.fn();
      render(<ChartControls showGrid={true} onToggleGrid={mockToggle} />);

      expect(screen.getByTitle('Hide Grid')).toBeInTheDocument();
    });

    it('should call onToggleGrid when clicked', () => {
      const mockToggle = vi.fn();
      render(<ChartControls showGrid={true} onToggleGrid={mockToggle} />);

      fireEvent.click(screen.getByTitle('Hide Grid'));
      expect(mockToggle).toHaveBeenCalled();
    });

    it('should render legend toggle', () => {
      const mockToggle = vi.fn();
      render(<ChartControls showLegend={true} onToggleLegend={mockToggle} />);

      expect(screen.getByTitle('Hide Legend')).toBeInTheDocument();
    });

    it('should show Show Grid when grid hidden', () => {
      const mockToggle = vi.fn();
      render(<ChartControls showGrid={false} onToggleGrid={mockToggle} />);

      expect(screen.getByTitle('Show Grid')).toBeInTheDocument();
    });

    it('should show Show Legend when legend hidden', () => {
      const mockToggle = vi.fn();
      render(<ChartControls showLegend={false} onToggleLegend={mockToggle} />);

      expect(screen.getByTitle('Show Legend')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render export button when onExport provided', () => {
      const mockExport = vi.fn();
      render(<ChartControls onExport={mockExport} />);

      expect(screen.getByTitle('Export Chart')).toBeInTheDocument();
    });

    it('should call onExport when clicked', () => {
      const mockExport = vi.fn();
      render(<ChartControls onExport={mockExport} />);

      fireEvent.click(screen.getByTitle('Export Chart'));
      expect(mockExport).toHaveBeenCalled();
    });

    it('should render fullscreen button when onFullscreen provided', () => {
      const mockFullscreen = vi.fn();
      render(<ChartControls onFullscreen={mockFullscreen} />);

      expect(screen.getByTitle('Fullscreen')).toBeInTheDocument();
    });

    it('should call onFullscreen when clicked', () => {
      const mockFullscreen = vi.fn();
      render(<ChartControls onFullscreen={mockFullscreen} />);

      fireEvent.click(screen.getByTitle('Fullscreen'));
      expect(mockFullscreen).toHaveBeenCalled();
    });
  });
});

describe('ColorScaleLegend', () => {
  describe('Rendering', () => {
    it('should return null for default color mode', () => {
      const { container } = render(<ColorScaleLegend colorMode="default" />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null for category color mode', () => {
      const { container } = render(<ColorScaleLegend colorMode="category" />);

      expect(container.firstChild).toBeNull();
    });

    it('should render for gradient color mode', () => {
      render(<ColorScaleLegend colorMode="gradient" />);

      expect(document.querySelector('[class*="absolute"]')).toBeInTheDocument();
    });

    it('should render for reliability color mode', () => {
      render(<ColorScaleLegend colorMode="reliability" />);

      expect(screen.getByText('Reliability')).toBeInTheDocument();
    });

    it('should render for cost color mode', () => {
      render(<ColorScaleLegend colorMode="cost" />);

      expect(screen.getByText('Cost')).toBeInTheDocument();
    });

    it('should render for performance color mode', () => {
      render(<ColorScaleLegend colorMode="performance" />);

      expect(screen.getByText('performance')).toBeInTheDocument();
    });
  });

  describe('Position', () => {
    it('should position bottom-right by default', () => {
      const { container } = render(<ColorScaleLegend colorMode="gradient" />);

      const legend = container.firstChild;
      expect(legend).toHaveClass('bottom-2', 'right-2');
    });

    it('should position top-left when specified', () => {
      const { container } = render(<ColorScaleLegend colorMode="gradient" position="top-left" />);

      const legend = container.firstChild;
      expect(legend).toHaveClass('top-2', 'left-2');
    });
  });

  describe('Labels', () => {
    it('should show Low/High labels for reliability', () => {
      render(<ColorScaleLegend colorMode="reliability" />);

      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should show High/Low labels for cost (reversed)', () => {
      render(<ColorScaleLegend colorMode="cost" />);

      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('should show min/max values when provided', () => {
      render(<ColorScaleLegend colorMode="gradient" min={0} max={100} />);

      expect(screen.getByText('0e+0')).toBeInTheDocument();
      expect(screen.getByText('1e+2')).toBeInTheDocument();
    });

    it('should show unit when provided', () => {
      render(<ColorScaleLegend colorMode="gradient" unit="%" />);

      expect(screen.getByText('%')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(<ColorScaleLegend colorMode="gradient" className="custom-class" />);

      const legend = container.firstChild;
      expect(legend).toHaveClass('custom-class');
    });
  });
});

describe('Exports', () => {
  it('should export CHART_TYPE_ICONS', () => {
    expect(CHART_TYPE_ICONS).toBeDefined();
    expect(CHART_TYPE_ICONS.line).toBeDefined();
    expect(CHART_TYPE_ICONS.bar).toBeDefined();
  });

  it('should export CHART_TYPE_LABELS', () => {
    expect(CHART_TYPE_LABELS).toBeDefined();
    expect(CHART_TYPE_LABELS.line).toBe('Line');
    expect(CHART_TYPE_LABELS.bar).toBe('Bar');
  });

  it('should export COLOR_MODE_LABELS', () => {
    expect(COLOR_MODE_LABELS).toBeDefined();
    expect(COLOR_MODE_LABELS.default).toBe('Default');
    expect(COLOR_MODE_LABELS.gradient).toBe('Gradient');
  });
});
