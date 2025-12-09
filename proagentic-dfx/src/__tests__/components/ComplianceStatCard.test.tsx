/**
 * ComplianceStatCard Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComplianceStatCard } from '@/components/compliance/ComplianceStatCard';
import { TrendingUp, CheckCircle, XCircle } from 'lucide-react';

describe('ComplianceStatCard', () => {
  it('should render basic stat card', () => {
    render(
      <ComplianceStatCard
        label="Test Metric"
        value="100"
        icon={TrendingUp}
      />
    );

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <ComplianceStatCard
        label="Test Metric"
        value="50"
        subtitle="of 100 total"
        icon={CheckCircle}
      />
    );

    expect(screen.getByText('of 100 total')).toBeInTheDocument();
  });

  it('should apply correct variant styling for success', () => {
    const { container } = render(
      <ComplianceStatCard
        label="Passed"
        value="10"
        icon={CheckCircle}
        variant="success"
      />
    );

    const card = container.querySelector('.from-green-50');
    expect(card).toBeInTheDocument();
  });

  it('should apply correct variant styling for error', () => {
    const { container } = render(
      <ComplianceStatCard
        label="Failed"
        value="5"
        icon={XCircle}
        variant="error"
      />
    );

    const card = container.querySelector('.from-red-50');
    expect(card).toBeInTheDocument();
  });

  it('should render progress bar when showBar is true', () => {
    render(
      <ComplianceStatCard
        label="Progress"
        value="75%"
        icon={TrendingUp}
        progress={{ value: 75, max: 100, showBar: true }}
      />
    );

    const progressBar = screen.getByRole('progressbar', {
      name: /Progress progress/i,
    });
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should not render progress bar when showBar is false', () => {
    render(
      <ComplianceStatCard
        label="No Progress"
        value="50"
        icon={TrendingUp}
        progress={{ value: 50, max: 100, showBar: false }}
      />
    );

    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('should calculate correct percentage for progress bar', () => {
    const { container } = render(
      <ComplianceStatCard
        label="Test"
        value="50%"
        icon={TrendingUp}
        progress={{ value: 50, max: 100, showBar: true }}
      />
    );

    const progressFill = container.querySelector('[style*="width: 50%"]');
    expect(progressFill).toBeInTheDocument();
  });

  it('should display rounded percentage in progress label', () => {
    render(
      <ComplianceStatCard
        label="Test"
        value="66.7%"
        icon={TrendingUp}
        progress={{ value: 66.7, max: 100, showBar: true }}
      />
    );

    // Should display rounded value
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ComplianceStatCard
        label="Test"
        value="100"
        icon={TrendingUp}
        className="custom-class"
      />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('should have aria-hidden on icon', () => {
    const { container } = render(
      <ComplianceStatCard
        label="Test"
        value="100"
        icon={TrendingUp}
      />
    );

    const icon = container.querySelector('svg[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });
});
