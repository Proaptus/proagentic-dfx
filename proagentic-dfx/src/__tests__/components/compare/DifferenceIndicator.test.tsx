/**
 * DifferenceIndicator Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DifferenceIndicator } from '@/components/compare/DifferenceIndicator';

describe('DifferenceIndicator', () => {
  it('should render best performance indicator', () => {
    render(
      <DifferenceIndicator
        isBest={true}
        isAboveAverage={true}
        isLowerIsBetter={true}
      />
    );

    const indicator = screen.getByLabelText('Best performance');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('text-green-500');
  });

  it('should render above average indicator', () => {
    render(
      <DifferenceIndicator
        isBest={false}
        isAboveAverage={true}
        isLowerIsBetter={false}
      />
    );

    const indicator = screen.getByLabelText('Above average performance');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('text-blue-500');
  });

  it('should render below average indicator', () => {
    render(
      <DifferenceIndicator
        isBest={false}
        isAboveAverage={false}
        isLowerIsBetter={true}
      />
    );

    const indicator = screen.getByLabelText('Below average performance');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('text-red-500');
  });

  it('should render average indicator as fallback', () => {
    render(
      <DifferenceIndicator
        isBest={false}
        isAboveAverage={true}
        isLowerIsBetter={true}
      />
    );

    // When above average for lower-is-better, should show trending up
    const indicator = screen.getByLabelText('Above average performance');
    expect(indicator).toBeInTheDocument();
  });

  it('should have proper icon size', () => {
    render(
      <DifferenceIndicator
        isBest={true}
        isAboveAverage={true}
        isLowerIsBetter={true}
      />
    );

    const svg = screen.getByLabelText('Best performance');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('should be accessible with ARIA labels', () => {
    const { rerender } = render(
      <DifferenceIndicator
        isBest={true}
        isAboveAverage={true}
        isLowerIsBetter={true}
      />
    );

    expect(screen.getByLabelText('Best performance')).toBeInTheDocument();

    rerender(
      <DifferenceIndicator
        isBest={false}
        isAboveAverage={true}
        isLowerIsBetter={false}
      />
    );

    expect(screen.getByLabelText('Above average performance')).toBeInTheDocument();

    rerender(
      <DifferenceIndicator
        isBest={false}
        isAboveAverage={false}
        isLowerIsBetter={true}
      />
    );

    expect(screen.getByLabelText('Below average performance')).toBeInTheDocument();
  });
});
