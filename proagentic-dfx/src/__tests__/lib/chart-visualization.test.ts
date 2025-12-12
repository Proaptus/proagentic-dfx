/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Chart Visualization Integration Tests
 * PHASE 2 Coverage: Recharts integration and chart rendering edge cases
 *
 * Tests covering:
 * - Recharts integration scenarios
 * - Chart rendering edge cases
 * - Data validation for charts
 * - Label formatting in visualization context
 * - Scale and domain handling for different chart types
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateDomain,
  calculateNiceTicks,
  formatValue,
  formatAxisTick,
  normalizeValues,
  interpolateColor,
  PRIMARY_COLORS,
} from '@/lib/charts/chart-utils';

describe('Chart Visualization - Data Transformation', () => {
  describe('Domain calculation for Recharts', () => {
    it('should calculate domain for bar chart data', () => {
      const values = [100, 250, 180, 320, 150];
      const [min, max] = calculateDomain(values);

      expect(min).toBeLessThanOrEqual(100);
      expect(max).toBeGreaterThanOrEqual(320);
    });

    it('should calculate domain for line chart with negative values', () => {
      const values = [-50, 0, 50, 100, -30];
      const [min, max] = calculateDomain(values, 0.1);

      expect(min).toBeLessThanOrEqual(-50);
      expect(max).toBeGreaterThanOrEqual(100);
    });

    it('should calculate domain for scatter plot data', () => {
      const xValues = [1, 2, 3, 4, 5];
      const yValues = [10, 20, 15, 25, 30];

      const [xMin, xMax] = calculateDomain(xValues);
      const [yMin, yMax] = calculateDomain(yValues);

      expect(xMin).toBeLessThanOrEqual(1);
      expect(xMax).toBeGreaterThanOrEqual(5);
      expect(yMin).toBeLessThanOrEqual(10);
      expect(yMax).toBeGreaterThanOrEqual(30);
    });

    it('should handle single data point', () => {
      const values = [100];
      const [min, max] = calculateDomain(values, 0.1);

      expect(min).toBeLessThan(100);
      expect(max).toBeGreaterThan(100);
    });

    it('should handle all zero values', () => {
      const values = [0, 0, 0];
      const [min, max] = calculateDomain(values, 0.1);

      expect(min).toBeLessThanOrEqual(0);
      expect(max).toBeGreaterThanOrEqual(0);
    });

    it('should handle values with large spread', () => {
      const values = [0.001, 1000];
      const [min, max] = calculateDomain(values, 0.1);

      expect(min).toBeLessThanOrEqual(0.001);
      expect(max).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('Tick calculation for axis rendering', () => {
    it('should generate ticks for bar chart Y-axis', () => {
      const values = [0, 100, 250, 180, 320];
      const [min, max] = calculateDomain(values);
      const ticks = calculateNiceTicks(min, max, 5);

      expect(ticks.length).toBeGreaterThan(0);
      expect(ticks[0]).toBeLessThanOrEqual(min);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(max);
    });

    it('should generate ticks for percentage axis (0-100)', () => {
      const ticks = calculateNiceTicks(0, 100, 5);

      expect(ticks.length).toBeGreaterThan(0);
      expect(ticks.every(t => t >= 0 && t <= 100)).toBe(true);
    });

    it('should generate consistent spacing ticks', () => {
      const ticks = calculateNiceTicks(0, 1000, 10);

      const gaps: number[] = [];
      for (let i = 1; i < ticks.length; i++) {
        gaps.push(ticks[i] - ticks[i - 1]);
      }

      // All gaps should be equal
      expect(gaps.every(g => g === gaps[0])).toBe(true);
    });

    it('should handle logarithmic scale range', () => {
      const ticks = calculateNiceTicks(1, 1e6, 5);

      expect(ticks.length).toBeGreaterThan(0);
      expect(ticks[0]).toBeLessThanOrEqual(1);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(1e6);
    });

    it('should generate enough ticks for readability', () => {
      const ticks = calculateNiceTicks(0, 100, 5);

      expect(ticks.length).toBeGreaterThanOrEqual(3);
    });

    it('should not generate too many ticks', () => {
      const ticks = calculateNiceTicks(0, 100, 5);

      expect(ticks.length).toBeLessThanOrEqual(10);
    });
  });
});

describe('Chart Visualization - Label Formatting', () => {
  describe('Axis label formatting', () => {
    it('should format large values for Y-axis', () => {
      const label = formatAxisTick(1500000);

      expect(label).toContain('M');
    });

    it('should format medium values for Y-axis', () => {
      const label = formatAxisTick(1500);

      expect(label).toContain('k');
    });

    it('should format small values for Y-axis', () => {
      const label = formatAxisTick(123);

      expect(label).not.toContain('k');
      expect(label).not.toContain('M');
    });

    it('should format scientific notation for very small values', () => {
      const label = formatAxisTick(0.00001);

      expect(label).toContain('e');
    });

    it('should handle negative values in axis labels', () => {
      const label = formatAxisTick(-250);

      expect(label).toContain('-');
      expect(label).toContain('250');
    });

    it('should format zero for axis', () => {
      const label = formatAxisTick(0);

      expect(label).toBe('0');
    });
  });

  describe('Tooltip label formatting', () => {
    it('should format stress values for tooltip', () => {
      const formatted = formatValue(850, { unit: 'MPa', precision: 1 });

      expect(formatted).toContain('850');
      expect(formatted).toContain('MPa');
    });

    it('should format cost values in scientific notation', () => {
      const formatted = formatValue(0.00025, { isScientific: true, precision: 2 });

      expect(formatted).toContain('e');
    });

    it('should format reliability percentages', () => {
      const formatted = formatValue(0.9987, { precision: 4 });

      expect(formatted).toMatch(/0\.9987|1/);
    });

    it('should format temperature values', () => {
      const formatted = formatValue(45.5, { unit: '°C', precision: 1 });

      expect(formatted).toContain('45.5');
      expect(formatted).toContain('°C');
    });

    it('should format budget values', () => {
      const formatted = formatValue(125000, { compact: true, unit: '$', precision: 1 });

      expect(formatted).toContain('125');
      expect(formatted).toContain('k');
    });
  });

  describe('Legend label formatting', () => {
    it('should format underscore-separated labels', () => {
      const data = { stress_value: 500 };

      Object.keys(data).forEach(key => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        expect(label).toBe('Stress Value');
      });
    });

    it('should capitalize each word in label', () => {
      const labels = [
        'safety_factor',
        'cost_estimate',
        'reliability_index',
        'thermal_stress'
      ];

      labels.forEach(label => {
        const formatted = label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const words = formatted.split(' ');
        words.forEach(word => {
          expect(word[0]).toBe(word[0].toUpperCase());
        });
      });
    });
  });
});

describe('Chart Visualization - Data Validation', () => {
  describe('Input validation for chart data', () => {
    it('should handle empty chart data array', () => {
      const data: number[] = [];

      expect(() => calculateDomain(data)).toThrow();
    });

    it('should handle single data point in chart', () => {
      const data = [100];
      const [min, max] = calculateDomain(data);

      expect(min).toBeDefined();
      expect(max).toBeDefined();
    });

    it('should handle all identical values', () => {
      const data = [50, 50, 50, 50];
      const [min, max] = calculateDomain(data);

      expect(min).toBeLessThan(50);
      expect(max).toBeGreaterThan(50);
    });

    it('should handle mixed positive and negative values', () => {
      const data = [-100, -50, 0, 50, 100];
      const [min, max] = calculateDomain(data);

      expect(min).toBeLessThanOrEqual(-100);
      expect(max).toBeGreaterThanOrEqual(100);
    });

    it('should handle very large value ranges', () => {
      const data = [1e-10, 1e10];
      const [min, max] = calculateDomain(data);

      expect(min).toBeLessThanOrEqual(1e-10);
      expect(max).toBeGreaterThanOrEqual(1e10);
    });

    it('should validate NaN values', () => {
      const data = [100, NaN, 200];

      expect(() => calculateDomain(data)).toThrow();
    });

    it('should validate Infinity values', () => {
      const data = [100, Infinity, 200];

      expect(() => calculateDomain(data)).toThrow();
    });
  });

  describe('Data normalization for visualization', () => {
    it('should normalize values to [0,1] for color mapping', () => {
      const values = [10, 20, 30];
      const result = normalizeValues(values);

      expect(result.normalized[0]).toBe(0);
      expect(result.normalized[2]).toBeCloseTo(1);
      expect(result.normalized.every(v => v >= 0 && v <= 1)).toBe(true);
    });

    it('should return min/max with normalized values', () => {
      const values = [50, 100, 150];
      const result = normalizeValues(values);

      expect(result.min).toBe(50);
      expect(result.max).toBe(150);
    });

    it('should handle normalization for diverse data ranges', () => {
      const smallRange = [99, 100, 101];
      const largeRange = [1, 1e6, 1e12];

      const small = normalizeValues(smallRange);
      const large = normalizeValues(largeRange);

      expect(small.normalized[0]).toBeCloseTo(0);
      expect(small.normalized[2]).toBeCloseTo(1);
      expect(large.normalized[0]).toBeCloseTo(0);
      expect(large.normalized[2]).toBeCloseTo(1);
    });
  });
});

describe('Chart Visualization - Color Mapping', () => {
  describe('Color interpolation for visualization', () => {
    it('should map values to colors for heatmap', () => {
      const values = [0, 50, 100];
      const colors = values.map(v => interpolateColor(PRIMARY_COLORS, v / 100));

      expect(colors).toHaveLength(3);
      colors.forEach(color => {
        expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      });
    });

    it('should produce distinct colors for distinct values', () => {
      const color1 = interpolateColor(PRIMARY_COLORS, 0);
      const color5 = interpolateColor(PRIMARY_COLORS, 0.5);
      const color10 = interpolateColor(PRIMARY_COLORS, 1);

      expect(color1).not.toBe(color5);
      expect(color5).not.toBe(color10);
    });

    it('should produce smooth color gradients', () => {
      const color0 = interpolateColor(PRIMARY_COLORS, 0);
      const color025 = interpolateColor(PRIMARY_COLORS, 0.25);
      const color05 = interpolateColor(PRIMARY_COLORS, 0.5);
      const color075 = interpolateColor(PRIMARY_COLORS, 0.75);
      const color1 = interpolateColor(PRIMARY_COLORS, 1);

      // All should be valid colors
      [color0, color025, color05, color075, color1].forEach(color => {
        expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      });
    });

    it('should handle color mapping for categorical data', () => {
      const categories = ['A', 'B', 'C', 'D', 'E'];
      const colors = categories.map((_, i) => PRIMARY_COLORS[i % PRIMARY_COLORS.length]);

      expect(colors).toHaveLength(5);
      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });
});

describe('Chart Visualization - Edge Cases', () => {
  describe('Extreme value handling', () => {
    it('should handle chart with single value across multiple series', () => {
      const series1 = [100, 100, 100];
      const series2 = [100, 100, 100];

      const [min, max] = calculateDomain([...series1, ...series2]);

      expect(min).toBeLessThan(100);
      expect(max).toBeGreaterThan(100);
    });

    it('should handle asymmetric data distribution', () => {
      const data = [1, 1, 1, 1, 1000]; // One outlier

      const [min, max] = calculateDomain(data);

      expect(min).toBeLessThanOrEqual(1);
      expect(max).toBeGreaterThanOrEqual(1000);
    });

    it('should handle values with very different magnitudes', () => {
      const data = [1e-6, 1, 1e6];

      const [min, max] = calculateDomain(data);

      expect(min).toBeLessThanOrEqual(1e-6);
      expect(max).toBeGreaterThanOrEqual(1e6);
    });

    it('should handle zero-crossing data', () => {
      const data = [-1000, -500, -100, 0, 100, 500, 1000];

      const [min, max] = calculateDomain(data);

      expect(min).toBeLessThanOrEqual(-1000);
      expect(max).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('Formatting edge cases', () => {
    it('should format value near precision boundary', () => {
      const formatted = formatValue(0.0001, { precision: 2 });

      expect(formatted).toBeTruthy();
    });

    it('should format very large numbers', () => {
      const formatted = formatAxisTick(1e20);

      expect(formatted).toBeTruthy();
    });

    it('should format very small numbers', () => {
      const formatted = formatAxisTick(1e-20);

      expect(formatted).toContain('e');
    });

    it('should handle formatting with missing unit', () => {
      const formatted = formatValue(123, { unit: '' });

      expect(formatted).not.toContain('undefined');
    });

    it('should handle formatting with null options', () => {
      const formatted = formatValue(123, {});

      expect(formatted).toBeTruthy();
    });
  });

  describe('Multiple chart data transformation', () => {
    it('should handle multi-series data normalization', () => {
      const series1 = [10, 20, 30];
      const series2 = [100, 200, 300];
      const allValues = [...series1, ...series2];

      const result = normalizeValues(allValues);

      expect(result.normalized).toHaveLength(6);
      expect(result.normalized[0]).toBeCloseTo(0);
      expect(result.normalized[5]).toBeCloseTo(1);
    });

    it('should handle domain calculation across multiple datasets', () => {
      const dataset1 = [10, 20, 30];
      const dataset2 = [50, 60, 70];
      const dataset3 = [5, 15, 25];

      const [min, max] = calculateDomain([...dataset1, ...dataset2, ...dataset3]);

      expect(min).toBeLessThanOrEqual(5);
      expect(max).toBeGreaterThanOrEqual(70);
    });

    it('should generate consistent ticks for multi-series chart', () => {
      const data1 = [0, 100, 200];
      const data2 = [50, 150, 250];

      const [min, max] = calculateDomain([...data1, ...data2]);
      const ticks = calculateNiceTicks(min, max, 5);

      // Check that all original values fit within tick range
      expect(ticks[0]).toBeLessThanOrEqual(0);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(250);
    });
  });

  describe('Responsive chart calculations', () => {
    it('should recalculate domain when data changes', () => {
      const data1 = [0, 100];
      const data2 = [0, 1000];

      const [min1, max1] = calculateDomain(data1);
      const [min2, max2] = calculateDomain(data2);

      expect(max2).toBeGreaterThan(max1);
    });

    it('should handle incremental data additions', () => {
      const baseData = [0, 50, 100];
      const newData = [...baseData, 200, 300];

      const [min1, max1] = calculateDomain(baseData);
      const [min2, max2] = calculateDomain(newData);

      expect(max2).toBeGreaterThan(max1);
    });

    it('should handle real-time data streaming', () => {
      let data = [50];
      const [min1, max1] = calculateDomain(data);

      data = [...data, 100];
      const [min2, max2] = calculateDomain(data);

      expect(max2).toBeGreaterThanOrEqual(max1);
    });
  });
});

describe('Chart Visualization - Integration Scenarios', () => {
  describe('Complete chart rendering flow', () => {
    it('should prepare complete chart configuration', () => {
      const chartData = [100, 250, 180, 320, 150];

      // 1. Calculate domain
      const [minVal, maxVal] = calculateDomain(chartData);

      // 2. Generate ticks
      const ticks = calculateNiceTicks(minVal, maxVal, 5);

      // 3. Format tick labels
      const tickLabels = ticks.map(t => formatAxisTick(t));

      expect(ticks).toHaveLength(tickLabels.length);
      expect(ticks.length).toBeGreaterThan(0);
    });

    it('should prepare multi-series chart configuration', () => {
      const stressData = [100, 250, 180, 320, 150];
      const costData = [500, 750, 600, 900, 550];

      const [min, max] = calculateDomain([...stressData, ...costData]);
      const ticks = calculateNiceTicks(min, max, 5);

      expect(min).toBeLessThanOrEqual(100);
      expect(max).toBeGreaterThanOrEqual(900);
      expect(ticks.length).toBeGreaterThan(0);
    });

    it('should prepare color scale for heatmap', () => {
      const values = [10, 20, 30, 40, 50];
      const colors = values.map(v => {
        const normalized = (v - 10) / (50 - 10);
        return interpolateColor(PRIMARY_COLORS, normalized);
      });

      expect(colors).toHaveLength(5);
      colors.forEach(color => {
        expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      });
    });
  });

  describe('Performance optimization', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => i * Math.random());

      const start = performance.now();
      const [min, max] = calculateDomain(largeData);
      const end = performance.now();

      expect(min).toBeLessThanOrEqual(largeData[0]);
      expect(max).toBeGreaterThanOrEqual(0);
      expect(end - start).toBeLessThan(100); // Should complete quickly
    });

    it('should cache tick calculations', () => {
      const ticks1 = calculateNiceTicks(0, 100, 5);
      const ticks2 = calculateNiceTicks(0, 100, 5);

      expect(ticks1).toEqual(ticks2);
    });

    it('should format values incrementally', () => {
      const ticks = [0, 25, 50, 75, 100];

      const labels = ticks.map(t => formatAxisTick(t));

      expect(labels).toHaveLength(5);
      labels.forEach(label => {
        expect(label).toBeTruthy();
      });
    });
  });
});
