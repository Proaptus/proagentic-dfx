/**
 * Comparison utilities for CompareScreen
 * Extracted logic for better testability and reusability
 */

import { getCurrencySymbol, getStoredCurrency } from './currency';

export interface DifferenceIndicatorProps {
  isBest: boolean;
  isAboveAverage: boolean;
  isLowerIsBetter: boolean;
}

export function calculateDifferenceIndicator(
  metricKey: string,
  currentValue: number,
  allValues: number[]
): DifferenceIndicatorProps {
  const average = allValues.reduce((a, b) => a + b, 0) / allValues.length;
  const isBest = currentValue === Math.min(...allValues) || currentValue === Math.max(...allValues);
  const lowerIsBetter = ['weight', 'cost'].some(k => metricKey.toLowerCase().includes(k));

  let isAboveAverage: boolean;
  if (lowerIsBetter) {
    isAboveAverage = currentValue < average;
  } else {
    isAboveAverage = currentValue > average;
  }

  return {
    isBest,
    isAboveAverage,
    isLowerIsBetter: lowerIsBetter,
  };
}

export function formatMetricValue(value: number | string, metricKey: string): string {
  if (typeof value === 'string') return value;

  // Special formatting for specific metrics
  if (metricKey.toLowerCase().includes('p_failure')) {
    return value.toExponential(2);
  }

  return value.toLocaleString();
}

export interface MetricDefinition {
  key: string;
  label: string;
  unit?: string;
  lowerIsBetter: boolean;
}

/**
 * Get comparison metrics with current currency symbol
 * Call this function to get metrics with the user's preferred currency
 */
export function getComparisonMetrics(): MetricDefinition[] {
  const currencySymbol = getCurrencySymbol(getStoredCurrency());
  return [
    { key: 'weight_kg', label: 'Weight', unit: 'kg', lowerIsBetter: true },
    { key: 'cost_eur', label: 'Cost', unit: currencySymbol, lowerIsBetter: true },
    { key: 'burst_pressure_bar', label: 'Burst Pressure', unit: 'bar', lowerIsBetter: false },
    { key: 'stress_margin_percent', label: 'Stress Margin', unit: '%', lowerIsBetter: false },
  ];
}

// For backwards compatibility - will use current currency at import time
// Prefer using getComparisonMetrics() for dynamic currency support
export const COMPARISON_METRICS: MetricDefinition[] = [
  { key: 'weight_kg', label: 'Weight', unit: 'kg', lowerIsBetter: true },
  { key: 'cost_eur', label: 'Cost', unit: '£', lowerIsBetter: true },
  { key: 'burst_pressure_bar', label: 'Burst Pressure', unit: 'bar', lowerIsBetter: false },
  { key: 'stress_margin_percent', label: 'Stress Margin', unit: '%', lowerIsBetter: false },
];
