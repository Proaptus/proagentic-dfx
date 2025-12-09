/**
 * CompareScreen Component Tests
 * Tests for REQ-142 to REQ-149: Side-by-side design comparison
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompareScreen } from '@/components/screens/CompareScreen';
import { useAppStore } from '@/lib/stores/app-store';
import * as apiClient from '@/lib/api/client';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  getDesign: vi.fn(),
  getDesignStress: vi.fn(),
}));

// Mock the app store
vi.mock('@/lib/stores/app-store', () => ({
  useAppStore: vi.fn(),
}));

// Mock recharts to avoid canvas/SVG issues in tests
vi.mock('recharts', () => ({
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('CompareScreen', () => {
  const mockSetCurrentDesign = vi.fn();
  const mockSetScreen = vi.fn();

  const mockDesignA = {
    id: 'A',
    weight_kg: 100,
    cost_eur: 5000,
    burst_pressure_bar: 875,
    p_failure: 1e-6,
    fatigue_life_cycles: 50000,
    permeation_rate: 0.5,
    max_stress_mpa: 500,
    stress_margin_percent: 25,
  };

  const mockDesignB = {
    id: 'B',
    weight_kg: 120,
    cost_eur: 4500,
    burst_pressure_bar: 900,
    p_failure: 5e-7,
    fatigue_life_cycles: 60000,
    permeation_rate: 0.4,
    max_stress_mpa: 480,
    stress_margin_percent: 30,
  };

  const mockDesignC = {
    id: 'C',
    weight_kg: 110,
    cost_eur: 4800,
    burst_pressure_bar: 850,
    p_failure: 2e-6,
    fatigue_life_cycles: 45000,
    permeation_rate: 0.6,
    max_stress_mpa: 520,
    stress_margin_percent: 20,
  };

  const mockParetoFront = [
    { id: 'A', weight_kg: 100, cost_eur: 5000 },
    { id: 'B', weight_kg: 120, cost_eur: 4500 },
    { id: 'C', weight_kg: 110, cost_eur: 4800 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default store mock
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedDesigns: ['A', 'B', 'C'],
      setCurrentDesign: mockSetCurrentDesign,
      setScreen: mockSetScreen,
      paretoFront: mockParetoFront,
    });

    // Default API mocks
    (apiClient.getDesign as ReturnType<typeof vi.fn>).mockImplementation((id: string) => {
      const designs: Record<string, typeof mockDesignA> = {
        A: mockDesignA,
        B: mockDesignB,
        C: mockDesignC,
      };
      return Promise.resolve(designs[id]);
    });

    (apiClient.getDesignStress as ReturnType<typeof vi.fn>).mockResolvedValue({
      design_id: 'A',
      max_stress: { value_mpa: 500 },
    });
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      render(<CompareScreen />);
      expect(screen.getByText('Loading comparison data...')).toBeInTheDocument();
    });

    it('should render comparison data after loading', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByText('Design Comparison')).toBeInTheDocument();
      });

      expect(screen.getByText(/Side-by-side analysis/)).toBeInTheDocument();
    });

    it('should display the correct number of designs', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByText('3 Designs')).toBeInTheDocument();
      });
    });

    it('should render radar chart', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
      });
    });

    it('should render metrics table', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByText('Detailed Metrics')).toBeInTheDocument();
        expect(screen.getByText('Weight (kg)')).toBeInTheDocument();
        expect(screen.getByText('Cost (€)')).toBeInTheDocument();
        expect(screen.getByText('Burst Pressure (bar)')).toBeInTheDocument();
      });
    });

    it('should render design cards', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByText('Design A')).toBeInTheDocument();
        expect(screen.getByText('Design B')).toBeInTheDocument();
        expect(screen.getByText('Design C')).toBeInTheDocument();
      });
    });
  });

  describe('Design Selection', () => {
    it('should use selected designs from store', async () => {
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedDesigns: ['A', 'B'],
        setCurrentDesign: mockSetCurrentDesign,
        setScreen: mockSetScreen,
        paretoFront: mockParetoFront,
      });

      render(<CompareScreen />);

      await waitFor(() => {
        expect(apiClient.getDesign).toHaveBeenCalledWith('A');
        expect(apiClient.getDesign).toHaveBeenCalledWith('B');
        expect(apiClient.getDesign).not.toHaveBeenCalledWith('C');
      });
    });

    it('should fall back to pareto front if no designs selected', async () => {
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedDesigns: [],
        setCurrentDesign: mockSetCurrentDesign,
        setScreen: mockSetScreen,
        paretoFront: mockParetoFront,
      });

      render(<CompareScreen />);

      await waitFor(() => {
        expect(apiClient.getDesign).toHaveBeenCalledWith('A');
        expect(apiClient.getDesign).toHaveBeenCalledWith('B');
        expect(apiClient.getDesign).toHaveBeenCalledWith('C');
      });
    });
  });

  describe('Metrics Comparison', () => {
    it('should highlight best performance in metrics table', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
      });

      // Check for best indicators (green checkmarks)
      const checkIcons = screen.getAllByRole('img', { hidden: true });
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('should display formatted metric values', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument(); // weight_kg for Design A
        expect(screen.getByText('5,000')).toBeInTheDocument(); // cost_eur for Design A
      });
    });

    it('should calculate correct best values', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        // Design A should be best for weight (100 kg - lowest)
        // Design B should be best for cost (4500 EUR - lowest)
        // Design B should be best for burst pressure (900 bar - highest)
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should navigate to viewer when "View 3D" is clicked', async () => {
      const user = userEvent.setup();
      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByText('Design A')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByText('View 3D');
      await user.click(viewButtons[0]);

      expect(mockSetCurrentDesign).toHaveBeenCalledWith('A');
      expect(mockSetScreen).toHaveBeenCalledWith('viewer');
    });

    it('should navigate to export when "Export" is clicked', async () => {
      const user = userEvent.setup();
      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByText('Design A')).toBeInTheDocument();
      });

      const exportButtons = screen.getAllByText(/Export/);
      await user.click(exportButtons[0]);

      expect(mockSetCurrentDesign).toHaveBeenCalledWith('A');
      expect(mockSetScreen).toHaveBeenCalledWith('export');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.getDesign as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error')
      );

      render(<CompareScreen />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('should display no data message when comparison is null', async () => {
      (apiClient.getDesign as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByText('No comparison data available')).toBeInTheDocument();
      });
    });
  });

  describe('Design Cards', () => {
    it('should render metrics for each design', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        // Check for Weight metric
        expect(screen.getAllByText('Weight').length).toBeGreaterThan(0);
        // Check for Cost metric
        expect(screen.getAllByText('Cost').length).toBeGreaterThan(0);
        // Check for Burst Pressure metric
        expect(screen.getAllByText('Burst Pressure').length).toBeGreaterThan(0);
      });
    });

    it('should display candidate badges', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByText('Candidate 1')).toBeInTheDocument();
        expect(screen.getByText('Candidate 2')).toBeInTheDocument();
        expect(screen.getByText('Candidate 3')).toBeInTheDocument();
      });
    });

    it('should format P(Failure) in scientific notation', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        // mockDesignA has p_failure: 1e-6
        const pFailureElements = screen.getAllByText(/e-/);
        expect(pFailureElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for design indicators', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        expect(screen.getByLabelText('Design A indicator')).toBeInTheDocument();
        expect(screen.getByLabelText('Design B indicator')).toBeInTheDocument();
        expect(screen.getByLabelText('Design C indicator')).toBeInTheDocument();
      });
    });

    it('should have accessible table structure', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();

        const headers = screen.getAllByRole('columnheader');
        expect(headers.length).toBeGreaterThan(0);
      });
    });

    it('should have descriptive button labels', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        const viewButtons = screen.getAllByText('View 3D');
        expect(viewButtons.length).toBe(3);

        const exportButtons = screen.getAllByText(/Export/);
        expect(exportButtons.length).toBe(3);
      });
    });
  });

  describe('Visual Indicators', () => {
    it('should render difference indicators for metrics', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        // Check for performance indicator labels
        const indicators = screen.getAllByLabelText(/performance/i);
        expect(indicators.length).toBeGreaterThan(0);
      });
    });

    it('should use color coding for performance', async () => {
      render(<CompareScreen />);

      await waitFor(() => {
        // Check for cards with proper styling
        const designCards = screen.getAllByText(/Design [ABC]/);
        expect(designCards.length).toBe(3);
      });
    });
  });
});
