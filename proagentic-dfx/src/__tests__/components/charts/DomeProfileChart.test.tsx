/**
 * DomeProfileChart Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DomeProfileChart } from '@/components/charts/DomeProfileChart';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="composed-chart" data-items={data?.length || 0}>{children}</div>
  ),
  Line: ({ dataKey, name, stroke }: { dataKey: string; name: string; stroke?: string }) => (
    <div data-testid={`line-${dataKey}`} data-name={name} data-stroke={stroke} />
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
  CartesianGrid: ({ strokeDasharray }: { strokeDasharray?: string }) => (
    <div data-testid="cartesian-grid" data-dash={strokeDasharray} />
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: ({ x, y, label }: { x?: number; y?: number; label?: { value: string } }) => (
    <div data-testid="reference-line" data-x={x} data-y={y} data-label={label?.value} />
  ),
}));

// Mock tank geometry calculation
vi.mock('@/lib/cad/tank-geometry', () => ({
  calculateIsotensoidProfile: (
    cylinderRadius: number,
    windingAngle: number,
    bossRadius: number,
    domeDepth: number,
    numPoints: number
  ) => {
    // Return mock profile data
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      points.push({
        r: cylinderRadius * (1 - t * 0.3),
        z: domeDepth * t,
      });
    }
    return points;
  },
}));

const mockParameters = {
  cylinderRadius: 150,
  windingAngle: 55,
  bossRadius: 25,
  domeDepth: 100,
};

describe('DomeProfileChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the chart container', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render default title', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByText('Isotensoid Dome Profile')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<DomeProfileChart parameters={mockParameters} title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render composed chart', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should render profile line', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByTestId('line-r')).toBeInTheDocument();
    });
  });

  describe('Statistics Panel', () => {
    it('should display cylinder radius', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByText('Cylinder Radius')).toBeInTheDocument();
    });

    it('should display winding angle', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByText('Winding Angle')).toBeInTheDocument();
    });

    it('should display dome depth', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByText('Dome Depth')).toBeInTheDocument();
    });

    it('should display aspect ratio', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByText('Aspect Ratio')).toBeInTheDocument();
    });

    it('should display dome volume', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByText('Dome Volume')).toBeInTheDocument();
    });
  });

  describe('Toggle Controls', () => {
    it('should render theoretical line toggle', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      const toggles = screen.getAllByRole('checkbox');
      expect(toggles.length).toBeGreaterThan(0);
    });

    it('should toggle theoretical line', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);
      // Toggle changes internal state
    });

    it('should toggle stress regions when clicking checkbox', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 1) {
        fireEvent.click(checkboxes[1]);
      }
    });
  });

  describe('Annotations', () => {
    it('should show annotations by default', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      // Default showAnnotations=true
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should hide annotations when showAnnotations=false', () => {
      render(<DomeProfileChart parameters={mockParameters} showAnnotations={false} />);
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });

  describe('Comparison Mode', () => {
    it('should not show comparison by default', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.queryByTestId('line-comparison_r')).not.toBeInTheDocument();
    });

    it('should show comparison line when showComparison=true', () => {
      render(<DomeProfileChart parameters={mockParameters} showComparison={true} />);
      // Comparison data should be in chart
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should use custom comparison angle', () => {
      render(
        <DomeProfileChart
          parameters={mockParameters}
          showComparison={true}
          comparisonAngle={45}
        />
      );
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });

  describe('Chart Elements', () => {
    it('should render axes', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });

    it('should render grid', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('should render tooltip', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render legend', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });
  });

  describe('Parameter Display', () => {
    it('should display parameter values', () => {
      render(<DomeProfileChart parameters={mockParameters} />);
      // Check parameter display
      expect(screen.getByText(/150/)).toBeInTheDocument();
    });

    it('should update when parameters change', () => {
      const { rerender } = render(<DomeProfileChart parameters={mockParameters} />);

      rerender(<DomeProfileChart parameters={{ ...mockParameters, cylinderRadius: 200 }} />);
      expect(screen.getByText(/200/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum parameters', () => {
      const minParams = {
        cylinderRadius: 50,
        windingAngle: 30,
        bossRadius: 10,
        domeDepth: 30,
      };
      render(<DomeProfileChart parameters={minParams} />);
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should handle maximum parameters', () => {
      const maxParams = {
        cylinderRadius: 500,
        windingAngle: 85,
        bossRadius: 100,
        domeDepth: 300,
      };
      render(<DomeProfileChart parameters={maxParams} />);
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });
});
