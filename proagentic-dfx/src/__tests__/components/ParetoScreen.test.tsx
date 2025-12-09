import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParetoScreen } from '@/components/screens/ParetoScreen';
import { useAppStore } from '@/lib/stores/app-store';
import * as apiClient from '@/lib/api/client';
import type { ParetoDesign, OptimizationJob } from '@/lib/types';

// Mock the dependencies
vi.mock('@/lib/stores/app-store');
vi.mock('@/lib/api/client');
vi.mock('@/components/charts/ParetoChart', () => ({
  ParetoChart: ({ designs, xAxis, yAxis, selectedIds, onSelect, recommendedId }: {
    designs: ParetoDesign[];
    xAxis: string;
    yAxis: string;
    selectedIds: string[];
    onSelect: (id: string) => void;
    recommendedId?: string;
  }) => (
    <div data-testid="pareto-chart">
      <div data-testid="chart-x-axis">{xAxis}</div>
      <div data-testid="chart-y-axis">{yAxis}</div>
      <div data-testid="chart-designs-count">{designs.length}</div>
      <div data-testid="chart-selected-count">{selectedIds.length}</div>
      <div data-testid="chart-recommended">{recommendedId || 'none'}</div>
      {designs.map((design) => (
        <button
          key={design.id}
          data-testid={`chart-design-${design.id}`}
          onClick={() => onSelect(design.id)}
        >
          Design {design.id}
        </button>
      ))}
    </div>
  ),
}));

// Mock data
const mockParetoDesigns: ParetoDesign[] = [
  {
    id: 'D001',
    weight_kg: 85.2,
    cost_eur: 12500,
    burst_pressure_bar: 1750,
    burst_ratio: 2.5,
    p_failure: 0.00001,
    fatigue_life_cycles: 50000,
    permeation_rate: 0.5,
    volumetric_efficiency: 0.85,
    trade_off_category: 'lightest',
    recommendation_reason: 'Lightest design in the Pareto front',
  },
  {
    id: 'D002',
    weight_kg: 92.5,
    cost_eur: 11200,
    burst_pressure_bar: 1800,
    burst_ratio: 2.57,
    p_failure: 0.000005,
    fatigue_life_cycles: 55000,
    permeation_rate: 0.45,
    volumetric_efficiency: 0.87,
    trade_off_category: 'balanced',
    recommendation_reason: 'Balanced trade-off',
  },
  {
    id: 'D003',
    weight_kg: 88.7,
    cost_eur: 11800,
    burst_pressure_bar: 1775,
    burst_ratio: 2.54,
    p_failure: 0.000007,
    fatigue_life_cycles: 52000,
    permeation_rate: 0.48,
    volumetric_efficiency: 0.86,
    trade_off_category: 'recommended',
    recommendation_reason: 'Best overall recommendation',
  },
  {
    id: 'D004',
    weight_kg: 95.0,
    cost_eur: 11000,
    burst_pressure_bar: 1825,
    burst_ratio: 2.61,
    p_failure: 0.000003,
    fatigue_life_cycles: 58000,
    permeation_rate: 0.42,
    volumetric_efficiency: 0.88,
    trade_off_category: 'conservative',
  },
  {
    id: 'D005',
    weight_kg: 90.0,
    cost_eur: 12000,
    burst_pressure_bar: 1800,
    burst_ratio: 2.57,
    p_failure: 0.000004,
    fatigue_life_cycles: 54000,
    permeation_rate: 0.46,
    volumetric_efficiency: 0.87,
    trade_off_category: 'max_margin',
  },
];

const mockOptimizationJob: OptimizationJob = {
  job_id: 'test-job-123',
  status: 'completed',
  stream_url: 'http://localhost:3001/api/optimization/test-job-123/stream',
};

describe('ParetoScreen', () => {
  let mockStore: {
    paretoFront: ParetoDesign[];
    setParetoFront: ReturnType<typeof vi.fn>;
    selectedDesigns: string[];
    toggleDesign: ReturnType<typeof vi.fn>;
    setCurrentDesign: ReturnType<typeof vi.fn>;
    setScreen: ReturnType<typeof vi.fn>;
    optimizationJob: OptimizationJob | null;
  };

  beforeEach(() => {
    // Setup default mock store
    mockStore = {
      paretoFront: [],
      setParetoFront: vi.fn(),
      selectedDesigns: [],
      toggleDesign: vi.fn(),
      setCurrentDesign: vi.fn(),
      setScreen: vi.fn(),
      optimizationJob: mockOptimizationJob,
    };

    vi.mocked(useAppStore).mockReturnValue(mockStore as never);
    vi.mocked(apiClient.getOptimizationResults).mockResolvedValue({
      pareto_front: mockParetoDesigns,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the page header with title and description', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      expect(screen.getByText('Pareto Explorer')).toBeInTheDocument();
      expect(
        screen.getByText(/Explore multi-objective trade-offs between weight, cost, and reliability/i)
      ).toBeInTheDocument();
    });

    it('should render axis controls with proper labels', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      expect(screen.getByLabelText(/X-Axis:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Y-Axis:/i)).toBeInTheDocument();
    });

    it('should render legend with all categories', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      const legend = screen.getByRole('list', { name: /chart legend/i });
      expect(legend).toBeInTheDocument();

      expect(within(legend).getByText('Lightest')).toBeInTheDocument();
      expect(within(legend).getByText('Balanced')).toBeInTheDocument();
      expect(within(legend).getByText('Recommended')).toBeInTheDocument();
      expect(within(legend).getByText('Conservative')).toBeInTheDocument();
      expect(within(legend).getByText('Max Margin')).toBeInTheDocument();
      expect(within(legend).getByText('Selected')).toBeInTheDocument();
    });

    it('should render featured design cards for highlighted designs', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      // Check for design cards in the "Featured Optimal Designs" section
      const featuredSection = screen.getByText('Featured Optimal Designs').closest('div');
      expect(featuredSection).toBeInTheDocument();

      // Verify all designs are present by checking for their selection buttons
      expect(screen.getByRole('button', { name: /Select lightest design D001/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select balanced design D002/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select recommended design D003/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select conservative design D004/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select max margin design D005/i })).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should display loading state when fetching data', async () => {
      render(<ParetoScreen />);

      expect(screen.getByText('Loading Pareto data...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should load Pareto data on mount when paretoFront is empty', async () => {
      render(<ParetoScreen />);

      await waitFor(() => {
        expect(apiClient.getOptimizationResults).toHaveBeenCalledWith('test-job-123');
        expect(mockStore.setParetoFront).toHaveBeenCalledWith(mockParetoDesigns);
      });
    });

    it('should use demo job ID when optimizationJob is null', async () => {
      mockStore.optimizationJob = null;
      render(<ParetoScreen />);

      await waitFor(() => {
        expect(apiClient.getOptimizationResults).toHaveBeenCalledWith('demo');
      });
    });

    it('should not fetch data if paretoFront already has data', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      expect(apiClient.getOptimizationResults).not.toHaveBeenCalled();
    });

    it('should display error state when data loading fails', async () => {
      const errorMessage = 'Network error';
      vi.mocked(apiClient.getOptimizationResults).mockRejectedValue(new Error(errorMessage));

      render(<ParetoScreen />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
        expect(
          screen.getByText('Failed to load optimization results. Please try again.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Axis Selection', () => {
    it('should change X-axis metric when selection changes', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const xAxisSelect = screen.getByLabelText(/Select X-axis metric/i);
      await user.selectOptions(xAxisSelect, 'cost_eur');

      await waitFor(() => {
        expect(screen.getByTestId('chart-x-axis')).toHaveTextContent('cost_eur');
      });
    });

    it('should change Y-axis metric when selection changes', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const yAxisSelect = screen.getByLabelText(/Select Y-axis metric/i);
      await user.selectOptions(yAxisSelect, 'burst_pressure_bar');

      await waitFor(() => {
        expect(screen.getByTestId('chart-y-axis')).toHaveTextContent('burst_pressure_bar');
      });
    });

    it('should render all X-axis options', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      const xAxisSelect = screen.getByLabelText(/Select X-axis metric/i);
      const options = within(xAxisSelect).getAllByRole('option');

      expect(options).toHaveLength(5);
      expect(options[0]).toHaveTextContent('Weight (kg)');
      expect(options[1]).toHaveTextContent('Cost (€)');
      expect(options[2]).toHaveTextContent('P(Failure)');
    });

    it('should render all Y-axis options', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      const yAxisSelect = screen.getByLabelText(/Select Y-axis metric/i);
      const options = within(yAxisSelect).getAllByRole('option');

      expect(options).toHaveLength(6);
      expect(options[0]).toHaveTextContent('Cost (€)');
      expect(options[1]).toHaveTextContent('Weight (kg)');
      expect(options[2]).toHaveTextContent('Burst Pressure (bar)');
    });
  });

  describe('Design Selection', () => {
    it('should toggle design selection when design card is clicked', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const designCard = screen.getByRole('button', { name: /Select lightest design D001/i });
      await user.click(designCard);

      expect(mockStore.toggleDesign).toHaveBeenCalledWith('D001');
    });

    it('should toggle design selection when Enter key is pressed on design card', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const designCard = screen.getByRole('button', { name: /Select lightest design D001/i });
      designCard.focus();
      await user.keyboard('{Enter}');

      expect(mockStore.toggleDesign).toHaveBeenCalledWith('D001');
    });

    it('should toggle design selection when Space key is pressed on design card', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const designCard = screen.getByRole('button', { name: /Select lightest design D001/i });
      designCard.focus();
      await user.keyboard(' ');

      expect(mockStore.toggleDesign).toHaveBeenCalledWith('D001');
    });

    it('should show selection count when designs are selected', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001', 'D002'];
      render(<ParetoScreen />);

      expect(screen.getByText('2 / 3 selected')).toBeInTheDocument();
    });

    it('should display checkmark on selected design cards', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001'];
      render(<ParetoScreen />);

      const designCard = screen.getByRole('button', { name: /Select lightest design D001/i });
      expect(designCard).toHaveAttribute('aria-pressed', 'true');
    });

    it('should pass selected designs to chart component', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001', 'D002'];
      render(<ParetoScreen />);

      expect(screen.getByTestId('chart-selected-count')).toHaveTextContent('2');
    });
  });

  describe('Compare Functionality', () => {
    it('should show info message when less than 2 designs are selected', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001'];
      render(<ParetoScreen />);

      expect(screen.getByText(/Select 1 more design to enable comparison/i)).toBeInTheDocument();
    });

    it('should enable compare button when 2 or more designs are selected', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001', 'D002'];
      render(<ParetoScreen />);

      const compareButton = screen.getByRole('button', { name: /Compare 2 selected designs/i });
      expect(compareButton).not.toBeDisabled();
    });

    it('should disable compare button when less than 2 designs are selected', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001'];
      render(<ParetoScreen />);

      const compareButton = screen.getByRole('button', { name: /Compare 1 selected designs/i });
      expect(compareButton).toBeDisabled();
    });

    it('should navigate to compare screen when compare button is clicked', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001', 'D002'];
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const compareButton = screen.getByRole('button', { name: /Compare 2 selected designs/i });
      await user.click(compareButton);

      expect(mockStore.setScreen).toHaveBeenCalledWith('compare');
    });

    it('should not show info message when 2 or more designs are selected', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001', 'D002'];
      render(<ParetoScreen />);

      expect(screen.queryByText(/Select.*more design/i)).not.toBeInTheDocument();
    });

    it('should display correct plural form in info message', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = [];
      render(<ParetoScreen />);

      // When 0 selected, info message should not be shown
      expect(screen.queryByText(/Select.*more design/i)).not.toBeInTheDocument();

      // Now select 1 design
      mockStore.selectedDesigns = ['D001'];
      render(<ParetoScreen />);

      // When 1 selected, we need 1 more (singular)
      expect(screen.getByText(/Select 1 more design to enable comparison/i)).toBeInTheDocument();
    });
  });

  describe('View Design in 3D', () => {
    it('should navigate to viewer screen when "View in 3D" is clicked', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const viewButtons = screen.getAllByRole('button', { name: /View design.*in 3D viewer/i });
      await user.click(viewButtons[0]);

      expect(mockStore.setCurrentDesign).toHaveBeenCalledWith('D001');
      expect(mockStore.setScreen).toHaveBeenCalledWith('viewer');
    });

    it('should not trigger design selection when "View in 3D" is clicked', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const viewButtons = screen.getAllByRole('button', { name: /View design.*in 3D viewer/i });
      await user.click(viewButtons[0]);

      // toggleDesign should not be called because stopPropagation is used
      expect(mockStore.toggleDesign).not.toHaveBeenCalled();
    });
  });

  describe('Chart Interaction', () => {
    it('should pass correct design data to ParetoChart', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      expect(screen.getByTestId('chart-designs-count')).toHaveTextContent('5');
    });

    it('should handle chart dot click for design selection', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const chartDesignButton = screen.getByTestId('chart-design-D001');
      await user.click(chartDesignButton);

      expect(mockStore.toggleDesign).toHaveBeenCalledWith('D001');
    });

    it('should pass recommended design ID to chart', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      expect(screen.getByTestId('chart-recommended')).toHaveTextContent('D003');
    });

    it('should not add more than 3 designs when selection limit is reached', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001', 'D002', 'D003'];
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const chartDesignButton = screen.getByTestId('chart-design-D004');
      await user.click(chartDesignButton);

      // toggleDesign should not be called because limit is reached
      expect(mockStore.toggleDesign).not.toHaveBeenCalled();
    });

    it('should allow deselection when selection limit is reached', async () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001', 'D002', 'D003'];
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const chartDesignButton = screen.getByTestId('chart-design-D001');
      await user.click(chartDesignButton);

      // Should allow deselection even at limit
      expect(mockStore.toggleDesign).toHaveBeenCalledWith('D001');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for axis selects', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      expect(screen.getByLabelText(/Select X-axis metric/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Select Y-axis metric/i)).toBeInTheDocument();
    });

    it('should have role="status" and aria-live="polite" on loading indicator', async () => {
      render(<ParetoScreen />);

      const loadingIndicator = screen.getByRole('status');
      expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
    });

    it('should have role="alert" on error message', async () => {
      vi.mocked(apiClient.getOptimizationResults).mockRejectedValue(new Error('Test error'));
      render(<ParetoScreen />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should have proper aria-label for compare button', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001', 'D002'];
      render(<ParetoScreen />);

      const compareButton = screen.getByLabelText(/Compare 2 selected designs/i);
      expect(compareButton).toBeInTheDocument();
    });

    it('should have aria-pressed attribute on design cards', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001'];
      render(<ParetoScreen />);

      const selectedCard = screen.getByRole('button', { name: /Select lightest design D001/i });
      const unselectedCard = screen.getByRole('button', { name: /Select balanced design D002/i });

      expect(selectedCard).toHaveAttribute('aria-pressed', 'true');
      expect(unselectedCard).toHaveAttribute('aria-pressed', 'false');
    });

    it('should mark decorative icons as aria-hidden', () => {
      mockStore.paretoFront = mockParetoDesigns;
      mockStore.selectedDesigns = ['D001'];
      render(<ParetoScreen />);

      // ArrowRight icon on compare button should be hidden
      const compareButton = screen.getByRole('button', { name: /Compare.*selected designs/i });
      const icon = compareButton.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Design Card Display', () => {
    it('should display design metrics correctly', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      expect(screen.getByText('85.2 kg')).toBeInTheDocument();
      expect(screen.getByText('€12,500')).toBeInTheDocument();
      expect(screen.getByText('1750 bar')).toBeInTheDocument();
    });

    it('should show category badge with correct styling', () => {
      mockStore.paretoFront = mockParetoDesigns;
      render(<ParetoScreen />);

      const lightestBadge = screen.getByText('lightest');
      expect(lightestBadge).toBeInTheDocument();
      expect(lightestBadge).toHaveClass('capitalize');

      const balancedBadge = screen.getByText('balanced');
      expect(balancedBadge).toBeInTheDocument();
    });
  });
});
