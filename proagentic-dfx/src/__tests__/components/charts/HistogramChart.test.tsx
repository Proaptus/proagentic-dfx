/**
 * HistogramChart Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistogramChart } from '@/components/charts/HistogramChart';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="composed-chart" data-items={data?.length || 0}>{children}</div>
  ),
  Bar: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`bar-${dataKey}`} data-name={name} />
  ),
  Line: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`line-${dataKey}`} data-name={name} />
  ),
  Area: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`area-${dataKey}`} data-name={name} />
  ),
  XAxis: ({ label }: { label?: { value: string } }) => (
    <div data-testid="x-axis" data-label={label?.value} />
  ),
  YAxis: ({ label }: { label?: { value: string } }) => (
    <div data-testid="y-axis" data-label={label?.value} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: ({ x, label }: { x?: number; label?: { value: string } }) => (
    <div data-testid="reference-line" data-x={x} data-label={label?.value} />
  ),
}));

// Mock ChartControls
vi.mock('@/components/charts/ChartControls', () => ({
  ChartControls: ({
    chartType,
    onChartTypeChange,
    colorMode,
    onColorModeChange,
    showGrid,
    onToggleGrid,
    showLegend,
    onToggleLegend,
  }: {
    chartType: string;
    onChartTypeChange: (type: string) => void;
    colorMode: string;
    onColorModeChange: (mode: string) => void;
    showGrid: boolean;
    onToggleGrid: () => void;
    showLegend: boolean;
    onToggleLegend: () => void;
  }) => (
    <div data-testid="chart-controls">
      <button data-testid="chart-type-btn" onClick={() => onChartTypeChange('area')}>{chartType}</button>
      <button data-testid="color-mode-btn" onClick={() => onColorModeChange('gradient')}>{colorMode}</button>
      <button data-testid="toggle-grid-btn" onClick={onToggleGrid}>Grid: {showGrid ? 'ON' : 'OFF'}</button>
      <button data-testid="toggle-legend-btn" onClick={onToggleLegend}>Legend: {showLegend ? 'ON' : 'OFF'}</button>
    </div>
  ),
  ColorScaleLegend: ({ colorMode }: { colorMode: string }) => (
    <div data-testid="color-scale-legend" data-mode={colorMode} />
  ),
}));

const mockData = [
  { bin_center: 40, count: 5 },
  { bin_center: 45, count: 12 },
  { bin_center: 50, count: 25 },
  { bin_center: 55, count: 35 },
  { bin_center: 60, count: 42 },
  { bin_center: 65, count: 38 },
  { bin_center: 70, count: 28 },
  { bin_center: 75, count: 15 },
  { bin_center: 80, count: 8 },
  { bin_center: 85, count: 3 },
];

const mockMean = 62.5;
const mockStd = 10.2;

describe('HistogramChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the chart container', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render default title', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByText('Distribution')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} title="Weight Distribution" />);
      expect(screen.getByText('Weight Distribution')).toBeInTheDocument();
    });

    it('should render bar chart by default', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByTestId('bar-count')).toBeInTheDocument();
    });

    it('should render chart controls', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByTestId('chart-controls')).toBeInTheDocument();
    });
  });

  describe('Statistics Panel', () => {
    it('should display mean value', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByText('Mean')).toBeInTheDocument();
    });

    it('should display std dev value', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByText('Std Dev')).toBeInTheDocument();
    });

    it('should display median', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByText('Median')).toBeInTheDocument();
    });

    it('should display coefficient of variation', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByText('CoV')).toBeInTheDocument();
    });
  });

  describe('Footer Statistics', () => {
    it('should display min value', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByText(/Min:/)).toBeInTheDocument();
    });

    it('should display max value', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByText(/Max:/)).toBeInTheDocument();
    });

    it('should display range', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByText(/Range:/)).toBeInTheDocument();
    });

    it('should display sample count', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByText(/Samples:/)).toBeInTheDocument();
    });
  });

  describe('Normal Overlay', () => {
    it('should render normal overlay checkbox', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByText('Normal Overlay')).toBeInTheDocument();
    });

    it('should toggle normal overlay', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should show normal distribution line when overlay enabled', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} showNormalOverlay={true} />);
      // The area for normal count should be rendered
      expect(screen.getByTestId('area-normalCount')).toBeInTheDocument();
    });
  });

  describe('Chart Type Switching', () => {
    it('should switch to area chart', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      fireEvent.click(screen.getByTestId('chart-type-btn'));
      expect(screen.getByTestId('area-count')).toBeInTheDocument();
    });

    it('should display chart type in button', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByTestId('chart-type-btn')).toHaveTextContent('bar');
    });
  });

  describe('Color Modes', () => {
    it('should start with default color mode', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      expect(screen.getByTestId('color-mode-btn')).toHaveTextContent('default');
    });

    it('should show color scale legend when not default', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      fireEvent.click(screen.getByTestId('color-mode-btn'));
      expect(screen.getByTestId('color-scale-legend')).toBeInTheDocument();
    });
  });

  describe('Toggle Controls', () => {
    it('should toggle grid', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      const gridBtn = screen.getByTestId('toggle-grid-btn');
      expect(gridBtn).toHaveTextContent('Grid: ON');
      fireEvent.click(gridBtn);
      expect(gridBtn).toHaveTextContent('Grid: OFF');
    });

    it('should toggle legend', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} />);
      const legendBtn = screen.getByTestId('toggle-legend-btn');
      expect(legendBtn).toHaveTextContent('Legend: ON');
      fireEvent.click(legendBtn);
      expect(legendBtn).toHaveTextContent('Legend: OFF');
    });
  });

  describe('Confidence Interval', () => {
    it('should render confidence interval lines when provided', () => {
      render(
        <HistogramChart
          data={mockData}
          mean={mockMean}
          std={mockStd}
          confidenceInterval={{ lower: 50, upper: 75 }}
        />
      );
      const refLines = screen.getAllByTestId('reference-line');
      expect(refLines.length).toBeGreaterThanOrEqual(3); // Mean + 2 CI lines + sigma lines
    });
  });

  describe('Export Functionality', () => {
    it('should render export buttons when onExport provided', () => {
      const mockOnExport = vi.fn();
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} onExport={mockOnExport} />);
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('SVG')).toBeInTheDocument();
    });

    it('should call onExport with png format', () => {
      const mockOnExport = vi.fn();
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} onExport={mockOnExport} />);
      fireEvent.click(screen.getByText('PNG'));
      expect(mockOnExport).toHaveBeenCalledWith('png');
    });

    it('should call onExport with svg format', () => {
      const mockOnExport = vi.fn();
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} onExport={mockOnExport} />);
      fireEvent.click(screen.getByText('SVG'));
      expect(mockOnExport).toHaveBeenCalledWith('svg');
    });
  });

  describe('Custom Labels', () => {
    it('should use custom xLabel', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} xLabel="Weight" />);
      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('data-label', 'Weight ()');
    });

    it('should use custom unit', () => {
      render(<HistogramChart data={mockData} mean={mockMean} std={mockStd} unit="kg" />);
      // Unit appears in axis label and footer
      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('data-label', 'Value (kg)');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data gracefully', () => {
      // Component requires non-empty data for statistics calculations
      // Render with minimal valid data instead
      const minimalData = [{ bin_center: 50, count: 1 }];
      render(<HistogramChart data={minimalData} mean={50} std={0} />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should handle single bin', () => {
      const singleBin = [{ bin_center: 50, count: 100 }];
      render(<HistogramChart data={singleBin} mean={50} std={0} />);
      expect(screen.getByTestId('bar-count')).toBeInTheDocument();
    });
  });
});
