'use client';

/**
 * DifferenceIndicator Component
 * Visual indicator for metric performance relative to comparison set
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactElement } from 'react';

interface DifferenceIndicatorProps {
  isBest: boolean;
  isAboveAverage: boolean;
  isLowerIsBetter: boolean;
}

export function DifferenceIndicator({
  isBest,
  isAboveAverage,
}: DifferenceIndicatorProps): ReactElement {
  if (isBest) {
    return (
      <TrendingUp
        className="text-green-500"
        size={16}
        aria-label="Best performance"
      />
    );
  }

  if (isAboveAverage) {
    return (
      <TrendingUp
        className="text-blue-500"
        size={16}
        aria-label="Above average performance"
      />
    );
  }

  if (!isAboveAverage) {
    return (
      <TrendingDown
        className="text-red-500"
        size={16}
        aria-label="Below average performance"
      />
    );
  }

  return (
    <Minus
      className="text-gray-400"
      size={16}
      aria-label="Average performance"
    />
  );
}
