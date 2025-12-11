/**
 * Alert Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert, CalculationAlert, ComplianceAlert, ValidationAlert } from '@/components/ui/Alert';

describe('Alert', () => {
  describe('Basic Rendering', () => {
    it('should render with default variant (info)', () => {
      render(<Alert>Test message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(<Alert title="Alert Title">Test message</Alert>);
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
    });

    it('should render without title', () => {
      render(<Alert>Test message</Alert>);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('All Variants', () => {
    it('should render info variant', () => {
      render(<Alert variant="info">Info alert</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
    });

    it('should render success variant', () => {
      render(<Alert variant="success">Success alert</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
    });

    it('should render warning variant', () => {
      render(<Alert variant="warning">Warning alert</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');
    });

    it('should render error variant', () => {
      render(<Alert variant="error">Error alert</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
    });
  });

  describe('Icon Rendering', () => {
    it('should render default icon for info variant', () => {
      const { container } = render(<Alert variant="info">Info</Alert>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render default icon for success variant', () => {
      const { container } = render(<Alert variant="success">Success</Alert>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render default icon for warning variant', () => {
      const { container } = render(<Alert variant="warning">Warning</Alert>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render default icon for error variant', () => {
      const { container } = render(<Alert variant="error">Error</Alert>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render custom icon as ReactNode', () => {
      render(<Alert icon={<span data-testid="custom">*</span>}>Custom node</Alert>);
      expect(screen.getByTestId('custom')).toBeInTheDocument();
    });

    it('should handle null icon prop', () => {
      const { container } = render(<Alert icon={undefined}>No icon</Alert>);
      // Should still render default icon
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Dismissible Functionality', () => {
    it('should not show dismiss button by default', () => {
      render(<Alert>Test</Alert>);
      expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
    });

    it('should show dismiss button when dismissible', () => {
      render(<Alert dismissible>Test</Alert>);
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    });

    it('should hide alert on dismiss', () => {
      render(<Alert dismissible>Test</Alert>);
      const dismissButton = screen.getByLabelText('Dismiss');
      fireEvent.click(dismissButton);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should call onDismiss callback', () => {
      const onDismiss = vi.fn();
      render(<Alert dismissible onDismiss={onDismiss}>Test</Alert>);
      const dismissButton = screen.getByLabelText('Dismiss');
      fireEvent.click(dismissButton);
      expect(onDismiss).toHaveBeenCalled();
    });

    it('should have correct focus ring for info variant when dismissible', () => {
      render(<Alert variant="info" dismissible>Test</Alert>);
      const button = screen.getByLabelText('Dismiss');
      expect(button).toHaveClass('focus:ring-blue-600');
    });

    it('should have correct focus ring for success variant when dismissible', () => {
      render(<Alert variant="success" dismissible>Test</Alert>);
      const button = screen.getByLabelText('Dismiss');
      expect(button).toHaveClass('focus:ring-green-600');
    });

    it('should have correct focus ring for warning variant when dismissible', () => {
      render(<Alert variant="warning" dismissible>Test</Alert>);
      const button = screen.getByLabelText('Dismiss');
      expect(button).toHaveClass('focus:ring-yellow-600');
    });

    it('should have correct focus ring for error variant when dismissible', () => {
      render(<Alert variant="error" dismissible>Test</Alert>);
      const button = screen.getByLabelText('Dismiss');
      expect(button).toHaveClass('focus:ring-red-600');
    });
  });

  describe('Actions', () => {
    it('should render actions when provided', () => {
      render(
        <Alert actions={<button data-testid="action">Action</button>}>
          Test
        </Alert>
      );
      expect(screen.getByTestId('action')).toBeInTheDocument();
    });

    it('should not render actions container when not provided', () => {
      const { container } = render(<Alert>Test</Alert>);
      // Check that actions div doesn't exist
      const actionsDiv = container.querySelector('.mt-3.flex.gap-2');
      expect(actionsDiv).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<Alert className="custom-alert">Test</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('custom-alert');
    });
  });
});

describe('CalculationAlert', () => {
  it('should render calculation and result', () => {
    render(
      <CalculationAlert
        calculation="1 + 1"
        result={2}
      />
    );
    expect(screen.getByText('1 + 1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render with default title', () => {
    render(<CalculationAlert calculation="x" result="y" />);
    expect(screen.getByText('Calculation Result')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<CalculationAlert calculation="x" result="y" title="Custom Calc" />);
    expect(screen.getByText('Custom Calc')).toBeInTheDocument();
  });

  it('should render details when provided', () => {
    render(
      <CalculationAlert
        calculation="x"
        result="y"
        details="Additional details"
      />
    );
    expect(screen.getByText('Additional details')).toBeInTheDocument();
  });

  it('should not render details when not provided', () => {
    render(<CalculationAlert calculation="x" result="y" />);
    expect(screen.queryByText('Additional details')).not.toBeInTheDocument();
  });

  it('should render with different variants', () => {
    render(
      <CalculationAlert
        calculation="x"
        result="y"
        variant="success"
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
  });
});

describe('ComplianceAlert', () => {
  it('should render standard and requirement', () => {
    render(
      <ComplianceAlert
        standard="ISO 9001"
        requirement="Quality management"
        status="compliant"
      />
    );
    expect(screen.getByText('ISO 9001 Compliance')).toBeInTheDocument();
    expect(screen.getByText('Quality management')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(
      <ComplianceAlert
        standard="ISO"
        requirement="test"
        status="compliant"
        title="Custom Title"
      />
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should render compliant status as success variant', () => {
    render(
      <ComplianceAlert
        standard="ISO"
        requirement="test"
        status="compliant"
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
  });

  it('should render non-compliant status as error variant', () => {
    render(
      <ComplianceAlert
        standard="ISO"
        requirement="test"
        status="non-compliant"
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });

  it('should render warning status as warning variant', () => {
    render(
      <ComplianceAlert
        standard="ISO"
        requirement="test"
        status="warning"
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');
  });

  it('should render details when provided', () => {
    render(
      <ComplianceAlert
        standard="ISO"
        requirement="test"
        status="compliant"
        details="Some details"
      />
    );
    expect(screen.getByText('Some details')).toBeInTheDocument();
  });
});

describe('ValidationAlert', () => {
  it('should render validation errors', () => {
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' },
    ];
    render(<ValidationAlert errors={errors} />);
    expect(screen.getByText('email:')).toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByText('password:')).toBeInTheDocument();
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('should show correct title for single error', () => {
    const errors = [{ field: 'name', message: 'Required' }];
    render(<ValidationAlert errors={errors} />);
    expect(screen.getByText('1 Validation Error')).toBeInTheDocument();
  });

  it('should show correct title for multiple errors', () => {
    const errors = [
      { field: 'a', message: 'x' },
      { field: 'b', message: 'y' },
    ];
    render(<ValidationAlert errors={errors} />);
    expect(screen.getByText('2 Validation Errors')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    const errors = [{ field: 'test', message: 'error' }];
    render(<ValidationAlert errors={errors} title="Custom Errors" />);
    expect(screen.getByText('Custom Errors')).toBeInTheDocument();
  });

  it('should render as error variant', () => {
    const errors = [{ field: 'test', message: 'error' }];
    render(<ValidationAlert errors={errors} />);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });
});
