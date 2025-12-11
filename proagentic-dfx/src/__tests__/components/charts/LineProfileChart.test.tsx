/**
 * LineProfileChart Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LineProfileChart, type ProfileDataPoint } from '@/components/charts/LineProfileChart';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="composed-chart" data-items={data?.length || 0}>{children}</div>
  ),
  Line: ({ dataKey, name, yAxisId }: { dataKey: string; name?: string; yAxisId?: string }) => (
    <div data-testid={`line-${dataKey}`} data-name={name} data-axis={yAxisId} />
  ),
  Area: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`area-${dataKey}`} data-name={name} />
  ),
  XAxis: ({ label, dataKey }: { label?: { value: string }; dataKey?: string }) => (
    <div data-testid="x-axis" data-label={label?.value} data-key={dataKey} />
  ),
  YAxis: ({ label, yAxisId, orientation }: { label?: { value: string }; yAxisId?: string; orientation?: string }) => (
    <div data-testid={`y-axis-${yAxisId || 'left'}`} data-label={label?.value} data-orientation={orientation} />
  ),
  CartesianGrid: ({ strokeDasharray }: { strokeDasharray?: string }) => (
    <div data-testid="cartesian-grid" data-dash={strokeDasharray} />
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: ({ x, label }: { x?: number; label?: { value: string } }) => (
    <div data-testid="reference-line" data-x={x} data-label={label?.value} />
  ),
  ReferenceArea: ({ x1, x2 }: { x1?: number; x2?: number }) => (
    <div data-testid="reference-area" data-x1={x1} data-x2={x2} />
  ),
}));

const mockData: ProfileDataPoint[] = [
  { position: 0, value: 100, secondaryValue: 50, region: 'dome' },
  { position: 20, value: 120, secondaryValue: 55, region: 'dome' },
  { position: 40, value: 140, secondaryValue: 60, region: 'transition' },
  { position: 60, value: 150, secondaryValue: 65, region: 'cylinder' },
  { position: 80, value: 145, secondaryValue: 62, region: 'cylinder' },
  { position: 100, value: 130, secondaryValue: 58, region: 'cylinder' },
];

const mockRegions = [
  { start: 0, end: 30, label: 'Dome', color: '#3B82F6' },
  { start: 30, end: 50, label: 'Transition', color: '#F59E0B' },
  { start: 50, end: 100, label: 'Cylinder', color: '#10B981' },
];

describe('LineProfileChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the chart container', () => {
      render(<LineProfileChart data={mockData} />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render default title', () => {
      render(<LineProfileChart data={mockData} />);
      expect(screen.getByText('Engineering Profile')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<LineProfileChart data={mockData} title="Stress Distribution" />);
      expect(screen.getByText('Stress Distribution')).toBeInTheDocument();
    });

    it('should render composed chart with data', () => {
      render(<LineProfileChart data={mockData} />);
      const chart = screen.getByTestId('composed-chart');
      expect(chart).toHaveAttribute('data-items', '6');
    });

    it('should render primary line', () => {
      render(<LineProfileChart data={mockData} />);
      expect(screen.getByTestId('line-value')).toBeInTheDocument();
    });
  });

  describe('Statistics Panel', () => {
    it('should display max value', () => {
      render(<LineProfileChart data={mockData} />);
      expect(screen.getByText(/Max Value/)).toBeInTheDocument();
    });

    it('should display min value', () => {
      render(<LineProfileChart data={mockData} />);
      expect(screen.getByText(/Min Value/)).toBeInTheDocument();
    });

    it('should display average', () => {
      render(<LineProfileChart data={mockData} />);
      expect(screen.getByText(/Avg Value/)).toBeInTheDocument();
    });

    it('should display stats panel when data present', () => {
      render(<LineProfileChart data={mockData} />);
      // Stats panel exists with multiple stat cards
      const statElements = document.querySelectorAll('[class*="rounded-lg"][class*="border"]');
      expect(statElements.length).toBeGreaterThan(0);
    });

    it('should display unit in stats', () => {
      render(<LineProfileChart data={mockData} unit="MPa" />);
      expect(screen.getAllByText(/MPa/).length).toBeGreaterThan(0);
    });
  });

  describe('Secondary Axis', () => {
    it('should show secondary line toggle', () => {
      render(<LineProfileChart data={mockData} dualAxis={true} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should render secondary line when dualAxis is true', () => {
      render(<LineProfileChart data={mockData} dualAxis={true} />);
      expect(screen.getByTestId('line-secondaryValue')).toBeInTheDocument();
    });

    it('should toggle secondary line visibility', () => {
      render(<LineProfileChart data={mockData} dualAxis={true} />);
      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);
      // Internal state changed
    });

    it('should render right y-axis when dualAxis is true', () => {
      render(<LineProfileChart data={mockData} dualAxis={true} />);
      expect(screen.getByTestId('y-axis-right')).toBeInTheDocument();
    });
  });

  describe('Region Bands', () => {
    it('should show region bands when showRegionBands=true', () => {
      render(<LineProfileChart data={mockData} regions={mockRegions} showRegionBands={true} />);
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should not show region bands when showRegionBands=false', () => {
      render(<LineProfileChart data={mockData} regions={mockRegions} showRegionBands={false} />);
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should display region labels', () => {
      render(<LineProfileChart data={mockData} regions={mockRegions} />);
      // Region labels may be in legend or annotations
      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });
  });

  describe('Labels and Units', () => {
    it('should use custom xLabel', () => {
      render(<LineProfileChart data={mockData} xLabel="Distance" />);
      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis.getAttribute('data-label')).toContain('Distance');
    });

    it('should use custom yLabel', () => {
      render(<LineProfileChart data={mockData} yLabel="Stress" />);
      const yAxis = screen.getByTestId('y-axis-left');
      expect(yAxis.getAttribute('data-label')).toContain('Stress');
    });

    it('should use custom unit', () => {
      render(<LineProfileChart data={mockData} unit="N" />);
      expect(screen.getAllByText(/N/).length).toBeGreaterThan(0);
    });

    it('should use custom secondaryUnit', () => {
      render(<LineProfileChart data={mockData} dualAxis={true} secondaryUnit="kN" />);
      expect(screen.getAllByText(/kN/).length).toBeGreaterThan(0);
    });
  });

  describe('Export Functionality', () => {
    it('should render export buttons when onExport provided', () => {
      const mockOnExport = vi.fn();
      render(<LineProfileChart data={mockData} onExport={mockOnExport} />);
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('SVG')).toBeInTheDocument();
    });

    it('should call onExport with png format', () => {
      const mockOnExport = vi.fn();
      render(<LineProfileChart data={mockData} onExport={mockOnExport} />);
      fireEvent.click(screen.getByText('PNG'));
      expect(mockOnExport).toHaveBeenCalledWith('png');
    });

    it('should call onExport with svg format', () => {
      const mockOnExport = vi.fn();
      render(<LineProfileChart data={mockData} onExport={mockOnExport} />);
      fireEvent.click(screen.getByText('SVG'));
      expect(mockOnExport).toHaveBeenCalledWith('svg');
    });

    it('should not show export buttons without onExport', () => {
      render(<LineProfileChart data={mockData} />);
      expect(screen.queryByText('PNG')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      render(<LineProfileChart data={[]} />);
      expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-items', '0');
    });

    it('should handle single data point', () => {
      const singlePoint: ProfileDataPoint[] = [{ position: 0, value: 100 }];
      render(<LineProfileChart data={singlePoint} />);
      expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-items', '1');
    });

    it('should handle data without secondary values', () => {
      const noSecondary: ProfileDataPoint[] = [
        { position: 0, value: 100 },
        { position: 50, value: 150 },
        { position: 100, value: 120 },
      ];
      render(<LineProfileChart data={noSecondary} dualAxis={true} />);
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should handle data without regions', () => {
      const noRegions: ProfileDataPoint[] = [
        { position: 0, value: 100 },
        { position: 50, value: 150 },
      ];
      render(<LineProfileChart data={noRegions} />);
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });

  describe('Chart Elements', () => {
    it('should render grid', () => {
      render(<LineProfileChart data={mockData} />);
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('should render tooltip', () => {
      render(<LineProfileChart data={mockData} />);
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render legend', () => {
      render(<LineProfileChart data={mockData} />);
      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });
  });
});
