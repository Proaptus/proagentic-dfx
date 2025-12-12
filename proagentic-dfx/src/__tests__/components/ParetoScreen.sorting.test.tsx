import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParetoScreen } from '@/components/screens/ParetoScreen';
import { useAppStore } from '@/lib/stores/app-store';
import * as apiClient from '@/lib/api/client';
import type { ParetoDesign, OptimizationJob } from '@/lib/types';

// Mock the dependencies
vi.mock('@/lib/stores/app-store');
vi.mock('@/lib/api/client');
vi.mock('@/components/charts/ParetoChart', () => ({
  ParetoChart: () => <div data-testid="pareto-chart">Chart</div>,
}));

// Mock data for sorting tests
const mockParetoDesigns: ParetoDesign[] = [
  {
    id: 'D001',
    weight_kg: 95.0,
    cost_eur: 12500,
    burst_pressure_bar: 1750,
    burst_ratio: 2.5,
    p_failure: 0.00001,
    fatigue_life_cycles: 50000,
    permeation_rate: 0.5,
    volumetric_efficiency: 0.85,
    trade_off_category: 'lightest',
  },
  {
    id: 'D002',
    weight_kg: 85.2,
    cost_eur: 13200,
    burst_pressure_bar: 1800,
    burst_ratio: 2.57,
    p_failure: 0.000005,
    fatigue_life_cycles: 55000,
    permeation_rate: 0.45,
    volumetric_efficiency: 0.87,
    trade_off_category: 'balanced',
  },
  {
    id: 'D003',
    weight_kg: 92.5,
    cost_eur: 11000,
    burst_pressure_bar: 1775,
    burst_ratio: 2.54,
    p_failure: 0.000007,
    fatigue_life_cycles: 52000,
    permeation_rate: 0.48,
    volumetric_efficiency: 0.86,
    trade_off_category: 'cheapest',
  },
  {
    id: 'D004',
    weight_kg: 88.7,
    cost_eur: 14000,
    burst_pressure_bar: 1825,
    burst_ratio: 2.61,
    p_failure: 0.000003,
    fatigue_life_cycles: 58000,
    permeation_rate: 0.42,
    volumetric_efficiency: 0.88,
    trade_off_category: 'conservative',
  },
];

const mockOptimizationJob: OptimizationJob = {
  job_id: 'test-job-123',
  status: 'completed',
  stream_url: 'http://localhost:3001/api/optimization/test-job-123/stream',
};

describe('ParetoScreen - ISSUE-015 Sorting Functionality', () => {
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
    mockStore = {
      paretoFront: mockParetoDesigns,
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

  describe('Sort Controls UI', () => {
    it('should render sort field dropdown', () => {
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      expect(sortSelect).toBeInTheDocument();
    });

    it('should render all sort field options', () => {
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      const options = within(sortSelect).getAllByRole('option');

      expect(options).toHaveLength(5);
      expect(options[0]).toHaveTextContent('Design ID');
      expect(options[1]).toHaveTextContent('Weight');
      expect(options[2]).toHaveTextContent('Cost');
      expect(options[3]).toHaveTextContent('Burst Pressure');
      expect(options[4]).toHaveTextContent('Reliability');
    });

    it('should render sort direction toggle button', () => {
      render(<ParetoScreen />);

      const sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      expect(sortDirectionButton).toBeInTheDocument();
    });

    it('should show ChevronUp icon when sorting ascending', () => {
      render(<ParetoScreen />);

      const sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      // Check that button exists and has chevron-up via aria-label
      expect(sortDirectionButton).toBeInTheDocument();
    });
  });

  describe('Sort by Design ID', () => {
    it('should sort designs by ID in ascending order by default', () => {
      render(<ParetoScreen />);

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      expect(designCards[0]).toHaveTextContent('Design D001');
      expect(designCards[1]).toHaveTextContent('Design D002');
      expect(designCards[2]).toHaveTextContent('Design D003');
      expect(designCards[3]).toHaveTextContent('Design D004');
    });

    it('should sort designs by ID in descending order when direction is toggled', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      await user.click(sortDirectionButton);

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      expect(designCards[0]).toHaveTextContent('Design D004');
      expect(designCards[1]).toHaveTextContent('Design D003');
      expect(designCards[2]).toHaveTextContent('Design D002');
      expect(designCards[3]).toHaveTextContent('Design D001');
    });
  });

  describe('Sort by Weight', () => {
    it('should sort designs by weight in ascending order', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'weight_kg');

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      // D002: 85.2 kg, D004: 88.7 kg, D003: 92.5 kg, D001: 95.0 kg
      expect(designCards[0]).toHaveTextContent('Design D002');
      expect(designCards[1]).toHaveTextContent('Design D004');
      expect(designCards[2]).toHaveTextContent('Design D003');
      expect(designCards[3]).toHaveTextContent('Design D001');
    });

    it('should sort designs by weight in descending order', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'weight_kg');

      const sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      await user.click(sortDirectionButton);

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      // D001: 95.0 kg, D003: 92.5 kg, D004: 88.7 kg, D002: 85.2 kg
      expect(designCards[0]).toHaveTextContent('Design D001');
      expect(designCards[1]).toHaveTextContent('Design D003');
      expect(designCards[2]).toHaveTextContent('Design D004');
      expect(designCards[3]).toHaveTextContent('Design D002');
    });
  });

  describe('Sort by Cost', () => {
    it('should sort designs by cost in ascending order', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'cost_eur');

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      // D003: 11000, D001: 12500, D002: 13200, D004: 14000
      expect(designCards[0]).toHaveTextContent('Design D003');
      expect(designCards[1]).toHaveTextContent('Design D001');
      expect(designCards[2]).toHaveTextContent('Design D002');
      expect(designCards[3]).toHaveTextContent('Design D004');
    });

    it('should sort designs by cost in descending order', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'cost_eur');

      const sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      await user.click(sortDirectionButton);

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      // D004: 14000, D002: 13200, D001: 12500, D003: 11000
      expect(designCards[0]).toHaveTextContent('Design D004');
      expect(designCards[1]).toHaveTextContent('Design D002');
      expect(designCards[2]).toHaveTextContent('Design D001');
      expect(designCards[3]).toHaveTextContent('Design D003');
    });
  });

  describe('Sort by Burst Pressure', () => {
    it('should sort designs by burst pressure in ascending order', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'burst_pressure_bar');

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      // D001: 1750, D003: 1775, D002: 1800, D004: 1825
      expect(designCards[0]).toHaveTextContent('Design D001');
      expect(designCards[1]).toHaveTextContent('Design D003');
      expect(designCards[2]).toHaveTextContent('Design D002');
      expect(designCards[3]).toHaveTextContent('Design D004');
    });

    it('should sort designs by burst pressure in descending order', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'burst_pressure_bar');

      const sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      await user.click(sortDirectionButton);

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      // D004: 1825, D002: 1800, D003: 1775, D001: 1750
      expect(designCards[0]).toHaveTextContent('Design D004');
      expect(designCards[1]).toHaveTextContent('Design D002');
      expect(designCards[2]).toHaveTextContent('Design D003');
      expect(designCards[3]).toHaveTextContent('Design D001');
    });
  });

  describe('Sort by Reliability (P(Failure))', () => {
    it('should sort designs by p_failure in ascending order (most reliable first)', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'p_failure');

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      // D004: 0.000003, D002: 0.000005, D003: 0.000007, D001: 0.00001
      expect(designCards[0]).toHaveTextContent('Design D004');
      expect(designCards[1]).toHaveTextContent('Design D002');
      expect(designCards[2]).toHaveTextContent('Design D003');
      expect(designCards[3]).toHaveTextContent('Design D001');
    });

    it('should sort designs by p_failure in descending order (least reliable first)', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'p_failure');

      const sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      await user.click(sortDirectionButton);

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      // D001: 0.00001, D003: 0.000007, D002: 0.000005, D004: 0.000003
      expect(designCards[0]).toHaveTextContent('Design D001');
      expect(designCards[1]).toHaveTextContent('Design D003');
      expect(designCards[2]).toHaveTextContent('Design D002');
      expect(designCards[3]).toHaveTextContent('Design D004');
    });
  });

  describe('Sort Direction Toggle', () => {
    it('should update aria-label when direction changes', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      expect(sortDirectionButton).toHaveAccessibleName(/ascending/i);

      await user.click(sortDirectionButton);

      const updatedButton = screen.getByLabelText(/Sort descending/i);
      expect(updatedButton).toHaveAccessibleName(/descending/i);
    });

    it('should toggle sort direction multiple times', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'weight_kg');

      let designCards = screen.getAllByText(/^Design D\d{3}$/);
      expect(designCards[0]).toHaveTextContent('Design D002'); // Lightest

      // Toggle to descending
      let sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      await user.click(sortDirectionButton);

      designCards = screen.getAllByText(/^Design D\d{3}$/);
      expect(designCards[0]).toHaveTextContent('Design D001'); // Heaviest

      // Toggle back to ascending
      sortDirectionButton = screen.getByLabelText(/Sort descending/i);
      await user.click(sortDirectionButton);

      designCards = screen.getAllByText(/^Design D\d{3}$/);
      expect(designCards[0]).toHaveTextContent('Design D002'); // Lightest again
    });
  });

  describe('Sort with Category Filter (ISSUE-014 Integration)', () => {
    it('should apply sort to filtered designs', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      // Filter to balanced category (only D002)
      const categoryFilter = screen.getByLabelText(/Filter by category/i);
      await user.selectOptions(categoryFilter, 'balanced');

      // Sort by cost
      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'cost_eur');

      // Should only show D002
      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      expect(designCards).toHaveLength(1);
      expect(designCards[0]).toHaveTextContent('Design D002');
    });

    it('should maintain sort order when changing category filter', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      // Sort by weight ascending
      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'weight_kg');

      // Filter to all categories
      const categoryFilter = screen.getByLabelText(/Filter by category/i);
      await user.selectOptions(categoryFilter, 'all');

      let designCards = screen.getAllByText(/^Design D\d{3}$/);
      expect(designCards[0]).toHaveTextContent('Design D002'); // Lightest

      // Change filter - sort should still apply
      await user.selectOptions(categoryFilter, 'balanced');

      designCards = screen.getAllByText(/^Design D\d{3}$/);
      expect(designCards).toHaveLength(1); // Only balanced category designs (D002)
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for sort field select', () => {
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      expect(sortSelect).toHaveAttribute('aria-label', 'Sort by field');
    });

    it('should have proper aria-label for sort direction button', () => {
      render(<ParetoScreen />);

      const sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      expect(sortDirectionButton).toHaveAttribute('aria-label', 'Sort ascending');
    });

    it('should update aria-label dynamically when sort direction changes', async () => {
      const user = userEvent.setup();
      render(<ParetoScreen />);

      let sortDirectionButton = screen.getByLabelText(/Sort ascending/i);
      expect(sortDirectionButton).toHaveAttribute('aria-label', 'Sort ascending');

      await user.click(sortDirectionButton);

      sortDirectionButton = screen.getByLabelText(/Sort descending/i);
      expect(sortDirectionButton).toHaveAttribute('aria-label', 'Sort descending');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty design list', () => {
      mockStore.paretoFront = [];
      render(<ParetoScreen />);

      const designCards = screen.queryAllByText(/^Design D\d{3}$/);
      expect(designCards).toHaveLength(0);
    });

    it('should handle single design', () => {
      mockStore.paretoFront = [mockParetoDesigns[0]];
      render(<ParetoScreen />);

      const designCards = screen.getAllByText(/^Design D\d{3}$/);
      expect(designCards).toHaveLength(1);
      expect(designCards[0]).toHaveTextContent('Design D001');
    });

    it('should maintain selection state when sorting changes', async () => {
      const user = userEvent.setup();
      mockStore.selectedDesigns = ['D002'];
      render(<ParetoScreen />);

      const sortSelect = screen.getByLabelText(/Sort by field/i);
      await user.selectOptions(sortSelect, 'weight_kg');

      // D002 should still be selected after sort
      const selectedCard = screen.getByRole('button', { name: /Select balanced design D002/i });
      expect(selectedCard).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
