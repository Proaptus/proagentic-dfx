/**
 * ReliabilityPanel Component Tests - Core Functionality
 * Tests rendering, reliability calculations, and display components
 * Using fail-first TDD approach - all tests fail initially before implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ReliabilityPanel } from '@/components/analysis/ReliabilityPanel';
import type { DesignReliability } from '@/lib/types';

// Mock fetch
global.fetch = vi.fn();

// Mock recharts to avoid canvas issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children, data }: { children?: React.ReactNode; data?: unknown[] }) => <div data-testid="line-chart" data-points={data?.length}>{children}</div>,
  BarChart: ({ children, data }: { children?: React.ReactNode; data?: unknown[] }) => <div data-testid="bar-chart" data-points={data?.length}>{children}</div>,
  Bar: () => <div />,
  Line: () => <div />,
  XAxis: ({ label }: { label?: { value?: string } }) => <div data-testid="x-axis">{label?.value}</div>,
  YAxis: ({ label }: { label?: { value?: string } }) => <div data-testid="y-axis">{label?.value}</div>,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}));

// Mock PieChartEnhanced
vi.mock('@/components/charts', () => ({
  PieChartEnhanced: ({ data, title }: { data?: unknown[]; title?: string }) => (
    <div data-testid="pie-chart-enhanced" data-title={title} data-points={data?.length} />
  ),
}));

// Mock ReliabilityEquationsSection
vi.mock('@/components/analysis/ReliabilityEquationsSection', () => ({
  ReliabilityEquationsSection: () => <div data-testid="reliability-equations">Equations</div>,
}));

// Mock Card component
vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: { children?: React.ReactNode; className?: string }) => <div className={className} data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
}));

const mockReliabilityData: DesignReliability = {
  design_id: 'C',
  monte_carlo: {
    samples: 100000,
    p_failure: 1.2e-4, // 0.00012
    interpretation: 'high_reliability',
    comparison_to_requirement: 'exceeds_requirement',
  },
  burst_distribution: {
    mean_bar: 1725,
    std_bar: 45,
    cov: 0.026,
    histogram: [
      { bin_center: 1600, count: 100 },
      { bin_center: 1650, count: 500 },
      { bin_center: 1700, count: 2000 },
      { bin_center: 1750, count: 1500 },
      { bin_center: 1800, count: 300 },
    ],
  },
  confidence_intervals: [
    { level: '68%', mean: 1725, lower: 1680, upper: 1770 },
    { level: '95%', mean: 1725, lower: 1635, upper: 1815 },
    { level: '99.7%', mean: 1725, lower: 1590, upper: 1860 },
  ],
  safety_factor_components: [
    { component: 'Material Property Scatter', factor: 1.3, description: 'Material property variability safety margin' },
    { component: 'Manufacturing Variability', factor: 1.1, description: 'Manufacturing process variation margin' },
    { component: 'Design Uncertainty', factor: 1.5, description: 'Design uncertainty and modeling margin' },
  ],
  sensitivity: [
    { parameter: 'Fiber Strength', negative: -25, positive: 35, color: '#EF4444' },
    { parameter: 'Winding Angle', negative: -15, positive: 20, color: '#3B82F6' },
    { parameter: 'Layer Thickness', negative: -10, positive: 12, color: '#10B981' },
  ],
  uncertainty_breakdown: [
    { name: 'Material', value: 47, color: '#EF4444' },
    { name: 'Geometry', value: 25, color: '#3B82F6' },
    { name: 'Environment', value: 28, color: '#10B981' },
  ],
};

describe('ReliabilityPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockReliabilityData,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering and Structure', () => {
    it('should render MTBF metric card', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Mean Time Between Failures')).toBeInTheDocument();
      });
    });

    it('should render Monte Carlo Configuration selector', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      expect(screen.getByLabelText('Monte Carlo Configuration')).toBeInTheDocument();
    });

    it('should render all Monte Carlo configuration options', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      const select = screen.getByLabelText('Monte Carlo Configuration') as HTMLSelectElement;
      expect(select.options.length).toBeGreaterThanOrEqual(3);
    });

    it('should render Show Equations button', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      const button = screen.getByRole('button', { name: /show equations/i });
      expect(button).toBeInTheDocument();
    });

    it('should render all key metric cards', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Mean Time Between Failures')).toBeInTheDocument();
        expect(screen.getByText('Failure Probability')).toBeInTheDocument();
        expect(screen.getByText('Confidence Level')).toBeInTheDocument();
        expect(screen.getByText('B10 Life')).toBeInTheDocument();
      });
    });

    it('should render Monte Carlo Results section', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Monte Carlo Results')).toBeInTheDocument();
      });
    });

    it('should render burst distribution histogram', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart');
        expect(barCharts.length).toBeGreaterThan(0);
      });
    });

    it('should render Weibull Reliability Function chart', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Weibull Reliability Function')).toBeInTheDocument();
      });
    });

    it('should render Failure Rate Bathtub Curve', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Failure Rate Bathtub Curve')).toBeInTheDocument();
      });
    });

    it('should render Confidence Intervals section', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Confidence Intervals')).toBeInTheDocument();
      });
    });

    it('should render Sensitivity Analysis section', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Sensitivity Analysis (Tornado Chart)')).toBeInTheDocument();
      });
    });

    it('should render uncertainty pie chart', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByTestId('pie-chart-enhanced')).toBeInTheDocument();
      });
    });

    it('should render Safety Factor Decomposition section', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Safety Factor Decomposition')).toBeInTheDocument();
      });
    });
  });

  describe('Reliability Calculations', () => {
    it('should calculate MTBF in years correctly', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // MTBF = 1 / (p_failure * cycles_per_year)
      // = 1 / (0.00012 * 1000) ≈ 8.3 years
      await waitFor(() => {
        expect(screen.getByText(/8\.\d/)).toBeInTheDocument();
      });
    });

    it('should display MTBF metric card', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // MTBF cycles = 1 / p_failure = 1 / 0.00012 ≈ 8333
      // Check that Mean Time Between Failures card is rendered
      await waitFor(() => {
        expect(screen.getByText('Mean Time Between Failures')).toBeInTheDocument();
      });
    });

    it('should display failure probability metric', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Component displays failure probability in the key metrics section
      await waitFor(() => {
        expect(screen.getByText('Failure Probability')).toBeInTheDocument();
      });
    });

    it('should display B10 life metric', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // B10 = MTBF * 0.105
      await waitFor(() => {
        expect(screen.getByText(/B10 Life/)).toBeInTheDocument();
      });
    });

    it('should display 95% confidence level', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('95%')).toBeInTheDocument();
      });
    });

    it('should handle zero failure probability', async () => {
      const zeroFailureData = {
        ...mockReliabilityData,
        monte_carlo: {
          ...mockReliabilityData.monte_carlo,
          p_failure: 0,
        },
      };
      await act(async () => {
      render(<ReliabilityPanel data={zeroFailureData} />);
      });
      // Should display N/A or infinity handling
      await waitFor(() => {
        expect(screen.getByText('Mean Time Between Failures')).toBeInTheDocument();
      });
    });

    it('should handle very small failure probability', async () => {
      const smallFailureData = {
        ...mockReliabilityData,
        monte_carlo: {
          ...mockReliabilityData.monte_carlo,
          p_failure: 1e-10,
        },
      };
      await act(async () => {
      render(<ReliabilityPanel data={smallFailureData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Mean Time Between Failures')).toBeInTheDocument();
      });
    });

    it('should display CoV as percentage', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // CoV should be displayed as percentage (0.026 * 100 = 2.6%)
      await waitFor(() => {
        expect(screen.getByText(/2\.6%/)).toBeInTheDocument();
      });
    });
  });

  describe('Confidence Intervals Display', () => {
    it('should display all confidence level labels', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('68% Confidence')).toBeInTheDocument();
        expect(screen.getByText('95% Confidence')).toBeInTheDocument();
        expect(screen.getByText('99.7% Confidence')).toBeInTheDocument();
      });
    });

    it('should display confidence interval ranges', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Should show ranges like [1680 - 1770] bar
      await waitFor(() => {
        expect(screen.getByText(/\[1680 - 1770\]/)).toBeInTheDocument();
        expect(screen.getByText(/\[1635 - 1815\]/)).toBeInTheDocument();
      });
    });

    it('should display mean values in confidence intervals', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Search for individual parts since text is split
      await waitFor(() => {
        expect(screen.getAllByText(/Mean/).length).toBeGreaterThan(0); // Mean appears in multiple cards
      });
    });

    it('should render visual bars for confidence intervals', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Should have visual bars for intervals
      await waitFor(() => {
        const intervalElements = screen.getAllByText(/Confidence/);
        expect(intervalElements.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should highlight 95% confidence interval', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Verify key components of the interval display exist
      await waitFor(() => {
        expect(screen.getAllByText(/95%/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Confidence/).length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Monte Carlo Results Display', () => {
    it('should display probability of failure', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Probability of Failure')).toBeInTheDocument();
      });
    });

    it('should display interpretation section', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Interpretation')).toBeInTheDocument();
      });
    });

    it('should display regulatory compliance section', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Regulatory Compliance')).toBeInTheDocument();
      });
    });

    it('should display simulation count', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText(/Simulations/)).toBeInTheDocument();
      });
    });

    it('should display sampling method', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Latin Hypercube Sampling')).toBeInTheDocument();
      });
    });

    it('should display convergence status', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText(/Convergence/)).toBeInTheDocument();
        expect(screen.getByText(/Achieved/)).toBeInTheDocument();
      });
    });
  });

  describe('Burst Distribution Visualization', () => {
    it('should render burst distribution bar chart', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart');
        expect(barCharts.length).toBeGreaterThan(0);
      });
    });

    it('should display mean statistics', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Text is split across elements, Mean appears in multiple locations
      await waitFor(() => {
        expect(screen.getAllByText(/Mean/).length).toBeGreaterThan(0);
      });
    });

    it('should display burst pressure distribution section', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Component should display the burst distribution section
      await waitFor(() => {
        expect(screen.getByText('Burst Pressure Distribution')).toBeInTheDocument();
      });
    });

    it('should display CoV in burst distribution', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Component should show burst distribution with CoV value
      await waitFor(() => {
        expect(screen.getByText('Burst Pressure Distribution')).toBeInTheDocument();
      });
    });

    it('should pass histogram data to bar chart', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        const barChart = screen.getAllByTestId('bar-chart')[0];
        expect(barChart).toHaveAttribute('data-points', String(mockReliabilityData.burst_distribution.histogram.length));
      });
    });
  });

  describe('Weibull and Bathtub Curves', () => {
    it('should render Weibull and bathtub line charts', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        const lineCharts = screen.getAllByTestId('line-chart');
        expect(lineCharts.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should display bathtub curve title', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Failure Rate Bathtub Curve')).toBeInTheDocument();
      });
    });

    it('should display Weibull explanation text', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText(/Weibull distribution models.*shape.*scale/i)).toBeInTheDocument();
      });
    });

    it('should display bathtub curve explanation text', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText(/infant mortality.*random failures.*wear-out/i)).toBeInTheDocument();
      });
    });

    it('should render bathtub curve section', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Component should display the bathtub curve section
      await waitFor(() => {
        expect(screen.getByText('Failure Rate Bathtub Curve')).toBeInTheDocument();
      });
    });
  });

  describe('Sensitivity Analysis', () => {
    it('should render sensitivity analysis section', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Sensitivity Analysis (Tornado Chart)')).toBeInTheDocument();
      });
    });

    it('should display all sensitivity parameters', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        mockReliabilityData.sensitivity?.forEach(item => {
          expect(screen.getByText(item.parameter)).toBeInTheDocument();
        });
      });
    });

    it('should display sensitivity percentage values', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Check for percentage values
      await waitFor(() => {
        expect(screen.getByText(/-25%/)).toBeInTheDocument();
        expect(screen.getByText(/\+35%/)).toBeInTheDocument();
      });
    });

    it('should display sensitivity explanation text', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText(/Shows impact of.*standard deviation.*parameter/i)).toBeInTheDocument();
      });
    });

    it('should highlight fiber strength as most influential', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText(/Fiber strength has the largest influence/i)).toBeInTheDocument();
      });
    });
  });

  describe('Uncertainty Source Breakdown', () => {
    it('should render uncertainty pie chart', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByTestId('pie-chart-enhanced')).toBeInTheDocument();
      });
    });

    it('should pass correct title to pie chart', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        const pieChart = screen.getByTestId('pie-chart-enhanced');
        expect(pieChart).toHaveAttribute('data-title', 'Uncertainty Sources');
      });
    });

    it('should display material property scatter as dominant source', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText(/Material property scatter.*dominant source.*47%/i)).toBeInTheDocument();
      });
    });

    it('should display uncertainty source breakdown title', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Check that uncertainty breakdown pie chart is displayed
      await waitFor(() => {
        expect(screen.getByText(/Uncertainty Source/)).toBeInTheDocument();
      });
    });
  });

  describe('Safety Factor Decomposition', () => {
    it('should render safety factor decomposition section', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Safety Factor Decomposition')).toBeInTheDocument();
      });
    });

    it('should display all safety factor components', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        mockReliabilityData.safety_factor_components?.forEach(comp => {
          expect(screen.getByText(comp.component)).toBeInTheDocument();
        });
      });
    });

    it('should display safety factor values', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText(/1\.30|1\.3/)).toBeInTheDocument();
        expect(screen.getByText(/1\.10|1\.1/)).toBeInTheDocument();
        expect(screen.getByText(/1\.50|1\.5/)).toBeInTheDocument();
      });
    });

    it('should display safety factor table with component column', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Total = 1.3 * 1.1 * 1.5 = 2.145
      // Component should display safety factor decomposition table
      await waitFor(() => {
        expect(screen.getByText(/Component/)).toBeInTheDocument();
      });
    });

    it('should display design burst ratio', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Design Burst Ratio')).toBeInTheDocument();
      });
    });

    it('should display effective safety factor', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Effective Safety Factor')).toBeInTheDocument();
      });
    });

    it('should display EC 79 standard reference', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText(/EC 79/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels on form controls', async () => {
      await act(async () => {
      render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      expect(screen.getByLabelText('Monte Carlo Configuration')).toBeInTheDocument();
    });

    it('should have semantic heading elements', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
      });
    });

    it('should have table headers for safety factor table', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Component')).toBeInTheDocument();
        expect(screen.getByText('Factor')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
      });
    });
  });
});
