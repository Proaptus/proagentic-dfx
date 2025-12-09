/**
 * ComparisonCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparisonCard } from '@/components/compare/ComparisonCard';

describe('ComparisonCard', () => {
  const mockOnViewDesign = vi.fn();
  const mockOnExport = vi.fn();

  const defaultProps = {
    designId: 'A',
    color: '#3B82F6',
    index: 0,
    metrics: [
      { label: 'Weight', value: 100, unit: 'kg', metricKey: 'weight_kg' },
      { label: 'Cost', value: 5000, unit: '€', metricKey: 'cost_eur' },
      { label: 'Burst Pressure', value: 875, unit: 'bar', metricKey: 'burst_pressure_bar' },
    ],
    allDesignsMetrics: {
      weight_kg: [100, 120, 110],
      cost_eur: [5000, 4500, 4800],
      burst_pressure_bar: [875, 900, 850],
    },
    onViewDesign: mockOnViewDesign,
    onExport: mockOnExport,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render design ID in header', () => {
      render(<ComparisonCard {...defaultProps} />);
      expect(screen.getByText('Design A')).toBeInTheDocument();
    });

    it('should render candidate badge with correct index', () => {
      render(<ComparisonCard {...defaultProps} />);
      expect(screen.getByText('Candidate 1')).toBeInTheDocument();
    });

    it('should render all metrics', () => {
      render(<ComparisonCard {...defaultProps} />);
      expect(screen.getByText('Weight')).toBeInTheDocument();
      expect(screen.getByText('Cost')).toBeInTheDocument();
      expect(screen.getByText('Burst Pressure')).toBeInTheDocument();
    });

    it('should render metric values with units', () => {
      render(<ComparisonCard {...defaultProps} />);
      expect(screen.getByText(/100 kg/)).toBeInTheDocument();
      expect(screen.getByText(/€5,000/)).toBeInTheDocument();
      expect(screen.getByText(/875 bar/)).toBeInTheDocument();
    });

    it('should apply correct color to badge', () => {
      render(<ComparisonCard {...defaultProps} />);
      const badge = screen.getByText('Candidate 1');
      expect(badge).toHaveStyle({ color: '#3B82F6' });
    });

    it('should render design indicator with correct color', () => {
      render(<ComparisonCard {...defaultProps} />);
      const indicator = screen.getByLabelText('Design A indicator');
      expect(indicator).toHaveStyle({ backgroundColor: '#3B82F6' });
    });
  });

  describe('User Interactions', () => {
    it('should call onViewDesign when "View 3D" is clicked', async () => {
      const user = userEvent.setup();
      render(<ComparisonCard {...defaultProps} />);

      const viewButton = screen.getByText('View 3D');
      await user.click(viewButton);

      expect(mockOnViewDesign).toHaveBeenCalledWith('A');
      expect(mockOnViewDesign).toHaveBeenCalledTimes(1);
    });

    it('should call onExport when "Export" is clicked', async () => {
      const user = userEvent.setup();
      render(<ComparisonCard {...defaultProps} />);

      const exportButton = screen.getByText(/Export/);
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith('A');
      expect(mockOnExport).toHaveBeenCalledTimes(1);
    });
  });

  describe('Difference Indicators', () => {
    it('should render difference indicators for each metric', () => {
      render(<ComparisonCard {...defaultProps} />);

      // Check that performance indicators are rendered
      const indicators = screen.getAllByLabelText(/performance/i);
      expect(indicators.length).toBe(3); // One for each metric
    });

    it('should show best performance indicator for lowest weight', () => {
      render(<ComparisonCard {...defaultProps} />);

      // Design A has weight 100, which is the best (lowest) among [100, 120, 110]
      const indicators = screen.getAllByLabelText('Best performance');
      expect(indicators.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<ComparisonCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /View 3D/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    });

    it('should have proper ARIA label for design indicator', () => {
      render(<ComparisonCard {...defaultProps} />);
      expect(screen.getByLabelText('Design A indicator')).toBeInTheDocument();
    });

    it('should use semantic HTML for metrics (dl/dt/dd)', () => {
      render(<ComparisonCard {...defaultProps} />);

      const dl = screen.getByRole('list', { hidden: true });
      expect(dl.tagName).toBe('DL');
    });
  });

  describe('Styling and Layout', () => {
    it('should apply hover effect classes', () => {
      render(<ComparisonCard {...defaultProps} />);

      const card = screen.getByText('Design A').closest('.hover\\:shadow-md');
      expect(card).toBeInTheDocument();
    });

    it('should have proper border and shadow', () => {
      render(<ComparisonCard {...defaultProps} />);

      const card = screen.getByText('Design A').closest('.shadow-sm');
      expect(card).toHaveClass('border', 'border-gray-200');
    });

    it('should render action buttons in a flex container', () => {
      render(<ComparisonCard {...defaultProps} />);

      const viewButton = screen.getByText('View 3D');
      const exportButton = screen.getByText(/Export/);

      const buttonContainer = viewButton.parentElement;
      expect(buttonContainer).toHaveClass('flex', 'gap-3');
      expect(buttonContainer?.contains(exportButton)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty metrics array', () => {
      const props = {
        ...defaultProps,
        metrics: [],
      };

      render(<ComparisonCard {...props} />);

      expect(screen.getByText('Design A')).toBeInTheDocument();
      expect(screen.getByText('View 3D')).toBeInTheDocument();
    });

    it('should handle different candidate indices', () => {
      const { rerender } = render(<ComparisonCard {...defaultProps} index={0} />);
      expect(screen.getByText('Candidate 1')).toBeInTheDocument();

      rerender(<ComparisonCard {...defaultProps} index={2} />);
      expect(screen.getByText('Candidate 3')).toBeInTheDocument();
    });

    it('should handle different design IDs', () => {
      const { rerender } = render(<ComparisonCard {...defaultProps} designId="A" />);
      expect(screen.getByText('Design A')).toBeInTheDocument();

      rerender(<ComparisonCard {...defaultProps} designId="XYZ" />);
      expect(screen.getByText('Design XYZ')).toBeInTheDocument();
    });

    it('should format large numbers with locale string', () => {
      const props = {
        ...defaultProps,
        metrics: [
          { label: 'Fatigue Life', value: 1000000, unit: 'cycles', metricKey: 'fatigue_life_cycles' },
        ],
        allDesignsMetrics: {
          fatigue_life_cycles: [1000000, 900000, 1100000],
        },
      };

      render(<ComparisonCard {...props} />);
      expect(screen.getByText(/1,000,000/)).toBeInTheDocument();
    });

    it('should handle currency formatting for euro', () => {
      render(<ComparisonCard {...defaultProps} />);
      expect(screen.getByText(/€5,000/)).toBeInTheDocument();
    });
  });
});
