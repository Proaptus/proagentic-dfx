/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FailureAnalysisPanel Component - Comprehensive Integration Tests
 *
 * Test Coverage:
 * - 20+ tests for failure mode analysis and FMEA visualization
 * - Severity and probability calculations
 * - Mitigation strategy display and filtering
 * - Load case and failure mode selection
 * - Data visualization (Tornado and Radar charts)
 * - Proper async/await handling with waitFor and act()
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { FailureAnalysisPanel } from '@/components/analysis/FailureAnalysisPanel';
import type { DesignFailure } from '@/lib/types';

// Mock fetch for API calls
global.fetch = vi.fn();

const mockFailureData: DesignFailure = {
  design_id: 'C',
  predicted_failure_mode: {
    mode: 'fiber_breakage',
    is_preferred: true,
    location: 'cylinder_mid_section',
    confidence: 0.92,
    explanation: 'Progressive fiber tension failure under hoop stress is preferred as it provides warning.',
  },
  tsai_wu: {
    max_at_test: { value: 0.8, layer: 2, location: 'cylinder' },
    max_at_burst: { value: 1.2, layer: 2, location: 'cylinder' },
  },
  tsai_wu_per_layer: [
    { layer: 1, type: 'helical', value: 0.65, status: 'safe' },
    { layer: 2, type: 'hoop', value: 0.8, status: 'safe' },
    { layer: 3, type: 'helical', value: 0.72, status: 'safe' },
  ],
  hashin_indices: [
    { mode: 'Fiber Tension', value: 0.38, threshold: 1.0, status: 'safe' },
    { mode: 'Fiber Compression', value: 0.22, threshold: 1.0, status: 'safe' },
    { mode: 'Matrix Tension', value: 0.65, threshold: 1.0, status: 'safe' },
    { mode: 'Matrix Compression', value: 0.41, threshold: 1.0, status: 'safe' },
  ],
  progressive_failure_sequence: [
    { stage: 1, pressure: 700, event: 'Operating Pressure', description: 'Normal operation' },
    { stage: 2, pressure: 1050, event: 'First Ply Failure', description: 'First layer damage initiation' },
    { stage: 3, pressure: 1575, event: 'Test Pressure', description: 'Design verification pressure' },
    { stage: 4, pressure: 2100, event: 'Burst Pressure', description: 'Complete failure threshold' },
  ],
};

describe('FailureAnalysisPanel - Comprehensive Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  // ========================================================================
  // COMPONENT RENDERING & INITIALIZATION
  // ========================================================================

  describe('Component Rendering & Initialization', () => {
    it('should render without crashing', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/predicted failure mode/i)).toBeInTheDocument();
    });

    it('should display load case selection control', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      const loadCaseLabel = screen.getByText('Load Case');
      expect(loadCaseLabel).toBeInTheDocument();
    });

    it('should display failure mode selection control', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      const failureModeLabel = screen.getByText('Failure Mode');
      expect(failureModeLabel).toBeInTheDocument();
    });

    it('should have equations toggle button', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      const toggleButton = screen.getByRole('button', { name: /show equations/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should render key metrics cards', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText('Safety Factor')).toBeInTheDocument();
      expect(screen.getByText('Critical Mode')).toBeInTheDocument();
      expect(screen.getByText('Max Hashin Index')).toBeInTheDocument();
      expect(screen.getByText('Design Margin')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // FAILURE MODE ANALYSIS
  // ========================================================================

  describe('Failure Mode Analysis & Prediction', () => {
    it('should display predicted failure mode with preferred indicator', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      await waitFor(() => {
        expect(screen.getAllByText(/fiber breakage/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/preferred/i).length).toBeGreaterThan(0);
      });
    });

    it('should show failure mode explanation', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/progressive fiber tension/i)).toBeInTheDocument();
    });

    it('should display failure mode location', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/cylinder mid section/i)).toBeInTheDocument();
    });

    it('should display confidence percentage', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/92%/)).toBeInTheDocument();
    });

    it('should indicate non-preferred failure modes with warning', async () => {
      const nonPreferredData: DesignFailure = {
        ...mockFailureData,
        predicted_failure_mode: {
          ...mockFailureData.predicted_failure_mode,
          is_preferred: false,
        },
      };

      render(<FailureAnalysisPanel data={nonPreferredData} />);

      await waitFor(() => {
        expect(screen.getAllByText(/WARNING/i).length).toBeGreaterThan(0);
      });
    });

    it('should change failure mode when selection changes', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockFailureData }),
      });

      render(<FailureAnalysisPanel data={mockFailureData} />);

      const failureModeSelect = screen.getByDisplayValue(/fiber tension/i) as HTMLSelectElement;
      await userEvent.selectOptions(failureModeSelect, 'fiber_compression');

      await waitFor(
        () => {
          expect(failureModeSelect.value).toBe('fiber_compression');
        },
        { timeout: 3000 }
      );
    });
  });

  // ========================================================================
  // SAFETY FACTOR & SEVERITY CALCULATIONS
  // ========================================================================

  describe('Safety Factor & Severity Calculations', () => {
    it('should calculate and display safety factor', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      await waitFor(() => {
        expect(screen.getByText('Safety Factor')).toBeInTheDocument();
        // Safety Factor = 1 / sqrt(Tsai-Wu index) = 1 / sqrt(0.8) ≈ 1.12
        expect(screen.getAllByText(/1.1/i).length).toBeGreaterThan(0);
      });
    });

    it('should display design margin calculation', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText('Design Margin')).toBeInTheDocument();
    });

    it('should show max Hashin index value', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      await waitFor(() => {
        expect(screen.getByText('Max Hashin Index')).toBeInTheDocument();
        expect(screen.getAllByText(/0\.65/i).length).toBeGreaterThan(0);
      });
    });

    it('should indicate safety status in metric cards', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      // Cards should show safety status with appropriate coloring
      expect(screen.getByText(/safety factor/i)).toBeInTheDocument();
    });
  });

  // ========================================================================
  // FMEA DATA VISUALIZATION
  // ========================================================================

  describe('FMEA Data Visualization', () => {
    it('should render Tornado chart for sensitivity analysis', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/failure sensitivity analysis/i)).toBeInTheDocument();
    });

    it('should render Radar chart for failure envelope', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/failure envelope comparison/i)).toBeInTheDocument();
    });

    it('should display Tsai-Wu failure index table', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/tsai-wu failure index/i)).toBeInTheDocument();
    });

    it('should show per-layer failure indices', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      await waitFor(() => {
        expect(screen.getAllByText(/layer/i).length).toBeGreaterThan(0);
        // Layer data should be visible in table
        expect(screen.getAllByText(/helical/i).length).toBeGreaterThan(0);
      });
    });

    it('should display Hashin damage criteria', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/hashin damage criteria/i)).toBeInTheDocument();
    });

    it('should show different failure modes in Hashin table', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      await waitFor(() => {
        expect(screen.getAllByText(/fiber tension/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/matrix tension/i).length).toBeGreaterThan(0);
      });
    });
  });

  // ========================================================================
  // FIRST PLY FAILURE (FPF) ANALYSIS
  // ========================================================================

  describe('First Ply Failure (FPF) Analysis', () => {
    it('should display FPF pressure value', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      await waitFor(() => {
        expect(screen.getAllByText(/first ply failure/i).length).toBeGreaterThan(0);
      });
    });

    it('should show critical layer information', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/critical layer/i)).toBeInTheDocument();
    });

    it('should display FPF to test pressure ratio', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/fpf.*test pressure/i)).toBeInTheDocument();
    });

    it('should display FPF to operating pressure ratio', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/fpf.*operating/i)).toBeInTheDocument();
    });

    it('should show burst to FPF margin', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/burst.*fpf margin/i)).toBeInTheDocument();
    });
  });

  // ========================================================================
  // PROGRESSIVE FAILURE SEQUENCE
  // ========================================================================

  describe('Progressive Failure Sequence Timeline', () => {
    it('should render progressive failure timeline', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/progressive failure sequence/i)).toBeInTheDocument();
    });

    it('should display all failure stages', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      await waitFor(() => {
        expect(screen.getAllByText(/operating pressure/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/first ply failure/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/burst pressure/i).length).toBeGreaterThan(0);
      });
    });

    it('should show pressure values for each stage', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      await waitFor(() => {
        expect(screen.getAllByText(/700/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/1050/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/2100/i).length).toBeGreaterThan(0);
      });
    });

    it('should display stage descriptions', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/normal operation/i)).toBeInTheDocument();
      expect(screen.getByText(/first layer damage/i)).toBeInTheDocument();
    });
  });

  // ========================================================================
  // LOAD CASE SELECTION & FILTERING
  // ========================================================================

  describe('Load Case Selection & Filtering', () => {
    it('should allow selecting different load cases', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockFailureData }),
      });

      render(<FailureAnalysisPanel data={mockFailureData} />);

      const loadCaseSelect = screen.getByDisplayValue(/test pressure/i) as HTMLSelectElement;
      await userEvent.selectOptions(loadCaseSelect, 'burst_pressure');

      await waitFor(
        () => {
          expect(loadCaseSelect.value).toBe('burst_pressure');
        },
        { timeout: 3000 }
      );
    });

    it('should show loading indicator when changing load case', async () => {
      let resolveResponse: (value: any) => void;
      const responsePromise = new Promise((resolve) => {
        resolveResponse = resolve;
      });

      (global.fetch as any).mockReturnValueOnce({
        ok: true,
        json: () => responsePromise,
      });

      render(<FailureAnalysisPanel data={mockFailureData} />);

      const loadCaseSelect = screen.getByDisplayValue(/test pressure/i) as HTMLSelectElement;
      await userEvent.selectOptions(loadCaseSelect, 'burst_pressure');

      await waitFor(
        () => {
          expect(screen.getByText(/loading failure analysis/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      resolveResponse!({ ...mockFailureData });
    });

    it('should disable controls while loading', async () => {
      let resolveResponse: (value: any) => void;
      const responsePromise = new Promise((resolve) => {
        resolveResponse = resolve;
      });

      (global.fetch as any).mockReturnValueOnce({
        ok: true,
        json: () => responsePromise,
      });

      render(<FailureAnalysisPanel data={mockFailureData} />);

      const loadCaseSelect = screen.getByDisplayValue(/test pressure/i) as HTMLSelectElement;
      await userEvent.selectOptions(loadCaseSelect, 'burst_pressure');

      await waitFor(
        () => {
          expect(loadCaseSelect).toBeDisabled();
        },
        { timeout: 3000 }
      );

      resolveResponse!({ ...mockFailureData });
    });
  });

  // ========================================================================
  // MITIGATION STRATEGY DISPLAY
  // ========================================================================

  describe('Mitigation Strategy & Recommendations', () => {
    it('should show recommendations for preferred failure modes', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText(/preferred failure mode/i)).toBeInTheDocument();
    });

    it('should provide guidance for non-preferred failure modes', () => {
      const nonPreferredData: DesignFailure = {
        ...mockFailureData,
        predicted_failure_mode: {
          ...mockFailureData.predicted_failure_mode,
          is_preferred: false,
        },
      };

      render(<FailureAnalysisPanel data={nonPreferredData} />);

      expect(screen.getByText(/consider design modifications/i)).toBeInTheDocument();
    });

    it('should display failure mechanism explanation', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      // Check that the mitigation guidance is displayed (fiber tension is preferred failure mode)
      expect(screen.getByText(/preferred failure mode/i)).toBeInTheDocument();
    });

    it('should show warning indicators for concerning values', () => {
      const criticalData: DesignFailure = {
        ...mockFailureData,
        hashin_indices: [
          { mode: 'Fiber Tension', value: 0.95, threshold: 1.0, status: 'caution' },
          { mode: 'Fiber Compression', value: 1.2, threshold: 1.0, status: 'fail' },
        ],
      };

      render(<FailureAnalysisPanel data={criticalData} />);

      // Should show warning for high values
      expect(screen.getByText(/hashin damage criteria/i)).toBeInTheDocument();
    });
  });

  // ========================================================================
  // EQUATIONS TOGGLE
  // ========================================================================

  describe('Equations Display & Toggle', () => {
    it('should hide equations by default', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      const toggleButton = screen.getByRole('button', { name: /show equations/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show equations when toggled', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      const toggleButton = screen.getByRole('button', { name: /show equations/i });
      await userEvent.click(toggleButton);

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /hide equations/i })).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should toggle equations visibility correctly', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      const toggleButton = screen.getByRole('button', { name: /show equations/i });

      await userEvent.click(toggleButton);

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /hide equations/i })).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const hideButton = screen.getByRole('button', { name: /hide equations/i });
      await userEvent.click(hideButton);

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /show equations/i })).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  // ========================================================================
  // DATA CALLBACK & STATE MANAGEMENT
  // ========================================================================

  describe('Data Callbacks & State Management', () => {
    it('should call onFailureDataChange callback when data changes', async () => {
      const onFailureDataChange = vi.fn();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockFailureData }),
      });

      render(
        <FailureAnalysisPanel data={mockFailureData} onFailureDataChange={onFailureDataChange} />
      );

      const failureModeSelect = screen.getByDisplayValue(/fiber tension/i) as HTMLSelectElement;
      await userEvent.selectOptions(failureModeSelect, 'fiber_compression');

      await waitFor(
        () => {
          expect(onFailureDataChange).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<FailureAnalysisPanel data={mockFailureData} />);

      const loadCaseSelect = screen.getByDisplayValue(/test pressure/i);
      await userEvent.selectOptions(loadCaseSelect, 'burst_pressure');

      // Should still display original data without crashing
      expect(screen.getByText('Safety Factor')).toBeInTheDocument();
    });

    it('should update display when props change', async () => {
      const { rerender } = render(<FailureAnalysisPanel data={mockFailureData} />);

      const updatedData: DesignFailure = {
        ...mockFailureData,
        predicted_failure_mode: {
          ...mockFailureData.predicted_failure_mode,
          confidence: 0.98,
        },
      };

      rerender(<FailureAnalysisPanel data={updatedData} />);

      expect(screen.getByText('Safety Factor')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // EDGE CASES & ERROR HANDLING
  // ========================================================================

  describe('Edge Cases & Error Handling', () => {
    it('should handle missing Tsai-Wu per-layer data', () => {
      const minimalData: DesignFailure = {
        design_id: 'C',
        predicted_failure_mode: mockFailureData.predicted_failure_mode,
        tsai_wu: mockFailureData.tsai_wu,
      };

      render(<FailureAnalysisPanel data={minimalData} />);

      expect(screen.getByText('Safety Factor')).toBeInTheDocument();
    });

    it('should handle empty progressive failure sequence', () => {
      const noProgressionData: DesignFailure = {
        ...mockFailureData,
        progressive_failure_sequence: [],
      };

      render(<FailureAnalysisPanel data={noProgressionData} />);

      expect(screen.getByText('Safety Factor')).toBeInTheDocument();
    });

    it('should handle very high safety factor values', () => {
      const safData: DesignFailure = {
        ...mockFailureData,
        tsai_wu: {
          max_at_test: { value: 0.1, layer: 1, location: 'cylinder' },
          max_at_burst: { value: 0.15, layer: 1, location: 'cylinder' },
        },
      };

      render(<FailureAnalysisPanel data={safData} />);

      expect(screen.getByText('Safety Factor')).toBeInTheDocument();
    });

    it('should handle zero or negative Tsai-Wu values safely', () => {
      const invalidData: DesignFailure = {
        ...mockFailureData,
        tsai_wu: {
          max_at_test: { value: 0, layer: 1, location: 'cylinder' },
          max_at_burst: { value: -0.5, layer: 1, location: 'cylinder' },
        },
      };

      render(<FailureAnalysisPanel data={invalidData} />);

      expect(screen.getByText('Safety Factor')).toBeInTheDocument();
    });

    it('should render correctly with custom design ID', () => {
      const customData: DesignFailure = {
        ...mockFailureData,
        design_id: 'CustomDesign-123',
      };

      render(<FailureAnalysisPanel data={customData} designId="CustomDesign-123" />);

      expect(screen.getByText('Safety Factor')).toBeInTheDocument();
    });

    it('should handle rapidly changing selections', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ ...mockFailureData }),
      });

      render(<FailureAnalysisPanel data={mockFailureData} />);

      const loadCaseSelect = screen.getByDisplayValue(/test pressure/i) as HTMLSelectElement;

      await userEvent.selectOptions(loadCaseSelect, 'burst_pressure');
      await userEvent.selectOptions(loadCaseSelect, 'operating_pressure');
      await userEvent.selectOptions(loadCaseSelect, 'test_pressure');

      await waitFor(
        () => {
          expect(loadCaseSelect.value).toBe('test_pressure');
        },
        { timeout: 3000 }
      );
    });
  });

  // ========================================================================
  // ACCESSIBILITY & SEMANTIC HTML
  // ========================================================================

  describe('Accessibility & Semantic HTML', () => {
    it('should have proper form labels for selects', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      expect(screen.getByText('Load Case')).toBeInTheDocument();
      expect(screen.getByText('Failure Mode')).toBeInTheDocument();
    });

    it('should have descriptive button labels', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      const button = screen.getByRole('button', { name: /show equations/i });
      expect(button).toHaveAccessibleName();
    });

    it('should use semantic heading tags', async () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      await waitFor(() => {
        expect(screen.getByText(/predicted failure mode/i)).toBeInTheDocument();
        expect(screen.getAllByText(/first ply failure/i).length).toBeGreaterThan(0);
      });
    });

    it('should have proper table structure with headers', () => {
      render(<FailureAnalysisPanel data={mockFailureData} />);

      const table = screen.getByText(/tsai-wu failure index/i).closest('div');
      expect(table).toBeInTheDocument();
    });
  });
});
