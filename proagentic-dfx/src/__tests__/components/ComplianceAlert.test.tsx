/**
 * ComplianceAlert Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComplianceAlert } from '@/components/compliance/ComplianceAlert';

describe('ComplianceAlert', () => {
  it('should render pass alert with correct styling', () => {
    const { container } = render(
      <ComplianceAlert
        status="pass"
        title="Success Title"
        message="Success message"
      />
    );

    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();

    const alert = container.querySelector('.bg-green-50');
    expect(alert).toBeInTheDocument();
  });

  it('should render fail alert with correct styling', () => {
    const { container } = render(
      <ComplianceAlert
        status="fail"
        title="Failure Title"
        message="Failure message"
      />
    );

    expect(screen.getByText('Failure Title')).toBeInTheDocument();
    expect(screen.getByText('Failure message')).toBeInTheDocument();

    const alert = container.querySelector('.bg-red-50');
    expect(alert).toBeInTheDocument();
  });

  it('should render warning alert with correct styling', () => {
    const { container } = render(
      <ComplianceAlert
        status="warning"
        title="Warning Title"
        message="Warning message"
      />
    );

    const alert = container.querySelector('.bg-yellow-50');
    expect(alert).toBeInTheDocument();
  });

  it('should format message with issue count', () => {
    render(
      <ComplianceAlert
        status="fail"
        title="Issues"
        message="There are {count} to resolve"
        issueCount={3}
      />
    );

    expect(
      screen.getByText(/3 critical compliance issues to resolve/i)
    ).toBeInTheDocument();
  });

  it('should handle singular issue count correctly', () => {
    render(
      <ComplianceAlert
        status="fail"
        title="Issue"
        message="There is {count} to resolve"
        issueCount={1}
      />
    );

    expect(
      screen.getByText(/1 critical compliance issue to resolve/i)
    ).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    const onClick1 = vi.fn();
    const onClick2 = vi.fn();

    render(
      <ComplianceAlert
        status="fail"
        title="Test"
        message="Test message"
        actions={[
          { label: 'Primary Action', onClick: onClick1, variant: 'primary' },
          { label: 'Secondary Action', onClick: onClick2, variant: 'secondary' },
        ]}
      />
    );

    expect(screen.getByText('Primary Action')).toBeInTheDocument();
    expect(screen.getByText('Secondary Action')).toBeInTheDocument();
  });

  it('should call action onClick handlers', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <ComplianceAlert
        status="pass"
        title="Test"
        message="Test message"
        actions={[{ label: 'Click Me', onClick }]}
      />
    );

    const button = screen.getByText('Click Me');
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply primary button styling', () => {
    const { container } = render(
      <ComplianceAlert
        status="fail"
        title="Test"
        message="Test"
        actions={[
          { label: 'Primary', onClick: vi.fn(), variant: 'primary' },
        ]}
      />
    );

    const button = container.querySelector('.bg-red-600');
    expect(button).toBeInTheDocument();
  });

  it('should apply secondary button styling', () => {
    const { container } = render(
      <ComplianceAlert
        status="fail"
        title="Test"
        message="Test"
        actions={[
          { label: 'Secondary', onClick: vi.fn(), variant: 'secondary' },
        ]}
      />
    );

    const button = container.querySelector('.bg-white');
    expect(button).toBeInTheDocument();
  });

  it('should not render actions section when no actions provided', () => {
    const { container } = render(
      <ComplianceAlert status="pass" title="Test" message="Test message" />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(0);
  });

  it('should have proper ARIA attributes', () => {
    render(
      <ComplianceAlert
        status="fail"
        title="Alert"
        message="Alert message"
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ComplianceAlert
        status="pass"
        title="Test"
        message="Test"
        className="custom-alert"
      />
    );

    const alert = container.querySelector('.custom-alert');
    expect(alert).toBeInTheDocument();
  });

  it('should render CheckCircle icon for pass status', () => {
    render(
      <ComplianceAlert status="pass" title="Pass" message="Passed" />
    );

    // Icon should be present (aria-hidden)
    const alert = screen.getByRole('alert');
    const icon = alert.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render AlertTriangle icon for fail status', () => {
    render(
      <ComplianceAlert status="fail" title="Fail" message="Failed" />
    );

    const alert = screen.getByRole('alert');
    const icon = alert.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
