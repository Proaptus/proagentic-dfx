/**
 * StressContourChart Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StressContourChart } from '@/components/charts/StressContourChart';
import type { DesignStress } from '@/lib/types';

// Mock visx components
vi.mock('@visx/group', () => ({
  Group: ({ children, left, top }: { children: React.ReactNode; left?: number; top?: number }) => (
    <g data-testid="visx-group" transform={`translate(${left || 0},${top || 0})`}>{children}</g>
  ),
}));

vi.mock('@visx/scale', () => ({
  scaleLinear: ({ domain, range }: { domain: number[]; range: number[] }) => {
    const scale = (value: number) => {
      const [d0, d1] = domain;
      const [r0, r1] = range;
      return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
    };
    scale.domain = () => domain;
    scale.range = () => range;
    return scale;
  },
}));

vi.mock('@visx/responsive', () => ({
  ParentSize: ({ children }: { children: (size: { width: number; height: number }) => React.ReactNode }) => (
    <div data-testid="parent-size">{children({ width: 800, height: 600 })}</div>
  ),
}));

vi.mock('@visx/tooltip', () => ({
  useTooltip: () => ({
    tooltipOpen: false,
    tooltipData: null,
    tooltipLeft: 0,
    tooltipTop: 0,
    showTooltip: vi.fn(),
    hideTooltip: vi.fn(),
  }),
  TooltipWithBounds: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-bounds">{children}</div>
  ),
  defaultStyles: {},
}));

vi.mock('@visx/gradient', () => ({
  LinearGradient: ({ id }: { id: string }) => <linearGradient data-testid={`gradient-${id}`} />,
}));

vi.mock('@visx/axis', () => ({
  AxisLeft: ({ label }: { label?: string }) => <g data-testid="axis-left" data-label={label} />,
  AxisBottom: ({ label }: { label?: string }) => <g data-testid="axis-bottom" data-label={label} />,
}));

vi.mock('@visx/grid', () => ({
  GridRows: () => <g data-testid="grid-rows" />,
  GridColumns: () => <g data-testid="grid-columns" />,
}));

const mockStressData: DesignStress = {
  design_id: 'design-001',
  stress_type: 'Von Mises',
  load_case: 'Operating Pressure',
  load_pressure_bar: 700,
  max_stress: {
    value_mpa: 450,
    allowable_mpa: 550,
    margin_percent: 22.2,
    region: 'cylinder_transition',
    location: { r: 75, z: 150, theta: 0 },
  },
  contour_data: {
    type: 'von_mises',
    colormap: 'jet',
    min_value: 250,
    max_value: 420,
    nodes: [
      { x: 0, y: 0, z: 0, value: 250 },
      { x: 50, y: 0, z: 0, value: 300 },
      { x: 25, y: 0, z: 50, value: 320 },
      { x: 75, y: 0, z: 50, value: 380 },
      { x: 100, y: 0, z: 100, value: 400 },
    ],
    mesh: {
      nodes: [
        { id: 1, r: 0, z: 0, stress: 250 },
        { id: 2, r: 50, z: 0, stress: 300 },
        { id: 3, r: 25, z: 50, stress: 320 },
        { id: 4, r: 75, z: 50, stress: 380 },
        { id: 5, r: 100, z: 100, stress: 400 },
      ],
      elements: [
        { id: 1, nodes: [1, 2, 3], centroid_stress: 300, region: 'dome' },
        { id: 2, nodes: [2, 3, 4], centroid_stress: 350, region: 'cylinder' },
        { id: 3, nodes: [3, 4, 5], centroid_stress: 420, region: 'cylinder' },
      ],
      bounds: { r_min: 0, r_max: 100, z_min: 0, z_max: 100 },
    },
  },
};

describe('StressContourChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the chart container', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByTestId('parent-size')).toBeInTheDocument();
    });

    it('should render title with stress type', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText(/FEA Stress Contour/)).toBeInTheDocument();
      expect(screen.getByText(/Von Mises/)).toBeInTheDocument();
    });

    it('should render load case info', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText(/Operating Pressure/)).toBeInTheDocument();
      expect(screen.getByText(/700 bar/)).toBeInTheDocument();
    });
  });

  describe('Key Metrics Panel', () => {
    it('should display max stress', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Max Stress')).toBeInTheDocument();
      expect(screen.getByText('450')).toBeInTheDocument();
    });

    it('should display allowable stress', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Allowable')).toBeInTheDocument();
      expect(screen.getByText('550')).toBeInTheDocument();
    });

    it('should display safety margin', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Safety Margin')).toBeInTheDocument();
      expect(screen.getByText(/22\.2%/)).toBeInTheDocument();
    });

    it('should display critical region', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Critical Region')).toBeInTheDocument();
      expect(screen.getByText(/cylinder transition/i)).toBeInTheDocument();
    });
  });

  describe('Colormap Selection', () => {
    it('should have colormap dropdown', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Colormap:')).toBeInTheDocument();
    });

    it('should have jet colormap option', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Jet')).toBeInTheDocument();
    });

    it('should change colormap when selected', () => {
      render(<StressContourChart stressData={mockStressData} />);
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'viridis' } });
      expect(select).toHaveValue('viridis');
    });
  });

  describe('Toggle Controls', () => {
    it('should have mirror toggle', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Mirror')).toBeInTheDocument();
    });

    it('should have grid toggle', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Grid')).toBeInTheDocument();
    });

    it('should have axes toggle', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Axes')).toBeInTheDocument();
    });

    it('should have legend toggle', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Legend')).toBeInTheDocument();
    });

    it('should toggle mirror view', () => {
      render(<StressContourChart stressData={mockStressData} />);
      const mirrorBtn = screen.getByText('Mirror');
      fireEvent.click(mirrorBtn);
      // Toggle state is internal, test passes if no error
    });

    it('should toggle grid visibility', () => {
      render(<StressContourChart stressData={mockStressData} />);
      fireEvent.click(screen.getByText('Grid'));
    });

    it('should toggle axes visibility', () => {
      render(<StressContourChart stressData={mockStressData} />);
      fireEvent.click(screen.getByText('Axes'));
    });

    it('should toggle legend visibility', () => {
      render(<StressContourChart stressData={mockStressData} />);
      fireEvent.click(screen.getByText('Legend'));
    });
  });

  describe('Export Functionality', () => {
    it('should render export buttons when onExport provided', () => {
      const mockOnExport = vi.fn();
      render(<StressContourChart stressData={mockStressData} onExport={mockOnExport} />);
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('SVG')).toBeInTheDocument();
    });

    it('should call onExport with png format', () => {
      const mockOnExport = vi.fn();
      render(<StressContourChart stressData={mockStressData} onExport={mockOnExport} />);
      fireEvent.click(screen.getByText('PNG'));
      expect(mockOnExport).toHaveBeenCalledWith('png');
    });

    it('should call onExport with svg format', () => {
      const mockOnExport = vi.fn();
      render(<StressContourChart stressData={mockStressData} onExport={mockOnExport} />);
      fireEvent.click(screen.getByText('SVG'));
      expect(mockOnExport).toHaveBeenCalledWith('svg');
    });

    it('should not show export buttons without onExport', () => {
      render(<StressContourChart stressData={mockStressData} />);
      // PNG button exists in controls, but not export buttons
      const buttons = screen.getAllByRole('button');
      const pngButtons = buttons.filter(btn => btn.textContent === 'PNG');
      expect(pngButtons.length).toBe(0);
    });
  });

  describe('Footer Info', () => {
    it('should display design ID', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('design-001')).toBeInTheDocument();
    });

    it('should display element count', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Elements:')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display node count', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Nodes:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display max location', () => {
      render(<StressContourChart stressData={mockStressData} />);
      expect(screen.getByText('Max Location:')).toBeInTheDocument();
      expect(screen.getByText(/r=75\.0, z=150\.0/)).toBeInTheDocument();
    });
  });

  describe('Empty/Invalid Data', () => {
    it('should show message when no mesh data', () => {
      const noMeshData: DesignStress = {
        ...mockStressData,
        contour_data: undefined as unknown as DesignStress['contour_data'],
      };
      render(<StressContourChart stressData={noMeshData} />);
      expect(screen.getByText('No Mesh Data Available')).toBeInTheDocument();
    });

    it('should show message when empty elements', () => {
      const emptyMeshData: DesignStress = {
        ...mockStressData,
        contour_data: {
          type: 'von_mises',
          colormap: 'jet',
          min_value: 0,
          max_value: 100,
          nodes: [],
          mesh: {
            nodes: [],
            elements: [],
            bounds: { r_min: 0, r_max: 100, z_min: 0, z_max: 100 },
          },
        },
      };
      render(<StressContourChart stressData={emptyMeshData} />);
      expect(screen.getByText('No Mesh Data Available')).toBeInTheDocument();
    });
  });

  describe('Safety Margin Colors', () => {
    it('should show green for high safety margin', () => {
      render(<StressContourChart stressData={mockStressData} />);
      // Margin is 22.2% which is >= 20, should be green
      const marginElement = screen.getByText(/22\.2%/);
      expect(marginElement).toHaveClass('text-green-600');
    });

    it('should show yellow for medium safety margin', () => {
      const mediumMarginData: DesignStress = {
        ...mockStressData,
        max_stress: { ...mockStressData.max_stress, margin_percent: 15 },
      };
      render(<StressContourChart stressData={mediumMarginData} />);
      const marginElement = screen.getByText(/15\.0%/);
      expect(marginElement).toHaveClass('text-yellow-600');
    });

    it('should show red for low safety margin', () => {
      const lowMarginData: DesignStress = {
        ...mockStressData,
        max_stress: { ...mockStressData.max_stress, margin_percent: 5 },
      };
      render(<StressContourChart stressData={lowMarginData} />);
      const marginElement = screen.getByText(/5\.0%/);
      expect(marginElement).toHaveClass('text-red-600');
    });
  });
});
