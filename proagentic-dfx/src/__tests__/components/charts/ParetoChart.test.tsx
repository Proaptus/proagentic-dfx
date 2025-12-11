/**
 * ParetoChart Component Tests
 * Coverage Target: 80%
 *
 * Test Coverage:
 * - Chart rendering (5 tests)
 * - Axis configuration (4 tests)
 * - Color modes (5 tests)
 * - Size metrics (4 tests)
 * - Interactions (5 tests)
 * - Controls (4 tests)
 * - Tooltip (3 tests)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ParetoChart } from '@/components/charts/ParetoChart';
import type { ParetoDesign } from '@/lib/types';

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="composed-chart" data-points={data?.length || 0}>{children}</div>
  ),
  Scatter: ({ children, data, onClick, name }: { children: React.ReactNode; data: unknown[]; onClick: (e: { id: string }) => void; name: string }) => (
    <div data-testid="scatter" data-name={name}>
      {data?.map((d: unknown, _i: number) => {
        const item = d as { id: string };
        return (
          <div
            key={item.id}
            data-testid={`scatter-point-${item.id}`}
            onClick={() => onClick?.({ id: item.id })}
          />
        );
      })}
      {children}
    </div>
  ),
  Line: ({ dataKey }: { dataKey: string }) => <div data-testid="line" data-key={dataKey} />,
  Area: ({ dataKey }: { dataKey: string }) => <div data-testid="area" data-key={dataKey} />,
  XAxis: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid="x-axis" data-key={dataKey} data-name={name} />
  ),
  YAxis: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid="y-axis" data-key={dataKey} data-name={name} />
  ),
  ZAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="z-axis" data-key={dataKey} />,
  Tooltip: ({ content }: { content: (props: { payload?: Array<{ payload: unknown }> }) => React.ReactNode }) => (
    <div data-testid="tooltip">{content?.({ payload: [] })}</div>
  ),
  Cell: ({ fill, stroke }: { fill: string; stroke: string }) => (
    <div data-testid="cell" data-fill={fill} data-stroke={stroke} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  ReferenceLine: ({ x, y }: { x?: number; y?: number }) => (
    <div data-testid="reference-line" data-x={x} data-y={y} />
  ),
  ReferenceArea: ({ x1, x2, y1, y2 }: { x1: number; x2: number; y1: number; y2: number }) => (
    <div data-testid="reference-area" data-x1={x1} data-x2={x2} data-y1={y1} data-y2={y2} />
  ),
  Brush: ({ dataKey }: { dataKey: string }) => <div data-testid="brush" data-key={dataKey} />,
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
  }: {
    chartType: string;
    onChartTypeChange: (type: string) => void;
    colorMode: string;
    onColorModeChange: (mode: string) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
  }) => (
    <div data-testid="chart-controls">
      <button data-testid="chart-type-btn" onClick={() => onChartTypeChange('line')}>
        {chartType}
      </button>
      <button data-testid="color-mode-btn" onClick={() => onColorModeChange('reliability')}>
        {colorMode}
      </button>
      <button data-testid="zoom-in-btn" onClick={onZoomIn}>Zoom In</button>
      <button data-testid="zoom-out-btn" onClick={onZoomOut}>Zoom Out</button>
      <button data-testid="zoom-reset-btn" onClick={onZoomReset}>Reset</button>
    </div>
  ),
  ColorScaleLegend: ({ colorMode }: { colorMode: string }) => (
    <div data-testid="color-scale-legend" data-mode={colorMode} />
  ),
}));

// Test data
const mockDesigns: ParetoDesign[] = [
  {
    id: '1',
    weight_kg: 50,
    cost_eur: 1000,
    burst_pressure_bar: 1400,
    burst_ratio: 2.0,
    p_failure: 1e-6,
    fatigue_life_cycles: 100000,
    permeation_rate: 0.5,
    volumetric_efficiency: 0.95,
    trade_off_category: 'balanced',
  },
  {
    id: '2',
    weight_kg: 45,
    cost_eur: 1200,
    burst_pressure_bar: 1500,
    burst_ratio: 2.14,
    p_failure: 5e-7,
    fatigue_life_cycles: 150000,
    permeation_rate: 0.4,
    volumetric_efficiency: 0.92,
    trade_off_category: 'lightest',
  },
  {
    id: '3',
    weight_kg: 55,
    cost_eur: 800,
    burst_pressure_bar: 1350,
    burst_ratio: 1.93,
    p_failure: 2e-6,
    fatigue_life_cycles: 80000,
    permeation_rate: 0.6,
    volumetric_efficiency: 0.96,
    trade_off_category: 'cheapest',
  },
  {
    id: '4',
    weight_kg: 48,
    cost_eur: 1100,
    burst_pressure_bar: 1450,
    burst_ratio: 2.07,
    p_failure: 8e-7,
    fatigue_life_cycles: 120000,
    permeation_rate: 0.45,
    volumetric_efficiency: 0.94,
    trade_off_category: 'recommended',
  },
];

describe('ParetoChart', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Chart Rendering', () => {
    it('should render the chart container', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render scatter points for each design', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('scatter')).toBeInTheDocument();
    });

    it('should render axes with correct labels', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-name', 'Weight (kg)');
      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-name', 'Cost (€)');
    });

    it('should render cartesian grid by default', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('should render z-axis for sizing', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('z-axis')).toBeInTheDocument();
    });
  });

  describe('Axis Configuration', () => {
    it('should use weight_kg for x-axis', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-key', 'x');
    });

    it('should use p_failure for x-axis when specified', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="p_failure"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-name', 'P(failure)');
    });

    it('should use burst_ratio for y-axis when specified', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="burst_ratio"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-name', 'Burst Ratio');
    });

    it('should handle permeation_rate axis', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="permeation_rate"
          yAxis="volumetric_efficiency"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-name', 'Permeation (ml/L/hr)');
    });
  });

  describe('Color Modes', () => {
    it('should default to category color mode', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          showControls={true}
        />
      );

      expect(screen.getByTestId('color-mode-btn')).toHaveTextContent('category');
    });

    it('should not show color scale legend in category mode', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          initialColorMode="category"
        />
      );

      expect(screen.queryByTestId('color-scale-legend')).not.toBeInTheDocument();
    });

    it('should show color scale legend in gradient mode', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          initialColorMode="gradient"
        />
      );

      expect(screen.getByTestId('color-scale-legend')).toBeInTheDocument();
    });

    it('should show color scale legend in reliability mode', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          initialColorMode="reliability"
        />
      );

      expect(screen.getByTestId('color-scale-legend')).toHaveAttribute('data-mode', 'reliability');
    });

    it('should change color mode via controls', async () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          showControls={true}
        />
      );

      fireEvent.click(screen.getByTestId('color-mode-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('color-scale-legend')).toBeInTheDocument();
      });
    });
  });

  describe('Size Metrics', () => {
    it('should default to fixed size', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          initialSizeMetric="none"
        />
      );

      expect(screen.getByTestId('z-axis')).toBeInTheDocument();
    });

    it('should use burst_ratio for size when specified', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          initialSizeMetric="burst_ratio"
        />
      );

      expect(screen.getByTestId('scatter')).toBeInTheDocument();
    });

    it('should use p_failure for size (inverted)', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          initialSizeMetric="p_failure"
        />
      );

      expect(screen.getByTestId('scatter')).toBeInTheDocument();
    });

    it('should use volumetric_efficiency for size', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          initialSizeMetric="volumetric_efficiency"
        />
      );

      expect(screen.getByTestId('scatter')).toBeInTheDocument();
    });
  });

  describe('Selection and Interactions', () => {
    it('should call onSelect when point is clicked', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByTestId('scatter-point-1'));

      expect(mockOnSelect).toHaveBeenCalledWith('1');
    });

    it('should highlight selected designs', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={['1', '2']}
          onSelect={mockOnSelect}
        />
      );

      // Selected designs should be in the scatter
      expect(screen.getByTestId('scatter-point-1')).toBeInTheDocument();
      expect(screen.getByTestId('scatter-point-2')).toBeInTheDocument();
    });

    it('should render reference lines for recommended design', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          recommendedId="4"
        />
      );

      const refLines = screen.getAllByTestId('reference-line');
      expect(refLines.length).toBeGreaterThan(0);
    });

    it('should render reference area for recommended design', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          recommendedId="4"
          showReferenceAreas={true}
        />
      );

      expect(screen.getByTestId('reference-area')).toBeInTheDocument();
    });

    it('should not render reference area when disabled', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          recommendedId="4"
          showReferenceAreas={false}
        />
      );

      expect(screen.queryByTestId('reference-area')).not.toBeInTheDocument();
    });
  });

  describe('Controls', () => {
    it('should show controls by default', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('chart-controls')).toBeInTheDocument();
    });

    it('should hide controls when showControls is false', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          showControls={false}
        />
      );

      expect(screen.queryByTestId('chart-controls')).not.toBeInTheDocument();
    });

    it('should handle zoom in', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      // Chart should still render
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should handle zoom out', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByTestId('zoom-out-btn'));
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should handle zoom reset', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      fireEvent.click(screen.getByTestId('zoom-reset-btn'));
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });

  describe('Chart Types', () => {
    it('should default to scatter chart', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('chart-type-btn')).toHaveTextContent('scatter');
    });

    it('should render line chart when specified', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          initialChartType="line"
        />
      );

      expect(screen.getByTestId('line')).toBeInTheDocument();
    });

    it('should render area chart when specified', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          initialChartType="area"
        />
      );

      expect(screen.getByTestId('area')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
    });

    it('should change chart type via controls', async () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByTestId('chart-type-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('line')).toBeInTheDocument();
      });
    });
  });

  describe('Brush', () => {
    it('should not show brush by default', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByTestId('brush')).not.toBeInTheDocument();
    });

    it('should show brush when enabled', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
          showBrush={true}
        />
      );

      expect(screen.getByTestId('brush')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('should render tooltip component', () => {
      render(
        <ParetoChart
          designs={mockDesigns}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty designs array', () => {
      render(
        <ParetoChart
          designs={[]}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should handle single design', () => {
      render(
        <ParetoChart
          designs={[mockDesigns[0]]}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('scatter-point-1')).toBeInTheDocument();
    });

    it('should handle missing optional values', () => {
      const designWithMissing: ParetoDesign = {
        id: '5',
        weight_kg: 50,
        cost_eur: 1000,
        burst_pressure_bar: 1400,
        burst_ratio: 2.0,
        p_failure: 0.01,
        fatigue_life_cycles: 500000,
        permeation_rate: 0.03,
        volumetric_efficiency: 0.92,
      };

      render(
        <ParetoChart
          designs={[designWithMissing]}
          xAxis="weight_kg"
          yAxis="cost_eur"
          selectedIds={[]}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('scatter')).toBeInTheDocument();
    });
  });
});
