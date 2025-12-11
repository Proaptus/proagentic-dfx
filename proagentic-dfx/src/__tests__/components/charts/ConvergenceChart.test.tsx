/**
 * ConvergenceChart Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConvergenceChart, type ConvergenceData } from '@/components/charts/ConvergenceChart';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="line-chart" data-items={data?.length || 0}>{children}</div>
  ),
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="composed-chart" data-items={data?.length || 0}>{children}</div>
  ),
  Line: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`line-${dataKey}`} data-name={name} />
  ),
  Area: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`area-${dataKey}`} data-name={name} />
  ),
  Bar: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`bar-${dataKey}`} data-name={name} />
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
  ReferenceLine: ({ y, label }: { y?: number; label?: { value: string } }) => (
    <div data-testid="reference-line" data-y={y} data-label={label?.value} />
  ),
  Brush: () => <div data-testid="brush" />,
}));

// Mock ChartControls
vi.mock('@/components/charts/ChartControls', () => ({
  ChartControls: ({
    chartType,
    onChartTypeChange,
    colorMode,
    onColorModeChange,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    showGrid,
    onToggleGrid,
    showLegend,
    onToggleLegend,
  }: {
    chartType: string;
    onChartTypeChange: (type: string) => void;
    colorMode: string;
    onColorModeChange: (mode: string) => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onZoomReset?: () => void;
    showGrid: boolean;
    onToggleGrid: () => void;
    showLegend: boolean;
    onToggleLegend: () => void;
  }) => (
    <div data-testid="chart-controls">
      <button data-testid="chart-type-btn" onClick={() => onChartTypeChange('area')}>{chartType}</button>
      <button data-testid="color-mode-btn" onClick={() => onColorModeChange('gradient')}>{colorMode}</button>
      <button data-testid="zoom-in-btn" onClick={onZoomIn}>Zoom In</button>
      <button data-testid="zoom-out-btn" onClick={onZoomOut}>Zoom Out</button>
      <button data-testid="zoom-reset-btn" onClick={onZoomReset}>Reset</button>
      <button data-testid="toggle-grid-btn" onClick={onToggleGrid}>Grid: {showGrid ? 'ON' : 'OFF'}</button>
      <button data-testid="toggle-legend-btn" onClick={onToggleLegend}>Legend: {showLegend ? 'ON' : 'OFF'}</button>
    </div>
  ),
  ColorScaleLegend: ({ colorMode }: { colorMode: string }) => (
    <div data-testid="color-scale-legend" data-mode={colorMode} />
  ),
}));

const mockData: ConvergenceData[] = [
  { generation: 1, best_fitness: 0.5, average_fitness: 0.3, worst_fitness: 0.1, std_dev: 0.15 },
  { generation: 2, best_fitness: 0.55, average_fitness: 0.35, worst_fitness: 0.15, std_dev: 0.14 },
  { generation: 3, best_fitness: 0.6, average_fitness: 0.4, worst_fitness: 0.2, std_dev: 0.13 },
  { generation: 4, best_fitness: 0.65, average_fitness: 0.45, worst_fitness: 0.25, std_dev: 0.12 },
  { generation: 5, best_fitness: 0.7, average_fitness: 0.5, worst_fitness: 0.3, std_dev: 0.11 },
  { generation: 6, best_fitness: 0.72, average_fitness: 0.52, worst_fitness: 0.32, std_dev: 0.1 },
  { generation: 7, best_fitness: 0.73, average_fitness: 0.53, worst_fitness: 0.33, std_dev: 0.09 },
  { generation: 8, best_fitness: 0.735, average_fitness: 0.535, worst_fitness: 0.335, std_dev: 0.08 },
  { generation: 9, best_fitness: 0.738, average_fitness: 0.538, worst_fitness: 0.338, std_dev: 0.07 },
  { generation: 10, best_fitness: 0.74, average_fitness: 0.54, worst_fitness: 0.34, std_dev: 0.06 },
];

describe('ConvergenceChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the chart container', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render default title', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByText('Optimization Convergence')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<ConvergenceChart data={mockData} title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render line chart by default', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should render chart controls', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByTestId('chart-controls')).toBeInTheDocument();
    });

    it('should render metric selector', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Statistics Panel', () => {
    it('should display generations count', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByText('Generations')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should display best fitness', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByText('Best Fitness')).toBeInTheDocument();
    });

    it('should display improvement percentage', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByText('Improvement')).toBeInTheDocument();
    });

    it('should display convergence rate', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByText('Rate')).toBeInTheDocument();
    });

    it('should display convergence status', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Chart Type Switching', () => {
    it('should switch to area chart', () => {
      render(<ConvergenceChart data={mockData} />);
      fireEvent.click(screen.getByTestId('chart-type-btn'));
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should display chart type in button', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByTestId('chart-type-btn')).toHaveTextContent('line');
    });
  });

  describe('Metric Selection', () => {
    it('should have All Metrics option', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByText('All Metrics')).toBeInTheDocument();
    });

    it('should have Best Only option', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByText('Best Only')).toBeInTheDocument();
    });

    it('should change selected metric', () => {
      render(<ConvergenceChart data={mockData} />);
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'best' } });
      expect(select).toHaveValue('best');
    });
  });

  describe('Color Modes', () => {
    it('should start with default color mode', () => {
      render(<ConvergenceChart data={mockData} />);
      expect(screen.getByTestId('color-mode-btn')).toHaveTextContent('default');
    });

    it('should show color scale legend when not default', () => {
      render(<ConvergenceChart data={mockData} />);
      fireEvent.click(screen.getByTestId('color-mode-btn'));
      expect(screen.getByTestId('color-scale-legend')).toBeInTheDocument();
    });
  });

  describe('Zoom Controls', () => {
    it('should call zoom in', () => {
      render(<ConvergenceChart data={mockData} enableZoom={true} />);
      const zoomBtn = screen.getByTestId('zoom-in-btn');
      fireEvent.click(zoomBtn);
      // Zoom state is internal, test passes if no error
    });

    it('should call zoom out', () => {
      render(<ConvergenceChart data={mockData} enableZoom={true} />);
      fireEvent.click(screen.getByTestId('zoom-out-btn'));
    });

    it('should call zoom reset', () => {
      render(<ConvergenceChart data={mockData} enableZoom={true} />);
      fireEvent.click(screen.getByTestId('zoom-reset-btn'));
    });
  });

  describe('Toggle Controls', () => {
    it('should toggle grid', () => {
      render(<ConvergenceChart data={mockData} />);
      const gridBtn = screen.getByTestId('toggle-grid-btn');
      expect(gridBtn).toHaveTextContent('Grid: ON');
      fireEvent.click(gridBtn);
      expect(gridBtn).toHaveTextContent('Grid: OFF');
    });

    it('should toggle legend', () => {
      render(<ConvergenceChart data={mockData} />);
      const legendBtn = screen.getByTestId('toggle-legend-btn');
      expect(legendBtn).toHaveTextContent('Legend: ON');
      fireEvent.click(legendBtn);
      expect(legendBtn).toHaveTextContent('Legend: OFF');
    });
  });

  describe('Real-time Mode', () => {
    it('should show live indicator when realTimeUpdate is true', () => {
      render(<ConvergenceChart data={mockData} realTimeUpdate={true} />);
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should not show live indicator when realTimeUpdate is false', () => {
      render(<ConvergenceChart data={mockData} realTimeUpdate={false} />);
      expect(screen.queryByText('Live')).not.toBeInTheDocument();
    });
  });

  describe('Goal Line', () => {
    it('should render goal reference line when goalValue provided', () => {
      render(<ConvergenceChart data={mockData} goalValue={0.8} />);
      const refLines = screen.getAllByTestId('reference-line');
      const goalLine = refLines.find(line => line.getAttribute('data-label') === 'Goal');
      expect(goalLine).toBeTruthy();
    });
  });

  describe('Export Functionality', () => {
    it('should render export buttons when onExport provided', () => {
      const mockOnExport = vi.fn();
      render(<ConvergenceChart data={mockData} onExport={mockOnExport} />);
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('SVG')).toBeInTheDocument();
    });

    it('should call onExport with png format', () => {
      const mockOnExport = vi.fn();
      render(<ConvergenceChart data={mockData} onExport={mockOnExport} />);
      fireEvent.click(screen.getByText('PNG'));
      expect(mockOnExport).toHaveBeenCalledWith('png');
    });

    it('should call onExport with svg format', () => {
      const mockOnExport = vi.fn();
      render(<ConvergenceChart data={mockData} onExport={mockOnExport} />);
      fireEvent.click(screen.getByText('SVG'));
      expect(mockOnExport).toHaveBeenCalledWith('svg');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      render(<ConvergenceChart data={[]} />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should handle single data point', () => {
      const singleData: ConvergenceData[] = [
        { generation: 1, best_fitness: 0.5, average_fitness: 0.3, worst_fitness: 0.1 },
      ];
      render(<ConvergenceChart data={singleData} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should render without stats panel when data is empty', () => {
      render(<ConvergenceChart data={[]} />);
      expect(screen.queryByText('Generations')).not.toBeInTheDocument();
    });
  });
});
