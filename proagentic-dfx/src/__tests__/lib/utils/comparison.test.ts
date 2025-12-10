/**
 * Comparison utilities tests
 * Tests for comparison helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDifferenceIndicator,
  formatMetricValue,
  COMPARISON_METRICS,
} from '@/lib/utils/comparison';

describe('calculateDifferenceIndicator', () => {
  it('should identify best value for lower-is-better metrics', () => {
    const result = calculateDifferenceIndicator('weight_kg', 100, [100, 120, 110]);

    expect(result.isBest).toBe(true);
    expect(result.isLowerIsBetter).toBe(true);
  });

  it('should identify best value for higher-is-better metrics', () => {
    const result = calculateDifferenceIndicator('burst_pressure', 900, [875, 900, 850]);

    expect(result.isBest).toBe(true);
    expect(result.isLowerIsBetter).toBe(false);
  });

  it('should identify above average for lower-is-better metrics', () => {
    const result = calculateDifferenceIndicator('cost_eur', 4500, [5000, 4500, 4800]);

    expect(result.isAboveAverage).toBe(true);
    expect(result.isLowerIsBetter).toBe(true);
  });

  it('should identify below average for higher-is-better metrics', () => {
    const result = calculateDifferenceIndicator('stress_margin', 20, [25, 30, 20]);

    expect(result.isAboveAverage).toBe(false);
    expect(result.isLowerIsBetter).toBe(false);
  });

  it('should handle weight metrics as lower-is-better', () => {
    const result = calculateDifferenceIndicator('weight_kg', 100, [100, 120, 110]);

    expect(result.isLowerIsBetter).toBe(true);
  });

  it('should handle cost metrics as lower-is-better', () => {
    const result = calculateDifferenceIndicator('cost_eur', 4500, [5000, 4500, 4800]);

    expect(result.isLowerIsBetter).toBe(true);
  });

  it('should correctly calculate average', () => {
    const values = [100, 120, 110];

    const resultAbove = calculateDifferenceIndicator('weight_kg', 95, values);
    const resultBelow = calculateDifferenceIndicator('weight_kg', 125, values);

    expect(resultAbove.isAboveAverage).toBe(true); // 95 < 110 (average)
    expect(resultBelow.isAboveAverage).toBe(false); // 125 > 110 (average)
  });

  it('should handle edge case with single value', () => {
    const result = calculateDifferenceIndicator('weight_kg', 100, [100]);

    expect(result.isBest).toBe(true);
    expect(result.isAboveAverage).toBe(false); // Equal to average
  });

  it('should handle edge case with identical values', () => {
    const result = calculateDifferenceIndicator('weight_kg', 100, [100, 100, 100]);

    expect(result.isBest).toBe(true);
    expect(result.isAboveAverage).toBe(false);
  });
});

describe('formatMetricValue', () => {
  it('should return strings as-is', () => {
    expect(formatMetricValue('test', 'label')).toBe('test');
  });

  it('should format p_failure in scientific notation', () => {
    const result = formatMetricValue(0.000001, 'p_failure');
    expect(result).toBe('1.00e-6');
  });

  it('should format p_failure with uppercase', () => {
    const result = formatMetricValue(0.000001, 'P_FAILURE');
    expect(result).toBe('1.00e-6');
  });

  it('should format regular numbers with locale string', () => {
    const result = formatMetricValue(5000, 'cost_eur');
    expect(result).toBe('5,000');
  });

  it('should handle decimal numbers', () => {
    const result = formatMetricValue(123.456, 'weight_kg');
    expect(result).toBe('123.456');
  });

  it('should handle zero', () => {
    const result = formatMetricValue(0, 'weight_kg');
    expect(result).toBe('0');
  });

  it('should handle large numbers', () => {
    const result = formatMetricValue(1000000, 'fatigue_cycles');
    expect(result).toBe('1,000,000');
  });

  it('should handle very small numbers in scientific notation', () => {
    const result = formatMetricValue(1e-10, 'p_failure');
    expect(result).toBe('1.00e-10');
  });
});

describe('COMPARISON_METRICS', () => {
  it('should define weight_kg as lower-is-better', () => {
    const metric = COMPARISON_METRICS.find((m) => m.key === 'weight_kg');
    expect(metric).toBeDefined();
    expect(metric?.lowerIsBetter).toBe(true);
    expect(metric?.label).toBe('Weight');
    expect(metric?.unit).toBe('kg');
  });

  it('should define cost_eur as lower-is-better', () => {
    const metric = COMPARISON_METRICS.find((m) => m.key === 'cost_eur');
    expect(metric).toBeDefined();
    expect(metric?.lowerIsBetter).toBe(true);
    expect(metric?.label).toBe('Cost');
    expect(metric?.unit).toBe('£');
  });

  it('should define burst_pressure_bar as higher-is-better', () => {
    const metric = COMPARISON_METRICS.find((m) => m.key === 'burst_pressure_bar');
    expect(metric).toBeDefined();
    expect(metric?.lowerIsBetter).toBe(false);
    expect(metric?.label).toBe('Burst Pressure');
    expect(metric?.unit).toBe('bar');
  });

  it('should define stress_margin_percent as higher-is-better', () => {
    const metric = COMPARISON_METRICS.find((m) => m.key === 'stress_margin_percent');
    expect(metric).toBeDefined();
    expect(metric?.lowerIsBetter).toBe(false);
    expect(metric?.label).toBe('Stress Margin');
    expect(metric?.unit).toBe('%');
  });

  it('should have exactly 4 metrics defined', () => {
    expect(COMPARISON_METRICS).toHaveLength(4);
  });

  it('should have unique keys', () => {
    const keys = COMPARISON_METRICS.map((m) => m.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it('should have all required properties', () => {
    COMPARISON_METRICS.forEach((metric) => {
      expect(metric).toHaveProperty('key');
      expect(metric).toHaveProperty('label');
      expect(metric).toHaveProperty('lowerIsBetter');
      expect(typeof metric.key).toBe('string');
      expect(typeof metric.label).toBe('string');
      expect(typeof metric.lowerIsBetter).toBe('boolean');
    });
  });
});
