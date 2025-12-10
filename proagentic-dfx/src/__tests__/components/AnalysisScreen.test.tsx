/**
 * AnalysisScreen Component Unit Tests
 * Tests component rendering, tab switching, metric display, and loading states
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalysisScreen } from '@/components/screens/AnalysisScreen';
import { useAppStore } from '@/lib/stores/app-store';
import * as apiClient from '@/lib/api/client';
import type {
  DesignStress,
  DesignFailure,
  DesignThermal,
  DesignReliability,
  DesignCost,
  ParetoDesign,
} from '@/lib/types';

// Mock the store
vi.mock('@/lib/stores/app-store');

// Mock API client
vi.mock('@/lib/api/client', () => ({
  getDesignStress: vi.fn(),
  getDesignFailure: vi.fn(),
  getDesignThermal: vi.fn(),
  getDesignReliability: vi.fn(),
  getDesignCost: vi.fn(),
}));

// Mock analysis panels
vi.mock('@/components/analysis', () => ({
  StressAnalysisPanel: ({ data }: { data: DesignStress }) => (
    <div data-testid="stress-panel">Stress Analysis: {data.design_id}</div>
  ),
  FailureAnalysisPanel: ({ data }: { data: DesignFailure }) => (
    <div data-testid="failure-panel">Failure Analysis: {data.design_id}</div>
  ),
  ThermalAnalysisPanel: ({ data }: { data: DesignThermal }) => (
    <div data-testid="thermal-panel">Thermal Analysis: {data.design_id}</div>
  ),
  ReliabilityPanel: ({ data }: { data: DesignReliability }) => (
    <div data-testid="reliability-panel">Reliability Analysis: {data.design_id}</div>
  ),
  CostAnalysisPanel: ({ data }: { data: DesignCost }) => (
    <div data-testid="cost-panel">Cost Analysis: {data.design_id}</div>
  ),
  PhysicsEquationsPanel: () => <div data-testid="physics-panel">Physics Equations</div>,
}));

// Mock data
const mockParetoDesign: ParetoDesign = {
  id: 'C',
  weight_kg: 45.2,
  cost_eur: 1250,
  burst_pressure_bar: 1725,
  burst_ratio: 2.46,
  p_failure: 0.00012,
  fatigue_life_cycles: 45000,
  permeation_rate: 0.05,
  volumetric_efficiency: 0.72,
  trade_off_category: 'recommended',
  recommendation_reason: 'Best balance of cost, weight, and reliability',
};

const mockStressData: DesignStress = {
  design_id: 'C',
  load_case: 'burst',
  load_pressure_bar: 1725,
  stress_type: 'von_mises',
  max_stress: {
    value_mpa: 850,
    location: { r: 125, z: 0, theta: 0 },
    region: 'cylinder',
    allowable_mpa: 1050,
    margin_percent: 23.5,
  },
  contour_data: {
    type: 'von_mises',
    colormap: 'viridis',
    min_value: 200,
    max_value: 850,
    nodes: [],
  },
};

const mockFailureData: DesignFailure = {
  design_id: 'C',
  predicted_failure_mode: {
    mode: 'fiber_tension',
    is_preferred: true,
    location: 'dome',
    confidence: 0.92,
    explanation: 'Fiber tension at dome apex',
  },
  tsai_wu: {
    max_at_test: { value: 0.65, layer: 3, location: 'dome' },
    max_at_burst: { value: 0.95, layer: 3, location: 'dome' },
  },
};

const mockThermalData: DesignThermal = {
  design_id: 'C',
  fast_fill: {
    scenario: 'fast_fill_3min',
    peak_gas_temp_c: 85,
    peak_wall_temp_c: 72,
    peak_liner_temp_c: 68,
    time_to_peak_seconds: 180,
    liner_limit_c: 85,
    status: 'pass',
  },
  thermal_stress: {
    max_mpa: 45,
    location: 'interface',
    components: { hoop_mpa: 30, axial_mpa: 15, radial_mpa: 5 },
  },
};

const mockReliabilityData: DesignReliability = {
  design_id: 'C',
  monte_carlo: {
    samples: 10000,
    p_failure: 0.00012, // Will calculate to ~8.3 years MTBF (1 / (0.00012 * 1000))
    interpretation: 'high_reliability',
    comparison_to_requirement: 'exceeds',
  },
  burst_distribution: {
    mean_bar: 1725,
    std_bar: 45,
    cov: 0.026,
    histogram: [],
  },
};

const mockCostData: DesignCost = {
  design_id: 'C',
  unit_cost_eur: 1250,
  breakdown: [
    { component: 'fiber', cost_eur: 500, percentage: 40 },
    { component: 'resin', cost_eur: 250, percentage: 20 },
    { component: 'liner', cost_eur: 300, percentage: 24 },
    { component: 'labor', cost_eur: 200, percentage: 16 },
  ],
};

describe('AnalysisScreen', () => {
  const mockSetCurrentDesign = vi.fn();
  const mockSetAnalysisTab = vi.fn();

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup store mock with default values
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentDesign: 'C',
      setCurrentDesign: mockSetCurrentDesign,
      analysisTab: 'stress',
      setAnalysisTab: mockSetAnalysisTab,
      paretoFront: [mockParetoDesign],
    });

    // Setup API mocks with default responses
    vi.mocked(apiClient.getDesignStress).mockResolvedValue(mockStressData);
    vi.mocked(apiClient.getDesignFailure).mockResolvedValue(mockFailureData);
    vi.mocked(apiClient.getDesignThermal).mockResolvedValue(mockThermalData);
    vi.mocked(apiClient.getDesignReliability).mockResolvedValue(mockReliabilityData);
    vi.mocked(apiClient.getDesignCost).mockResolvedValue(mockCostData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the analysis dashboard with header', async () => {
      render(<AnalysisScreen />);

      expect(screen.getByText('Analysis Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText(/Comprehensive engineering analysis and validation for Design C/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Active Design: C/i)).toBeInTheDocument();
    });

    it('should render all metric cards', async () => {
      render(<AnalysisScreen />);

      // Metrics should render immediately (they're part of the initial render)
      expect(screen.getByText('Maximum Stress')).toBeInTheDocument();
      expect(screen.getByText('MTBF (Mean Time Before Failure)')).toBeInTheDocument();
      expect(screen.getByText('Maximum Temperature')).toBeInTheDocument();
      expect(screen.getByText('Total Manufacturing Cost')).toBeInTheDocument();
    });

    it('should render all analysis tabs', () => {
      render(<AnalysisScreen />);

      expect(screen.getByRole('tab', { name: /stress/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /failure/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /thermal/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /reliability/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /cost/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /physics & equations/i })).toBeInTheDocument();
    });
  });

  describe('Metric Display', () => {
    it('should display stress metrics correctly', async () => {
      render(<AnalysisScreen />);

      await waitFor(() => {
        expect(screen.getByText('850')).toBeInTheDocument(); // Max stress value
        expect(screen.getByText('MPa')).toBeInTheDocument(); // Unit
        // Badge contains the safety margin text (may be split across nodes)
        expect(screen.getByText(/23\.5/)).toBeInTheDocument();
      });
    });

    it('should display reliability metrics correctly', async () => {
      // Start with reliability tab active so reliability data loads
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: 'C',
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'reliability',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [mockParetoDesign],
      });

      render(<AnalysisScreen />);

      await waitFor(() => {
        // MTBF = 1 / (p_failure * cycles_per_year)
        // = 1 / (0.00012 * 1000) ≈ 8.3 years
        expect(screen.getByText(/8\.\d+ years/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display thermal metrics with pass status', async () => {
      // Start with thermal tab active so thermal data loads
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: 'C',
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'thermal',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [mockParetoDesign],
      });

      render(<AnalysisScreen />);

      await waitFor(() => {
        // Wait for thermal data to load and verify Pass badge appears
        expect(screen.getByText('Pass')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display cost metrics correctly', async () => {
      // Start with cost tab active so cost data loads
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: 'C',
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'cost',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [mockParetoDesign],
      });

      render(<AnalysisScreen />);

      await waitFor(() => {
        // Cost is formatted with locale formatting
        expect(screen.getByText(/€1,250/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show N/A for missing data', async () => {
      // Mock reliability data with zero p_failure
      vi.mocked(apiClient.getDesignReliability).mockResolvedValue({
        ...mockReliabilityData,
        monte_carlo: {
          ...mockReliabilityData.monte_carlo,
          p_failure: 0,
        },
      });

      render(<AnalysisScreen />);

      // Wait for reliability data to load, then check for N/A in the MTBF card
      await waitFor(() => {
        const mtbfCard = screen.getByLabelText(/MTBF.*N\/A/);
        expect(mtbfCard).toBeInTheDocument();
      });
    });
  });

  describe('Tab Switching', () => {
    it('should load stress data and display stress panel on mount', async () => {
      render(<AnalysisScreen />);

      await waitFor(() => {
        expect(apiClient.getDesignStress).toHaveBeenCalledWith('C');
        expect(screen.getByTestId('stress-panel')).toBeInTheDocument();
      });
    });

    it('should switch to failure tab and load failure data', async () => {
      const user = userEvent.setup();
      render(<AnalysisScreen />);

      const failureTab = screen.getByRole('tab', { name: /failure/i });
      await user.click(failureTab);

      await waitFor(() => {
        expect(mockSetAnalysisTab).toHaveBeenCalledWith('failure');
      });
    });

    it('should switch to thermal tab and load thermal data', async () => {
      // Start with thermal tab active
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: 'C',
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'thermal',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [mockParetoDesign],
      });

      render(<AnalysisScreen />);

      await waitFor(() => {
        expect(apiClient.getDesignThermal).toHaveBeenCalledWith('C');
        expect(screen.getByTestId('thermal-panel')).toBeInTheDocument();
      });
    });

    it('should switch to reliability tab and load reliability data', async () => {
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: 'C',
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'reliability',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [mockParetoDesign],
      });

      render(<AnalysisScreen />);

      await waitFor(() => {
        expect(apiClient.getDesignReliability).toHaveBeenCalledWith('C');
        expect(screen.getByTestId('reliability-panel')).toBeInTheDocument();
      });
    });

    it('should switch to cost tab and load cost data', async () => {
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: 'C',
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'cost',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [mockParetoDesign],
      });

      render(<AnalysisScreen />);

      await waitFor(() => {
        expect(apiClient.getDesignCost).toHaveBeenCalledWith('C');
        expect(screen.getByTestId('cost-panel')).toBeInTheDocument();
      });
    });

    it('should display physics panel without loading data', async () => {
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: 'C',
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'physics',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [mockParetoDesign],
      });

      render(<AnalysisScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('physics-panel')).toBeInTheDocument();
      });

      // Physics panel should not trigger any API calls
      expect(apiClient.getDesignStress).not.toHaveBeenCalled();
    });

    it('should mark active tab with aria-selected', async () => {
      render(<AnalysisScreen />);

      const stressTab = screen.getByRole('tab', { name: /stress/i });
      expect(stressTab).toHaveAttribute('aria-selected', 'true');

      const failureTab = screen.getByRole('tab', { name: /failure/i });
      expect(failureTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner while fetching data', async () => {
      // Delay the API response
      vi.mocked(apiClient.getDesignStress).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockStressData), 100))
      );

      render(<AnalysisScreen />);

      expect(screen.getByText('Loading analysis data...')).toBeInTheDocument();

      // Get all status elements and find the loading one
      const loadingElements = screen.getAllByRole('status');
      const loadingState = loadingElements.find(el =>
        el.textContent?.includes('Loading analysis data')
      );
      expect(loadingState).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Loading analysis data...')).not.toBeInTheDocument();
      });
    });

    it('should display loading state with proper ARIA attributes', async () => {
      vi.mocked(apiClient.getDesignStress).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockStressData), 100))
      );

      render(<AnalysisScreen />);

      // Query for loading state specifically (within the tab content area)
      const loadingElements = screen.getAllByRole('status');
      const loadingState = loadingElements.find(el =>
        el.textContent?.includes('Loading analysis data')
      );
      expect(loadingState).toBeInTheDocument();
      expect(loadingState).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API call fails', async () => {
      const errorMessage = 'Failed to load stress data';
      vi.mocked(apiClient.getDesignStress).mockRejectedValue(new Error(errorMessage));

      render(<AnalysisScreen />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Failed to Load Data')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display generic error for non-Error objects', async () => {
      vi.mocked(apiClient.getDesignStress).mockRejectedValue('Network error');

      render(<AnalysisScreen />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load analysis data')).toBeInTheDocument();
      });
    });

    it('should clear error when switching tabs', async () => {
      // First tab fails
      vi.mocked(apiClient.getDesignStress).mockRejectedValue(new Error('Stress error'));
      // Second tab succeeds
      vi.mocked(apiClient.getDesignFailure).mockResolvedValue(mockFailureData);

      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: 'C',
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'stress',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [mockParetoDesign],
      });

      const { rerender } = render(<AnalysisScreen />);

      await waitFor(() => {
        expect(screen.getByText('Stress error')).toBeInTheDocument();
      });

      // Switch to failure tab
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: 'C',
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'failure',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [mockParetoDesign],
      });

      rerender(<AnalysisScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Stress error')).not.toBeInTheDocument();
        expect(screen.getByTestId('failure-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Design Selection', () => {
    it('should set default design to recommended from Pareto front', () => {
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: null,
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'stress',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [mockParetoDesign],
      });

      render(<AnalysisScreen />);

      expect(mockSetCurrentDesign).toHaveBeenCalledWith('C');
    });

    it('should set default design to first available if no recommendation', () => {
      const designWithoutRecommendation: ParetoDesign = {
        ...mockParetoDesign,
        trade_off_category: 'balanced',
      };

      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: null,
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'stress',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [designWithoutRecommendation],
      });

      render(<AnalysisScreen />);

      expect(mockSetCurrentDesign).toHaveBeenCalledWith('C');
    });

    it('should fallback to design C if Pareto front is empty', () => {
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: null,
        setCurrentDesign: mockSetCurrentDesign,
        analysisTab: 'stress',
        setAnalysisTab: mockSetAnalysisTab,
        paretoFront: [],
      });

      render(<AnalysisScreen />);

      expect(mockSetCurrentDesign).toHaveBeenCalledWith('C');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on metric cards', async () => {
      render(<AnalysisScreen />);

      await waitFor(() => {
        const articles = screen.getAllByRole('article');
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) => {
          expect(article).toHaveAttribute('aria-label');
        });
      });
    });

    it('should have tablist role on navigation', () => {
      render(<AnalysisScreen />);

      const tablist = screen.getByRole('tablist', { name: /analysis module tabs/i });
      expect(tablist).toBeInTheDocument();
    });

    it('should connect tabs with panels using aria-controls', async () => {
      render(<AnalysisScreen />);

      const stressTab = screen.getByRole('tab', { name: /stress/i });
      expect(stressTab).toHaveAttribute('aria-controls', 'stress-panel');

      await waitFor(() => {
        const panel = screen.getByRole('tabpanel');
        expect(panel).toHaveAttribute('id', 'stress-panel');
      });
    });

    it('should manage tabindex for keyboard navigation', () => {
      render(<AnalysisScreen />);

      const stressTab = screen.getByRole('tab', { name: /stress/i });
      const failureTab = screen.getByRole('tab', { name: /failure/i });

      expect(stressTab).toHaveAttribute('tabindex', '0'); // Active tab
      expect(failureTab).toHaveAttribute('tabindex', '-1'); // Inactive tab
    });

    it('should have aria-hidden on decorative icons', () => {
      render(<AnalysisScreen />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        const svg = tab.querySelector('svg');
        if (svg) {
          expect(svg).toHaveAttribute('aria-hidden', 'true');
        }
      });
    });
  });
});
