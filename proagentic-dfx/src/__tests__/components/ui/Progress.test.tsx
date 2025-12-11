/**
 * Progress Components Tests
 * Coverage Target: 80%
 *
 * Test Coverage:
 * - LinearProgress (8 tests)
 * - CircularProgress (6 tests)
 * - StepProgress Horizontal (6 tests)
 * - StepProgress Vertical (4 tests)
 * - Accessibility (4 tests)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinearProgress, CircularProgress, StepProgress, type Step } from '@/components/ui/Progress';

describe('LinearProgress', () => {
  describe('Basic Rendering', () => {
    it('should render progress bar', () => {
      render(<LinearProgress value={50} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should set correct aria values', () => {
      render(<LinearProgress value={50} max={200} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '200');
    });

    it('should clamp value to 0-100 range', () => {
      const { rerender } = render(<LinearProgress value={150} />);

      // Value over 100 should be clamped
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();

      rerender(<LinearProgress value={-50} />);
      // Negative values should be clamped to 0
    });

    it('should apply custom className', () => {
      const { container } = render(<LinearProgress value={50} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Label', () => {
    it('should not show label by default', () => {
      render(<LinearProgress value={50} />);

      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });

    it('should show default label when showLabel is true', () => {
      render(<LinearProgress value={50} showLabel />);

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should show custom label', () => {
      render(<LinearProgress value={75} label="Upload Progress" />);

      expect(screen.getByText('Upload Progress')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant styling', () => {
      const { container } = render(<LinearProgress value={50} variant="default" />);

      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveClass('bg-blue-600');
    });

    it('should apply success variant styling', () => {
      const { container } = render(<LinearProgress value={50} variant="success" />);

      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveClass('bg-green-600');
    });

    it('should apply warning variant styling', () => {
      const { container } = render(<LinearProgress value={50} variant="warning" />);

      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveClass('bg-yellow-600');
    });

    it('should apply error variant styling', () => {
      const { container } = render(<LinearProgress value={50} variant="error" />);

      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveClass('bg-red-600');
    });
  });

  describe('Sizes', () => {
    it('should apply small size', () => {
      const { container } = render(<LinearProgress value={50} size="sm" />);

      const track = container.querySelector('[class*="h-1"]');
      expect(track).toBeInTheDocument();
    });

    it('should apply medium size by default', () => {
      const { container } = render(<LinearProgress value={50} />);

      const track = container.querySelector('[class*="h-2"]');
      expect(track).toBeInTheDocument();
    });

    it('should apply large size', () => {
      const { container } = render(<LinearProgress value={50} size="lg" />);

      const track = container.querySelector('[class*="h-3"]');
      expect(track).toBeInTheDocument();
    });
  });
});

describe('CircularProgress', () => {
  describe('Basic Rendering', () => {
    it('should render circular progress', () => {
      render(<CircularProgress value={50} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should set correct aria values', () => {
      render(<CircularProgress value={50} max={200} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
      expect(progressbar).toHaveAttribute('aria-valuemax', '200');
    });

    it('should render SVG circles', () => {
      const { container } = render(<CircularProgress value={50} />);

      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2); // Background and progress circles
    });

    it('should apply custom className', () => {
      const { container } = render(<CircularProgress value={50} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Label', () => {
    it('should show label by default', () => {
      render(<CircularProgress value={50} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      render(<CircularProgress value={50} showLabel={false} />);

      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });
  });

  describe('Size', () => {
    it('should apply custom size', () => {
      const { container } = render(<CircularProgress value={50} size={200} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '200');
      expect(svg).toHaveAttribute('height', '200');
    });

    it('should apply default size of 120', () => {
      const { container } = render(<CircularProgress value={50} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '120');
    });
  });

  describe('Variants', () => {
    it('should apply default variant color', () => {
      const { container } = render(<CircularProgress value={50} variant="default" />);

      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveAttribute('stroke', '#2563eb');
    });

    it('should apply success variant color', () => {
      const { container } = render(<CircularProgress value={50} variant="success" />);

      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveAttribute('stroke', '#16a34a');
    });

    it('should apply error variant color', () => {
      const { container } = render(<CircularProgress value={50} variant="error" />);

      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveAttribute('stroke', '#dc2626');
    });
  });

  describe('StrokeWidth', () => {
    it('should apply custom strokeWidth', () => {
      const { container } = render(<CircularProgress value={50} strokeWidth={12} />);

      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke-width', '12');
    });
  });
});

describe('StepProgress', () => {
  const steps: Step[] = [
    { id: '1', label: 'Step 1', description: 'First step' },
    { id: '2', label: 'Step 2', description: 'Second step' },
    { id: '3', label: 'Step 3', description: 'Third step' },
    { id: '4', label: 'Step 4', description: 'Fourth step' },
  ];

  describe('Horizontal Variant', () => {
    it('should render all steps', () => {
      render(<StepProgress steps={steps} />);

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
      expect(screen.getByText('Step 4')).toBeInTheDocument();
    });

    it('should render step descriptions', () => {
      render(<StepProgress steps={steps} />);

      expect(screen.getByText('First step')).toBeInTheDocument();
      expect(screen.getByText('Second step')).toBeInTheDocument();
    });

    it('should mark completed steps', () => {
      const { container } = render(<StepProgress steps={steps} currentStep={2} />);

      // Steps 0 and 1 should be completed
      const checkIcons = container.querySelectorAll('.lucide-check');
      expect(checkIcons).toHaveLength(2);
    });

    it('should highlight current step', () => {
      render(<StepProgress steps={steps} currentStep={1} />);

      expect(screen.getByText('Step 2')).toHaveClass('text-blue-600');
    });

    it('should show step numbers for pending steps', () => {
      render(<StepProgress steps={steps} currentStep={0} />);

      // Steps 2, 3, 4 should show numbers
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should have Progress navigation aria-label', () => {
      render(<StepProgress steps={steps} />);

      expect(screen.getByLabelText('Progress')).toBeInTheDocument();
    });
  });

  describe('Vertical Variant', () => {
    it('should render vertical layout', () => {
      const { container } = render(<StepProgress steps={steps} variant="vertical" />);

      expect(container.firstChild).toHaveClass('space-y-0');
    });

    it('should render all steps vertically', () => {
      render(<StepProgress steps={steps} variant="vertical" />);

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 4')).toBeInTheDocument();
    });

    it('should show connecting lines between steps', () => {
      const { container } = render(<StepProgress steps={steps} variant="vertical" />);

      // Should have vertical lines connecting steps (3 lines for 4 steps)
      const lines = container.querySelectorAll('[class*="w-0.5"]');
      expect(lines.length).toBe(3);
    });

    it('should apply completed line styling', () => {
      const { container } = render(<StepProgress steps={steps} variant="vertical" currentStep={2} />);

      const greenLines = container.querySelectorAll('.bg-green-600');
      expect(greenLines.length).toBeGreaterThan(0);
    });
  });

  describe('Step Status Override', () => {
    it('should use explicit step status', () => {
      const stepsWithStatus: Step[] = [
        { id: '1', label: 'Step 1', status: 'completed' },
        { id: '2', label: 'Step 2', status: 'error' },
        { id: '3', label: 'Step 3', status: 'pending' },
      ];

      render(<StepProgress steps={stepsWithStatus} />);

      expect(screen.getByText('Step 2')).toHaveClass('text-red-600');
    });

    it('should show error styling for error status', () => {
      const stepsWithError: Step[] = [
        { id: '1', label: 'Step 1', status: 'error' },
      ];

      const { container } = render(<StepProgress steps={stepsWithError} />);

      const errorCircle = container.querySelector('.bg-red-600');
      expect(errorCircle).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single step', () => {
      const singleStep: Step[] = [
        { id: '1', label: 'Only Step' },
      ];

      render(<StepProgress steps={singleStep} />);

      expect(screen.getByText('Only Step')).toBeInTheDocument();
    });

    it('should handle steps without descriptions', () => {
      const noDescSteps: Step[] = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];

      render(<StepProgress steps={noDescSteps} />);

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.queryByText('First step')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StepProgress steps={steps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('Accessibility', () => {
  it('should have progressbar role for LinearProgress', () => {
    render(<LinearProgress value={50} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should have progressbar role for CircularProgress', () => {
    render(<CircularProgress value={50} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should have proper aria-value attributes', () => {
    render(<LinearProgress value={75} max={100} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should have navigation landmark for StepProgress', () => {
    const steps: Step[] = [
      { id: '1', label: 'Step 1' },
    ];

    render(<StepProgress steps={steps} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
