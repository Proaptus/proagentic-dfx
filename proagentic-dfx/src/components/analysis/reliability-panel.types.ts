/**
 * Types and constants for Reliability Panel
 */

import type { DesignReliability } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

export interface ReliabilityPanelProps {
  data: DesignReliability;
  designId?: string;
  onReliabilityDataChange?: (data: DesignReliability) => void;
}

export type MonteCarloConfig = '10k' | '100k' | '1M';

// ============================================================================
// Constants
// ============================================================================

export const MONTE_CARLO_CONFIGS: Record<MonteCarloConfig, string> = {
  '10k': '10,000 samples (Fast)',
  '100k': '100,000 samples (Standard)',
  '1M': '1,000,000 samples (High Precision)',
};

export const SERVICE_LIFE_YEARS = 15; // Design service life
export const CYCLES_PER_YEAR = 1000; // Typical refueling cycles

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(0);
}

/**
 * Generate Weibull distribution data for charting
 */
export function generateWeibullData(
  shape: number = 2.5,
  scale: number = 50000,
  points: number = 50
): Array<{ time: number; reliability: number }> {
  return Array.from({ length: points }, (_, i) => {
    const time = i * 2000; // hours
    const reliability = Math.exp(-Math.pow(time / scale, shape));
    return { time, reliability: reliability * 100 };
  });
}

/**
 * Generate bathtub curve (failure rate over time) data
 */
export function generateBathtubData(
  points: number = 50
): Array<{ time: number; failureRate: number }> {
  return Array.from({ length: points }, (_, i) => {
    const time = i * 2000;
    const infant = 0.001 * Math.exp(-time / 10000);
    const random = 0.00005;
    const wearout = 0.000001 * Math.exp(time / 80000);
    const failureRate = infant + random + wearout;
    return { time, failureRate: failureRate * 1e6 }; // Convert to failures per million hours
  });
}

/**
 * Calculate MTBF and B10 life from failure probability
 */
export function calculateReliabilityMetrics(pFailure: number) {
  const mtbfCycles = pFailure > 0 ? Math.round(1 / pFailure) : 0;
  const mtbfYears = pFailure > 0 ? (1 / pFailure) / CYCLES_PER_YEAR : 0;
  const b10LifeCycles = Math.round(mtbfCycles * 0.105); // B10 life (10% failure point)
  const b10LifeYears = mtbfYears * 0.105;

  return { mtbfCycles, mtbfYears, b10LifeCycles, b10LifeYears };
}
