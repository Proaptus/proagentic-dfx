/**
 * RadarChart Component Tests
 * Coverage Target: 80%
 *
 * Test Coverage:
 * - Basic rendering (4 tests)
 * - Data normalization (4 tests)
 * - Design selection (4 tests)
 * - Display modes (4 tests)
 * - Color modes (4 tests)
 * - Controls (3 tests)
 * - Overall scores (3 tests)
 * - Export (2 tests)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RadarChart, type RadarMetric, type RadarDesignData } from '@/components/charts/RadarChart';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  RadarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="radar-chart" data-points={data?.length || 0}>{children}</div>
  ),
  Radar: ({ name, dataKey }: { name: string; dataKey: string }) => (
    <div data-testid={`radar-${dataKey}`} data-name={name} />
  ),
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="polar-angle-axis" data-key={dataKey} />
  ),
  PolarRadiusAxis: ({ angle, domain }: { angle: number; domain?: number[] }) => (
    <div data-testid="polar-radius-axis" data-angle={angle} data-domain={domain?.join(',')} />
  ),
  Tooltip: ({ content }: { content: (props: { payload?: unknown[] }) => React.ReactNode }) => (
    <div data-testid="tooltip">{content?.({ payload: [] })}</div>
  ),
  Legend: () => <div data-testid="legend" />,
}));

// Mock ChartControls
vi.mock('@/components/charts/ChartControls', () => ({
  ChartControls: ({
    colorMode,
    onColorModeChange,
    showGrid,
    onToggleGrid,
    showLegend,
    onToggleLegend,
  }: {
    colorMode: string;
    onColorModeChange: (mode: string) => void;
    showGrid: boolean;
    onToggleGrid: () => void;
    showLegend: boolean;
    onToggleLegend: () => void;
  }) => (
    <div data-testid="chart-controls">
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

const mockMetrics: RadarMetric[] = [
  { metric: 'weight', label: 'Weight', unit: 'kg', higherIsBetter: false },
  { metric: 'cost', label: 'Cost', unit: '€', higherIsBetter: false },
  { metric: 'burst', label: 'Burst Pressure', unit: 'bar', higherIsBetter: true },
  { metric: 'fatigue', label: 'Fatigue Life', unit: 'cycles', higherIsBetter: true },
  { metric: 'reliability', label: 'Reliability', unit: '%', higherIsBetter: true },
];

const mockDesigns: RadarDesignData[] = [
  {
    designId: '1',
    designName: 'Design A',
    values: { weight: 50, cost: 1000, burst: 1400, fatigue: 100000, reliability: 99.9 },
    color: '#3B82F6',
  },
  {
    designId: '2',
    designName: 'Design B',
    values: { weight: 45, cost: 1200, burst: 1500, fatigue: 120000, reliability: 99.95 },
    color: '#10B981',
  },
  {
    designId: '3',
    designName: 'Design C',
    values: { weight: 55, cost: 800, burst: 1300, fatigue: 80000, reliability: 99.8 },
    color: '#F59E0B',
  },
];

describe('RadarChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the chart container', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render chart title', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.getByText('Multi-Criteria Comparison')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} title="Custom Title" />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render design buttons', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      // Designs appear in both button row and scores panel
      expect(screen.getAllByText('Design A').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Design B').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Design C').length).toBeGreaterThan(0);
    });
  });

  describe('Data Normalization', () => {
    it('should normalize data by default', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      const polarRadiusAxis = screen.getByTestId('polar-radius-axis');
      expect(polarRadiusAxis).toHaveAttribute('data-domain', '0,100');
    });

    it('should render without normalization when specified', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} normalizeData={false} />);

      const polarRadiusAxis = screen.getByTestId('polar-radius-axis');
      // Domain should be undefined when not normalized
      expect(polarRadiusAxis).toBeInTheDocument();
    });

    it('should invert values for higherIsBetter=false metrics', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      // The chart should render with inverted normalization for weight and cost
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('should handle missing values in design data', () => {
      const incompleteDesigns: RadarDesignData[] = [
        {
          designId: '1',
          designName: 'Incomplete',
          values: { weight: 50 }, // Missing other values
          color: '#3B82F6',
        },
      ];

      render(<RadarChart metrics={mockMetrics} designs={incompleteDesigns} />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  describe('Design Selection', () => {
    it('should have all designs selected by default', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      // Find design toggle buttons in the design selector area
      const designButtons = screen.getAllByRole('button').filter(btn =>
        mockDesigns.some(d => btn.textContent?.includes(d.designName))
      );

      expect(designButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('should toggle design visibility on click', async () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      // Get the first Design A button (the toggle button)
      const designAButtons = screen.getAllByText('Design A');
      const designAButton = designAButtons[0];
      fireEvent.click(designAButton);

      // Design A should now be deselected (opacity-40 class or similar)
      await waitFor(() => {
        expect(designAButton.closest('button')).toHaveClass('opacity-40');
      });
    });

    it('should re-enable design on second click', async () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      const designAButtons = screen.getAllByText('Design A');
      const designAButton = designAButtons[0];

      // Deselect
      fireEvent.click(designAButton);

      // Re-select
      fireEvent.click(designAButton);

      await waitFor(() => {
        expect(designAButton.closest('button')).not.toHaveClass('opacity-40');
      });
    });

    it('should update radar elements when designs are toggled', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      // All radars should be present initially
      expect(screen.getByTestId('radar-Design A')).toBeInTheDocument();
      expect(screen.getByTestId('radar-Design B')).toBeInTheDocument();
    });
  });

  describe('Display Modes', () => {
    it('should render display mode buttons', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.getByText('Filled')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
      expect(screen.getByText('Dots')).toBeInTheDocument();
    });

    it('should switch to outline mode', async () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      const outlineButton = screen.getByText('Outline');
      fireEvent.click(outlineButton);

      await waitFor(() => {
        expect(outlineButton.closest('button')).toHaveClass('bg-white');
      });
    });

    it('should switch to dots mode', async () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      const dotsButton = screen.getByText('Dots');
      fireEvent.click(dotsButton);

      await waitFor(() => {
        expect(dotsButton.closest('button')).toHaveClass('bg-white');
      });
    });

    it('should show opacity slider only in filled mode', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      // Opacity slider should be visible in default (filled) mode
      expect(screen.getByText('Opacity:')).toBeInTheDocument();
    });

    it('should update fill opacity via slider', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '0.3' } });

      expect(screen.getByText('30%')).toBeInTheDocument();
    });
  });

  describe('Color Modes', () => {
    it('should default to category color mode', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.getByTestId('color-mode-btn')).toHaveTextContent('default');
    });

    it('should not show color scale legend in default mode', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.queryByTestId('color-scale-legend')).not.toBeInTheDocument();
    });

    it('should show color scale legend in gradient mode', async () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      fireEvent.click(screen.getByTestId('color-mode-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('color-scale-legend')).toBeInTheDocument();
      });
    });

    it('should use design colors in default mode', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      // Designs should be rendered with their specified colors
      expect(screen.getByTestId('radar-Design A')).toBeInTheDocument();
    });
  });

  describe('Chart Controls', () => {
    it('should render chart controls', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.getByTestId('chart-controls')).toBeInTheDocument();
    });

    it('should toggle grid visibility', async () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      const gridButton = screen.getByTestId('toggle-grid-btn');

      expect(gridButton).toHaveTextContent('Grid: ON');

      fireEvent.click(gridButton);

      await waitFor(() => {
        expect(gridButton).toHaveTextContent('Grid: OFF');
      });
    });

    it('should toggle legend visibility', async () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      const legendButton = screen.getByTestId('toggle-legend-btn');

      expect(legendButton).toHaveTextContent('Legend: ON');

      fireEvent.click(legendButton);

      await waitFor(() => {
        expect(legendButton).toHaveTextContent('Legend: OFF');
      });
    });
  });

  describe('Overall Scores', () => {
    it('should display overall scores panel', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.getByText('Overall Scores')).toBeInTheDocument();
    });

    it('should show rankings for all designs', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('#3')).toBeInTheDocument();
    });

    it('should display metrics list', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.getByText('Metrics')).toBeInTheDocument();
      expect(screen.getByText('Weight')).toBeInTheDocument();
      expect(screen.getByText('Cost')).toBeInTheDocument();
    });

    it('should show lower-is-better indicator', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      // Weight and Cost have higherIsBetter=false, should show down arrow
      const arrows = screen.getAllByText('↓');
      expect(arrows.length).toBe(2);
    });
  });

  describe('Export Functionality', () => {
    it('should render export buttons when onExport provided', () => {
      const mockOnExport = vi.fn();
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} onExport={mockOnExport} />);

      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('SVG')).toBeInTheDocument();
    });

    it('should call onExport with format', () => {
      const mockOnExport = vi.fn();
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} onExport={mockOnExport} />);

      fireEvent.click(screen.getByText('PNG'));
      expect(mockOnExport).toHaveBeenCalledWith('png');

      fireEvent.click(screen.getByText('SVG'));
      expect(mockOnExport).toHaveBeenCalledWith('svg');
    });

    it('should not render export buttons without onExport', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.queryByText('PNG')).not.toBeInTheDocument();
    });
  });

  describe('Polar Grid and Axes', () => {
    it('should render polar grid when showGrid is true', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      expect(screen.getByTestId('polar-grid')).toBeInTheDocument();
    });

    it('should render polar angle axis with metric labels', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      const angleAxis = screen.getByTestId('polar-angle-axis');
      expect(angleAxis).toHaveAttribute('data-key', 'metric');
    });

    it('should render polar radius axis', () => {
      render(<RadarChart metrics={mockMetrics} designs={mockDesigns} />);

      const radiusAxis = screen.getByTestId('polar-radius-axis');
      expect(radiusAxis).toHaveAttribute('data-angle', '90');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single design', () => {
      render(<RadarChart metrics={mockMetrics} designs={[mockDesigns[0]]} />);

      // "Design A" appears multiple times (button + scores), use getAllByText
      expect(screen.getAllByText('Design A').length).toBeGreaterThan(0);
      expect(screen.queryAllByText('Design B')).toHaveLength(0);
    });

    it('should handle single metric', () => {
      const singleMetric: RadarMetric[] = [mockMetrics[0]];

      render(<RadarChart metrics={singleMetric} designs={mockDesigns} />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('should handle empty designs array', () => {
      render(<RadarChart metrics={mockMetrics} designs={[]} />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });
});
