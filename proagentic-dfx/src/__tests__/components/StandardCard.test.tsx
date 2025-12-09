/**
 * StandardCard Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StandardCard } from '@/components/compliance/StandardCard';

describe('StandardCard', () => {
  it('should render standard information', () => {
    render(
      <StandardCard
        standardId="ISO-11119-3"
        standardName="Gas cylinders - Composite materials"
        version="2022"
        applicability="required"
        status="pass"
      />
    );

    expect(screen.getByText('ISO-11119-3')).toBeInTheDocument();
    expect(screen.getByText('Gas cylinders - Composite materials')).toBeInTheDocument();
    expect(screen.getByText('Version:')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
  });

  it('should display REQUIRED badge for required applicability', () => {
    render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="pass"
      />
    );

    expect(screen.getByText('REQUIRED')).toBeInTheDocument();
  });

  it('should display RECOMMENDED badge for recommended applicability', () => {
    render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="recommended"
        status="pass"
      />
    );

    expect(screen.getByText('RECOMMENDED')).toBeInTheDocument();
  });

  it('should display OPTIONAL badge for optional applicability', () => {
    render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="optional"
        status="pass"
      />
    );

    expect(screen.getByText('OPTIONAL')).toBeInTheDocument();
  });

  it('should display COMPLIANT status for pass', () => {
    render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="pass"
      />
    );

    expect(screen.getByText('COMPLIANT')).toBeInTheDocument();
  });

  it('should display IN PROGRESS status', () => {
    render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="in_progress"
      />
    );

    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  it('should display PENDING status', () => {
    render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="pending"
      />
    );

    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('should apply green styling for pass status', () => {
    render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="pass"
      />
    );

    const statusBadge = screen.getByText('COMPLIANT').closest('span');
    expect(statusBadge).toHaveClass('bg-green-100');
    expect(statusBadge).toHaveClass('text-green-800');
  });

  it('should apply yellow styling for in_progress status', () => {
    render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="in_progress"
      />
    );

    const statusBadge = screen.getByText('IN PROGRESS').closest('span');
    expect(statusBadge).toHaveClass('bg-yellow-100');
    expect(statusBadge).toHaveClass('text-yellow-800');
  });

  it('should apply red styling for required applicability', () => {
    render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="pass"
      />
    );

    const applicabilityBadge = screen.getByText('REQUIRED').closest('span');
    expect(applicabilityBadge).toHaveClass('bg-red-100');
    expect(applicabilityBadge).toHaveClass('text-red-800');
  });

  it('should have hover effects', () => {
    const { container } = render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="pass"
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('hover:border-blue-300');
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="pass"
        className="custom-standard-card"
      />
    );

    const card = container.querySelector('.custom-standard-card');
    expect(card).toBeInTheDocument();
  });

  it('should have accessible status icon', () => {
    render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="pass"
      />
    );

    const statusIcon = screen.getByRole('img', { name: /Status: COMPLIANT/i });
    expect(statusIcon).toBeInTheDocument();
  });

  it('should render CheckCircle icon for pass status', () => {
    const { container } = render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="pass"
      />
    );

    const iconContainer = container.querySelector('.bg-green-100');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
  });

  it('should render AlertTriangle icon for in_progress status', () => {
    const { container } = render(
      <StandardCard
        standardId="TEST-001"
        standardName="Test Standard"
        version="2022"
        applicability="required"
        status="in_progress"
      />
    );

    const iconContainer = container.querySelector('.bg-yellow-100');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
  });
});
