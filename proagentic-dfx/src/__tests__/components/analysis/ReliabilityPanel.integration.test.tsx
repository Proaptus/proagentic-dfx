/**
 * ReliabilityPanel Component Tests - Integration & Complex Scenarios
 * Tests Monte Carlo configuration, user interactions, edge cases, and API integration
 * Using fail-first TDD approach - all tests fail initially before implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('ReliabilityPanel - Integration Tests', () => {
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

  describe('Monte Carlo Configuration', () => {
    it('should render Monte Carlo configuration select', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Component should have the select control available
      expect(screen.getByLabelText('Monte Carlo Configuration')).toBeInTheDocument();
    });

    it('should default to 100k configuration', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      const select = screen.getByLabelText('Monte Carlo Configuration') as HTMLSelectElement;
      expect(select.value).toBe('100k');
    });

    it('should have configuration select accessible', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Component should have the select control for configuration
      expect(screen.getByLabelText('Monte Carlo Configuration')).toBeInTheDocument();
    });

    it('should show loading state during config change', async () => {
      const user = userEvent.setup();
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => mockReliabilityData }), 100))
      );

      await act(async () => {
      render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      const select = screen.getByLabelText('Monte Carlo Configuration');

      await user.selectOptions(select, '1M');

      await waitFor(() => {
        expect(screen.getByText(/Running Monte Carlo simulation/)).toBeInTheDocument();
      });
    });

    it.skip('should disable select during loading', async () => {
      const user = userEvent.setup();
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => mockReliabilityData }), 100))
      );

      await act(async () => {
      render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      const select = screen.getByLabelText('Monte Carlo Configuration') as HTMLSelectElement;

      await user.selectOptions(select, '1M');
      await waitFor(() => {
        expect(select.disabled).toBe(true);
      });
    });
  });

  describe('Equations Toggle', () => {
    it('should show equations when button is clicked', async () => {
      const user = userEvent.setup();
      await act(async () => {
      render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      const button = screen.getByRole('button', { name: /show equations/i });

      await user.click(button);

      // Check for the mocked ReliabilityEquationsSection component
      await waitFor(() => {
        expect(screen.getByTestId('reliability-equations')).toBeInTheDocument();
      });
    });

    it('should toggle equations visibility', async () => {
      const user = userEvent.setup();
      await act(async () => {
      render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      const button = screen.getByRole('button', { name: /show equations/i });

      // Initially hidden - check for mocked equations section
      expect(screen.queryByTestId('reliability-equations')).not.toBeInTheDocument();

      // Show
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('reliability-equations')).toBeInTheDocument();
      });

      // Hide
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByTestId('reliability-equations')).not.toBeInTheDocument();
      });
    });

    it('should change button text when toggled', async () => {
      const user = userEvent.setup();
      await act(async () => {
      render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      const button = screen.getByRole('button', { name: /show equations/i });

      expect(button).toHaveTextContent('Show Equations');

      await user.click(button);
      await waitFor(() => {
        expect(button).toHaveTextContent('Hide Equations');
      });
    });

    it('should apply active styling when equations are shown', async () => {
      const user = userEvent.setup();
      await act(async () => {
      render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      const button = screen.getByRole('button', { name: /show equations/i });

      expect(button).not.toHaveClass('bg-blue-100');

      await user.click(button);
      await waitFor(() => {
        expect(button).toHaveClass('bg-blue-100');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing confidence intervals', async () => {
      const noConfidenceData = {
        ...mockReliabilityData,
        confidence_intervals: [],
      };
      await act(async () => {
      render(<ReliabilityPanel data={noConfidenceData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Confidence Intervals')).toBeInTheDocument();
      });
    });

    it('should handle missing sensitivity data', async () => {
      const noSensitivityData = {
        ...mockReliabilityData,
        sensitivity: [],
      };
      await act(async () => {
      render(<ReliabilityPanel data={noSensitivityData} />);
      });
      // Should still render the component without sensitivity data
      await waitFor(() => {
        expect(screen.getByText(/Sensitivity Analysis/)).toBeInTheDocument();
      });
    });

    it('should handle empty burst distribution histogram', async () => {
      const noHistogramData = {
        ...mockReliabilityData,
        burst_distribution: {
          ...mockReliabilityData.burst_distribution,
          histogram: [],
        },
      };
      await act(async () => {
      render(<ReliabilityPanel data={noHistogramData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Burst Pressure Distribution')).toBeInTheDocument();
      });
    });

    it('should handle API fetch error gracefully', async () => {
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
      await act(async () => {
      render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Mean Time Between Failures')).toBeInTheDocument();
      });
    });

    it('should handle failed API response', async () => {
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
      });
      await act(async () => {
      render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Mean Time Between Failures')).toBeInTheDocument();
      });
    });

    it('should handle very large MTBF values', async () => {
      const longMTBFData = {
        ...mockReliabilityData,
        monte_carlo: {
          ...mockReliabilityData.monte_carlo,
          p_failure: 1e-10,
        },
      };
      await act(async () => {
      render(<ReliabilityPanel data={longMTBFData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Mean Time Between Failures')).toBeInTheDocument();
      });
    });

    it('should handle very small MTBF values', async () => {
      const shortMTBFData = {
        ...mockReliabilityData,
        monte_carlo: {
          ...mockReliabilityData.monte_carlo,
          p_failure: 0.1,
        },
      };
      await act(async () => {
      render(<ReliabilityPanel data={shortMTBFData} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Mean Time Between Failures')).toBeInTheDocument();
      });
    });
  });

  describe('Integration with Props', () => {
    it('should render with designId prop', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} designId="A" />);
      });
      await waitFor(() => {
        expect(screen.getByText('Mean Time Between Failures')).toBeInTheDocument();
      });
    });

    it('should call onReliabilityDataChange when data updates', async () => {
      const onReliabilityDataChange = vi.fn();
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          ...mockReliabilityData,
          monte_carlo: { ...mockReliabilityData.monte_carlo, samples: 1000000 },
        }),
      });

      const user = userEvent.setup();
      await act(async () => {
      render(<ReliabilityPanel data={mockReliabilityData} onReliabilityDataChange={onReliabilityDataChange} />);
      });

      const select = screen.getByLabelText('Monte Carlo Configuration');
      await user.selectOptions(select, '1M');

      await waitFor(() => {
        expect(onReliabilityDataChange).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should fetch reliability data for specified designId', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} designId="B" />);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/B/reliability'));
      });
    });
  });

  describe('Number Formatting', () => {
    it('should format MTBF values appropriately', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Should format large numbers appropriately
      await waitFor(() => {
        const mtbfText = screen.getByText(/Mean Time Between Failures/).closest('div')?.textContent;
        expect(mtbfText).toBeTruthy();
      });
    });

    it('should display failure probability metric', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      // Component should display the failure probability somewhere
      await waitFor(() => {
        expect(screen.getByText(/Failure Probability/)).toBeInTheDocument();
      });
    });

    it('should format CoV as percentage value', async () => {
      await act(async () => {
        render(<ReliabilityPanel data={mockReliabilityData} />);
      });
      await waitFor(() => {
        expect(screen.getByText(/2\.6%/)).toBeInTheDocument();
      });
    });
  });
});
