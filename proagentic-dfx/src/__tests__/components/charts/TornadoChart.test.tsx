/**
 * TornadoChart Component Tests
 * Coverage Target: 80%
 *
 * Test Coverage:
 * - Basic rendering (5 tests)
 * - Data processing (4 tests)
 * - Chart type switching (3 tests)
 * - Color modes (5 tests)
 * - Controls (5 tests)
 * - Export functionality (3 tests)
 * - Tooltip (3 tests)
 * - Edge cases (3 tests)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TornadoChart, type SensitivityParameter } from '@/components/charts/TornadoChart';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="bar-chart" data-items={data?.length || 0}>{children}</div>
  ),
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="composed-chart" data-items={data?.length || 0}>{children}</div>
  ),
  Bar: ({ dataKey, name, children }: { dataKey: string; name: string; children?: React.ReactNode }) => (
    <div data-testid={`bar-${dataKey}`} data-name={name}>{children}</div>
  ),
  Line: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`line-${dataKey}`} data-name={name} />
  ),
  XAxis: ({ label }: { label?: { value: string } }) => (
    <div data-testid="x-axis" data-label={label?.value} />
  ),
  YAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="y-axis" data-key={dataKey} />
  ),
  CartesianGrid: ({ strokeDasharray }: { strokeDasharray: string }) => (
    <div data-testid="cartesian-grid" data-dash={strokeDasharray} />
  ),
  Tooltip: ({ content }: { content: (props: { payload?: unknown[] }) => React.ReactNode }) => (
    <div data-testid="tooltip">{content?.({ payload: [] })}</div>
  ),
  ReferenceLine: ({ x, label }: { x: number; label?: { value: string } }) => (
    <div data-testid="reference-line" data-x={x} data-label={label?.value} />
  ),
  Cell: ({ fill, opacity }: { fill: string; opacity: number }) => (
    <div data-testid="cell" data-fill={fill} data-opacity={opacity} />
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
      <button data-testid="chart-type-btn" onClick={() => onChartTypeChange('line')}>
        {chartType}
      </button>
      <button data-testid="color-mode-btn" onClick={() => onColorModeChange('gradient')}>
        {colorMode}
      </button>
      <button data-testid="toggle-grid-btn" onClick={onToggleGrid}>
        Grid: {showGrid ? 'ON' : 'OFF'}
      </button>
      <button data-testid="toggle-legend-btn" onClick={onToggleLegend}>
        Legend: {showLegend ? 'ON' : 'OFF'}
      </button>
    </div>
  ),
  ColorScaleLegend: ({ colorMode, min, max, unit }: { colorMode: string; min: number; max: number; unit: string }) => (
    <div data-testid="color-scale-legend" data-mode={colorMode} data-min={min} data-max={max} data-unit={unit} />
  ),
}));

const mockData: SensitivityParameter[] = [
  { parameter: 'fiber_tension', label: 'Fiber Tension', low_impact: -12.5, high_impact: 15.8, baseline: 100, unit: 'MPa' },
  { parameter: 'matrix_strength', label: 'Matrix Strength', low_impact: -8.2, high_impact: 9.5, baseline: 50, unit: 'MPa' },
  { parameter: 'winding_angle', label: 'Winding Angle', low_impact: -5.0, high_impact: 7.2, baseline: 55, unit: '°' },
  { parameter: 'layer_thickness', label: 'Layer Thickness', low_impact: -3.5, high_impact: 4.8, baseline: 0.3, unit: 'mm' },
];

describe('TornadoChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the chart container', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render default title', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByText('Sensitivity Analysis')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<TornadoChart data={mockData} title="Custom Title" />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render bar chart by default', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should render chart controls', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByTestId('chart-controls')).toBeInTheDocument();
    });

    it('should display sorting info', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByText(/Sorted by:/)).toBeInTheDocument();
      expect(screen.getByText('Impact Magnitude')).toBeInTheDocument();
    });

    it('should display color legend elements', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByText('Negative Impact')).toBeInTheDocument();
      expect(screen.getByText('Positive Impact')).toBeInTheDocument();
    });
  });

  describe('Data Processing', () => {
    it('should sort data by magnitude when sortByMagnitude is true', () => {
      render(<TornadoChart data={mockData} sortByMagnitude={true} />);

      // Top influential parameters should show fiber tension first (highest magnitude)
      const topParams = screen.getByText(/Top \d+ Most Influential Parameters/);
      expect(topParams).toBeInTheDocument();

      // First parameter should be Fiber Tension (magnitude: 28.3)
      expect(screen.getByText(/1\. Fiber Tension/)).toBeInTheDocument();
    });

    it('should display sorted text when sortByMagnitude is true', () => {
      render(<TornadoChart data={mockData} sortByMagnitude={true} />);

      expect(screen.getByText('Impact Magnitude')).toBeInTheDocument();
    });

    it('should display sorted text when sortByMagnitude is false', () => {
      render(<TornadoChart data={mockData} sortByMagnitude={false} />);

      expect(screen.getByText('Parameter Order')).toBeInTheDocument();
    });

    it('should display parameter swing values', () => {
      render(<TornadoChart data={mockData} />);

      // Swing value for Fiber Tension: |15.8 - (-12.5)| = 28.3
      expect(screen.getByText(/28\.3/)).toBeInTheDocument();
    });
  });

  describe('Chart Type Switching', () => {
    it('should render bar chart by default', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should switch to line chart when type changes', () => {
      render(<TornadoChart data={mockData} />);

      const chartTypeBtn = screen.getByTestId('chart-type-btn');
      fireEvent.click(chartTypeBtn);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should show correct chart type in button', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByTestId('chart-type-btn')).toHaveTextContent('bar');
    });
  });

  describe('Color Modes', () => {
    it('should start with default color mode', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByTestId('color-mode-btn')).toHaveTextContent('default');
    });

    it('should not show color scale legend in default mode', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.queryByTestId('color-scale-legend')).not.toBeInTheDocument();
    });

    it('should switch to gradient color mode', () => {
      render(<TornadoChart data={mockData} />);

      const colorModeBtn = screen.getByTestId('color-mode-btn');
      fireEvent.click(colorModeBtn);

      // After click, should show color scale legend
      expect(screen.getByTestId('color-scale-legend')).toBeInTheDocument();
    });

    it('should show color scale legend in gradient mode', () => {
      render(<TornadoChart data={mockData} />);

      // Switch to gradient mode
      fireEvent.click(screen.getByTestId('color-mode-btn'));

      const legend = screen.getByTestId('color-scale-legend');
      expect(legend).toHaveAttribute('data-unit', '%');
    });

    it('should display cells with fill colors', () => {
      render(<TornadoChart data={mockData} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Chart Controls', () => {
    it('should toggle grid visibility', () => {
      render(<TornadoChart data={mockData} />);

      const gridBtn = screen.getByTestId('toggle-grid-btn');
      expect(gridBtn).toHaveTextContent('Grid: ON');

      fireEvent.click(gridBtn);
      expect(gridBtn).toHaveTextContent('Grid: OFF');
    });

    it('should toggle legend visibility', () => {
      render(<TornadoChart data={mockData} />);

      const legendBtn = screen.getByTestId('toggle-legend-btn');
      expect(legendBtn).toHaveTextContent('Legend: ON');

      fireEvent.click(legendBtn);
      expect(legendBtn).toHaveTextContent('Legend: OFF');
    });

    it('should have highlight top selector', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByText('Highlight top:')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should change highlight count', () => {
      render(<TornadoChart data={mockData} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '5' } });

      expect(select).toHaveValue('5');
    });

    it('should have available highlight options', () => {
      render(<TornadoChart data={mockData} />);

      const select = screen.getByRole('combobox');
      const options = select.querySelectorAll('option');

      expect(options.length).toBe(5); // 1, 2, 3, 5, 10
    });
  });

  describe('Export Functionality', () => {
    it('should render export buttons when onExport provided', () => {
      const mockOnExport = vi.fn();
      render(<TornadoChart data={mockData} onExport={mockOnExport} />);

      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('SVG')).toBeInTheDocument();
    });

    it('should call onExport with png format', () => {
      const mockOnExport = vi.fn();
      render(<TornadoChart data={mockData} onExport={mockOnExport} />);

      fireEvent.click(screen.getByText('PNG'));

      expect(mockOnExport).toHaveBeenCalledWith('png');
    });

    it('should call onExport with svg format', () => {
      const mockOnExport = vi.fn();
      render(<TornadoChart data={mockData} onExport={mockOnExport} />);

      fireEvent.click(screen.getByText('SVG'));

      expect(mockOnExport).toHaveBeenCalledWith('svg');
    });

    it('should not render export buttons without onExport', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.queryByText('PNG')).not.toBeInTheDocument();
      expect(screen.queryByText('SVG')).not.toBeInTheDocument();
    });
  });

  describe('Threshold', () => {
    it('should render threshold reference lines when threshold provided', () => {
      render(<TornadoChart data={mockData} threshold={10} />);

      // Reference lines are rendered (baseline + 2 threshold lines)
      const refLines = screen.getAllByTestId('reference-line');
      expect(refLines.length).toBeGreaterThanOrEqual(1);
    });

    it('should show threshold label', () => {
      render(<TornadoChart data={mockData} threshold={10} />);

      const refLines = screen.getAllByTestId('reference-line');
      const thresholdLine = refLines.find(line => line.getAttribute('data-label') === 'Threshold');
      expect(thresholdLine).toBeTruthy();
    });
  });

  describe('Top Parameters Panel', () => {
    it('should display top influential parameters section', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByText(/Top \d+ Most Influential Parameters/)).toBeInTheDocument();
    });

    it('should show ranked parameters', () => {
      render(<TornadoChart data={mockData} />);

      expect(screen.getByText(/1\./)).toBeInTheDocument();
    });

    it('should show swing values for top parameters', () => {
      render(<TornadoChart data={mockData} />);

      const swings = screen.getAllByText(/Swing:/);
      expect(swings.length).toBeGreaterThan(0);
    });
  });

  describe('Axes', () => {
    it('should render X axis with impact label', () => {
      render(<TornadoChart data={mockData} />);

      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('data-label', 'Impact on Output (%)');
    });

    it('should render Y axis with parameter key', () => {
      render(<TornadoChart data={mockData} />);

      const yAxis = screen.getByTestId('y-axis');
      expect(yAxis).toHaveAttribute('data-key', 'parameter');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      render(<TornadoChart data={[]} />);

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '0');
    });

    it('should handle single data point', () => {
      const singleData: SensitivityParameter[] = [
        { parameter: 'test', label: 'Test', low_impact: -5, high_impact: 5, baseline: 10 },
      ];

      render(<TornadoChart data={singleData} />);

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '1');
    });

    it('should handle data without unit', () => {
      const noUnitData: SensitivityParameter[] = [
        { parameter: 'ratio', label: 'Ratio', low_impact: -0.1, high_impact: 0.2, baseline: 1.0 },
      ];

      render(<TornadoChart data={noUnitData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should handle very large values', () => {
      const largeData: SensitivityParameter[] = [
        { parameter: 'large', label: 'Large Value', low_impact: -1000, high_impact: 2000, baseline: 50000, unit: 'N' },
      ];

      render(<TornadoChart data={largeData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
});
