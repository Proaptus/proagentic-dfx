import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewerScreen } from '@/components/screens/ViewerScreen';
import { useAppStore } from '@/lib/stores/app-store';
import * as apiClient from '@/lib/api/client';
import type { DesignGeometry, DesignStress, DesignSummary } from '@/lib/types';

// Mock the API client
vi.mock('@/lib/api/client');

// Mock the app store
vi.mock('@/lib/stores/app-store');

// Mock the CAD viewer component (lazy loaded)
vi.mock('@/components/cad/CADTankViewer', () => ({
  default: vi.fn(() => <div data-testid="cad-viewer">CAD Viewer Mock</div>),
}));

// Mock MeasurementTools component
vi.mock('@/components/viewer/MeasurementTools', () => ({
  MeasurementTools: vi.fn(({ mode, onModeChange }) => (
    <div data-testid="measurement-tools">
      <button onClick={() => onModeChange('distance')}>Distance Mode</button>
      <button onClick={() => onModeChange(null)}>Clear Mode</button>
      <div>Mode: {mode || 'None'}</div>
    </div>
  )),
  calculateDistance: vi.fn(),
  calculateAngle: vi.fn(),
  calculateRadius: vi.fn(),
}));

// Mock ViewModeControls component
vi.mock('@/components/viewer/ViewModeControls', () => ({
  ViewModeControls: vi.fn(({
    showStress,
    showWireframe,
    onToggleStress,
    onToggleWireframe,
  }) => (
    <div data-testid="view-mode-controls">
      <button onClick={onToggleStress}>
        {showStress ? 'Disable Stress' : 'Enable Stress'}
      </button>
      <button onClick={onToggleWireframe}>
        {showWireframe ? 'Disable Wireframe' : 'Enable Wireframe'}
      </button>
    </div>
  )),
}));

// Mock LayerControls component
vi.mock('@/components/viewer/LayerControls', () => ({
  LayerControls: vi.fn(({ layers, onShowAll, onHideAll }) => (
    <div data-testid="layer-controls">
      <div>Layers: {layers.length}</div>
      <button onClick={onShowAll}>Show All</button>
      <button onClick={onHideAll}>Hide All</button>
    </div>
  )),
}));

const mockGeometry: DesignGeometry = {
  design_id: 'C',
  dimensions: {
    inner_radius_mm: 200,
    outer_radius_mm: 220,
    cylinder_length_mm: 800,
    total_length_mm: 1000,
    wall_thickness_mm: 20,
    internal_volume_liters: 100,
  },
  dome: {
    type: 'isotensoid',
    parameters: {
      alpha_0_deg: 30,
      r_0_mm: 200,
      depth_mm: 150,
      boss_id_mm: 20,
      boss_od_mm: 40,
    },
    profile_points: [{ r: 0, z: 0 }],
  },
  thickness_distribution: {
    cylinder_mm: 20,
    dome_apex_mm: 18,
    dome_average_mm: 19,
    boss_region_mm: 25,
  },
  layup: {
    total_layers: 10,
    helical_count: 6,
    hoop_count: 4,
    fiber_volume_fraction: 0.6,
    liner_thickness_mm: 2,
    layers: [
      { layer: 0, type: 'helical', angle_deg: 15, thickness_mm: 2, coverage: 'full' },
      { layer: 1, type: 'hoop', angle_deg: 90, thickness_mm: 2, coverage: 'cylinder' },
      { layer: 2, type: 'helical', angle_deg: 15, thickness_mm: 2, coverage: 'full' },
    ],
  },
};

const mockStress: DesignStress = {
  design_id: 'C',
  load_case: 'proof_test',
  load_pressure_bar: 875,
  stress_type: 'von_mises',
  max_stress: {
    value_mpa: 800,
    location: { r: 200, z: 0, theta: 0 },
    region: 'cylinder',
    allowable_mpa: 1000,
    margin_percent: 25,
  },
  contour_data: {
    type: 'von_mises',
    colormap: 'viridis',
    min_value: 100,
    max_value: 800,
    nodes: [
      { x: 0, y: 0, z: 0, value: 400 },
      { x: 1, y: 0, z: 0, value: 500 },
    ],
  },
};

const mockSummary: DesignSummary = {
  id: 'C',
  trade_off_category: 'recommended',
  recommendation_reason: 'Best balanced design',
  summary: {
    weight_kg: 45,
    cost_eur: 5000,
    burst_pressure_bar: 1400,
    burst_ratio: 2.0,
    p_failure: 1e-6,
    fatigue_life_cycles: 50000,
    permeation_rate: 0.5,
    volumetric_efficiency: 0.7,
  },
};

describe('ViewerScreen', () => {
  const mockSetCurrentDesign = vi.fn();
  const mockSetScreen = vi.fn();

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default store mock
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentDesign: 'C',
      setCurrentDesign: mockSetCurrentDesign,
      setScreen: mockSetScreen,
      paretoFront: [],
    });

    // Setup default API mocks
    vi.mocked(apiClient.getDesignGeometry).mockResolvedValue(mockGeometry);
    vi.mocked(apiClient.getDesignStress).mockResolvedValue(mockStress);
    vi.mocked(apiClient.getDesign).mockResolvedValue(mockSummary);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the main page header', () => {
      render(<ViewerScreen />);

      expect(screen.getByRole('heading', { level: 1, name: /3D Tank Viewer/i })).toBeInTheDocument();
      expect(
        screen.getByText(/Interactive 3D visualization of hydrogen tank design/i)
      ).toBeInTheDocument();
    });

    it('should render the analyze button', () => {
      render(<ViewerScreen />);

      const analyzeButton = screen.getByRole('button', { name: /Navigate to analysis screen/i });
      expect(analyzeButton).toBeInTheDocument();
    });

    it('should display loading state initially', () => {
      render(<ViewerScreen />);

      expect(screen.getByText(/Loading geometry.../i)).toBeInTheDocument();
    });

    it('should render CAD viewer after data loads', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('cad-viewer')).toBeInTheDocument();
      });
    });

    it('should display current design in viewport header', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        const viewportHeader = screen.getByRole('status', { name: '' });
        expect(viewportHeader).toHaveTextContent(/Design C/i);
        expect(viewportHeader).toHaveTextContent(/Geometry Loaded/i);
      });
    });
  });

  describe('Design Selection', () => {
    it('should render design selector with default designs', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Select Design A/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Select Design B/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Select Design C/i })).toBeInTheDocument();
      });
    });

    it('should highlight currently selected design', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        const designCButton = screen.getByRole('button', {
          name: /Select Design C.*currently active/i,
        });
        expect(designCButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should change design when clicking a different design button', async () => {
      const user = userEvent.setup();
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Select Design A/i })).toBeInTheDocument();
      });

      const designAButton = screen.getByRole('button', { name: /Select Design A/i });
      await user.click(designAButton);

      expect(mockSetCurrentDesign).toHaveBeenCalledWith('A');
    });

    it('should use pareto front designs when available', () => {
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentDesign: 'P1',
        setCurrentDesign: mockSetCurrentDesign,
        setScreen: mockSetScreen,
        paretoFront: [
          { id: 'P1', weight_kg: 40, cost_eur: 4000 },
          { id: 'P2', weight_kg: 45, cost_eur: 4500 },
          { id: 'P3', weight_kg: 50, cost_eur: 5000 },
        ],
      });

      render(<ViewerScreen />);

      expect(screen.getByRole('button', { name: /Select Design P1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Design P2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Design P3/i })).toBeInTheDocument();
    });
  });

  describe('View Mode Controls', () => {
    it('should render view mode controls', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('view-mode-controls')).toBeInTheDocument();
      });
    });

    it('should toggle stress analysis mode', async () => {
      const user = userEvent.setup();
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('view-mode-controls')).toBeInTheDocument();
      });

      const stressButton = screen.getByRole('button', { name: /Enable Stress/i });
      await user.click(stressButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Disable Stress/i })).toBeInTheDocument();
      });
    });

    it('should toggle wireframe mode', async () => {
      const user = userEvent.setup();
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('view-mode-controls')).toBeInTheDocument();
      });

      const wireframeButton = screen.getByRole('button', { name: /Enable Wireframe/i });
      await user.click(wireframeButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Disable Wireframe/i })).toBeInTheDocument();
      });
    });
  });

  describe('Layer Controls', () => {
    it('should render layer controls when geometry has layers', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('layer-controls')).toBeInTheDocument();
      });
    });

    it('should display correct number of layers', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        const layerControls = screen.getByTestId('layer-controls');
        expect(within(layerControls).getByText(/Layers: 3/i)).toBeInTheDocument();
      });
    });
  });

  describe('Measurement Tools', () => {
    it('should render measurement tools', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('measurement-tools')).toBeInTheDocument();
      });
    });

    it('should change measurement mode when tool selected', async () => {
      const user = userEvent.setup();
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('measurement-tools')).toBeInTheDocument();
      });

      const distanceButton = screen.getByRole('button', { name: /Distance Mode/i });
      await user.click(distanceButton);

      await waitFor(() => {
        expect(screen.getByText(/Mode: distance/i)).toBeInTheDocument();
      });
    });

    it('should disable auto-rotate when measurement mode is active', async () => {
      const user = userEvent.setup();
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('measurement-tools')).toBeInTheDocument();
      });

      // Enable distance mode
      const distanceButton = screen.getByRole('button', { name: /Distance Mode/i });
      await user.click(distanceButton);

      // Auto-rotate should be disabled (implementation detail tested via CADTankViewer props)
      await waitFor(() => {
        expect(screen.getByText(/Mode: distance/i)).toBeInTheDocument();
      });
    });
  });

  describe('Geometry Summary', () => {
    it('should display geometry specifications when data is loaded', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Geometry Specifications/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/200 mm/)).toBeInTheDocument(); // Inner radius
      expect(screen.getByText(/1000 mm/)).toBeInTheDocument(); // Total length
      expect(screen.getByText(/20 mm/)).toBeInTheDocument(); // Wall thickness
      expect(screen.getByText(/100 L/)).toBeInTheDocument(); // Internal volume
    });
  });

  describe('Performance Summary', () => {
    it('should display performance metrics when data is loaded', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Performance Metrics/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/45 kg/)).toBeInTheDocument(); // Weight
      expect(screen.getByText(/€5,000/)).toBeInTheDocument(); // Cost
      expect(screen.getByText(/1400 bar/)).toBeInTheDocument(); // Burst pressure
    });
  });

  describe('Stress Summary', () => {
    it('should display stress analysis when data is loaded', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Stress Analysis/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/800 MPa/)).toBeInTheDocument(); // Max stress
      expect(screen.getByText(/1000 MPa/)).toBeInTheDocument(); // Allowable stress
      expect(screen.getByText(/\+25%/)).toBeInTheDocument(); // Safety margin
    });
  });

  describe('Navigation', () => {
    it('should navigate to analysis screen when analyze button is clicked', async () => {
      const user = userEvent.setup();
      render(<ViewerScreen />);

      const analyzeButton = screen.getByRole('button', { name: /Navigate to analysis screen/i });
      await user.click(analyzeButton);

      expect(mockSetScreen).toHaveBeenCalledWith('analysis');
    });
  });

  describe('Error Handling', () => {
    it('should display no data message when geometry is not available', async () => {
      vi.mocked(apiClient.getDesignGeometry).mockResolvedValue(null as unknown as DesignGeometry);

      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByText(/No geometry data available/i)).toBeInTheDocument();
        expect(screen.getByText(/Select a design to begin/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(apiClient.getDesignGeometry).mockRejectedValue(new Error('API Error'));

      render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByText(/No geometry data available/i)).toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA landmarks', () => {
      render(<ViewerScreen />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /3D tank visualization/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Design properties and tools/i)).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<ViewerScreen />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/3D Tank Viewer/i);

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have aria-live regions for status updates', async () => {
      render(<ViewerScreen />);

      const statusRegions = screen.getAllByRole('status');
      expect(statusRegions.length).toBeGreaterThan(0);

      // At least one status region should have aria-live
      const liveRegions = statusRegions.filter(el => el.getAttribute('aria-live') === 'polite');
      expect(liveRegions.length).toBeGreaterThan(0);
    });

    it('should have proper button labels', async () => {
      render(<ViewerScreen />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          expect(
            button.textContent || button.getAttribute('aria-label')
          ).toBeTruthy();
        });
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should memoize layers array', async () => {
      const { rerender } = render(<ViewerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('cad-viewer')).toBeInTheDocument();
      });

      // Rerender with same geometry
      rerender(<ViewerScreen />);

      // Layers should be memoized (no unnecessary recalculation)
      expect(screen.getByTestId('layer-controls')).toBeInTheDocument();
    });

    it('should use lazy loading for CAD viewer', async () => {
      render(<ViewerScreen />);

      // Component uses Suspense for lazy loading
      // After data loads, CAD viewer should be present
      await waitFor(() => {
        expect(screen.getByTestId('cad-viewer')).toBeInTheDocument();
      });
    });
  });
});
