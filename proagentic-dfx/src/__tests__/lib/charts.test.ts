/**
 * Chart Utilities and Colormap Tests
 * PHASE 2 Coverage: lib/charts/chart-utils.ts and colormap.ts
 *
 * Tests covering:
 * - Color mapping functions and interpolation
 * - Chart data transformations and formatting
 * - Axis label formatting
 * - Legend generation
 * - Scale calculations
 * - Format conversions
 * - Edge cases (NaN, Infinity, empty data)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  // Color functions
  interpolateColor,
  getValueColor,
  PRIMARY_COLORS,
  SEQUENTIAL_SCALES,
  DIVERGING_SCALES,
  CATEGORY_COLORS,
  STATUS_COLORS,
  // Formatting functions
  formatValue,
  formatAxisTick,
  formatPercent,
  // Data normalization
  normalizeValues,
  normalizeLogScale,
  // Domain and scale calculations
  calculateDomain,
  calculateNiceTicks,
  // Tooltip helpers
  formatTooltipData,
  // Types
  DEFAULT_CHART_CONFIG,
} from '@/lib/charts/chart-utils';

import {
  // Colormap functions
  interpolateColor as colormapInterpolateColor,
  interpolateColorHex,
  interpolateColorRGB,
  getColorStops,
  getDiscreteColors,
  getAvailableColormaps,
  getColormapDescription,
  createCSSGradient,
  getThreeColor,
  batchGetThreeColors,
} from '@/lib/charts/colormap';

// ============================================================================
// CHART UTILITIES TESTS
// ============================================================================

describe('Chart Utilities - Color Interpolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('interpolateColor function', () => {
    it('should interpolate between two colors at midpoint', () => {
      const colors = ['#0000FF', '#FF0000'];
      const result = interpolateColor(colors, 0.5);

      expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      // At 0.5, should be approximately middle of blue and red (127.5 rounds to 128)
      expect(result).toContain('128');
    });

    it('should return first color at t=0', () => {
      const colors = ['#FF0000', '#0000FF'];
      const result = interpolateColor(colors, 0);

      expect(result).toBe('rgb(255, 0, 0)');
    });

    it('should return last color at t=1', () => {
      const colors = ['#FF0000', '#0000FF'];
      const result = interpolateColor(colors, 1);

      expect(result).toBe('rgb(0, 0, 255)');
    });

    it('should clamp t values outside [0,1]', () => {
      const colors = ['#0000FF', '#FF0000'];
      const resultBelowMin = interpolateColor(colors, -0.5);
      const resultAboveMax = interpolateColor(colors, 1.5);

      expect(resultBelowMin).toBe('rgb(0, 0, 255)');
      expect(resultAboveMax).toBe('rgb(255, 0, 0)');
    });

    it('should handle multi-color scales with more than 2 colors', () => {
      const colors = ['#0000FF', '#00FF00', '#FF0000'];
      const result = interpolateColor(colors, 0.5);

      expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('should handle single color array', () => {
      const colors = ['#0000FF'];
      const result = interpolateColor(colors, 0.5);

      expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });
  });

  describe('getValueColor function', () => {
    it('should map value to reliability color scale', () => {
      const color = getValueColor(50, 0, 100, 'reliability');

      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('should map value to cost color scale (inverted red-green)', () => {
      const color = getValueColor(75, 0, 100, 'cost');

      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('should map value to performance color scale', () => {
      const color = getValueColor(50, 0, 100, 'performance');

      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('should map value to gradient color scale', () => {
      const color = getValueColor(25, 0, 100, 'gradient');

      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('should return default color for unknown color mode', () => {
      const color = getValueColor(50, 0, 100, 'default');

      expect(color).toBe(PRIMARY_COLORS[0]);
    });

    it('should return default color when min equals max', () => {
      const color = getValueColor(50, 50, 50, 'reliability');

      expect(color).toBe(PRIMARY_COLORS[0]);
    });

    it('should handle invert flag', () => {
      const colorNormal = getValueColor(75, 0, 100, 'reliability');
      const colorInverted = getValueColor(75, 0, 100, 'reliability', true);

      expect(colorNormal).not.toBe(colorInverted);
    });

    it('should handle value below min', () => {
      const color = getValueColor(-10, 0, 100, 'reliability');

      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('should handle value above max', () => {
      const color = getValueColor(150, 0, 100, 'reliability');

      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });
  });

  describe('Color palette constants', () => {
    it('should have valid PRIMARY_COLORS array', () => {
      expect(Array.isArray(PRIMARY_COLORS)).toBe(true);
      expect(PRIMARY_COLORS.length).toBeGreaterThan(0);
      expect(PRIMARY_COLORS.every(color => color.startsWith('#'))).toBe(true);
    });

    it('should have valid SEQUENTIAL_SCALES', () => {
      expect(Object.keys(SEQUENTIAL_SCALES)).toContain('blue');
      expect(Object.keys(SEQUENTIAL_SCALES)).toContain('green');
      expect(Object.keys(SEQUENTIAL_SCALES).length).toBeGreaterThan(0);

      Object.values(SEQUENTIAL_SCALES).forEach(scale => {
        expect(Array.isArray(scale)).toBe(true);
        expect(scale.every(color => color.startsWith('#'))).toBe(true);
      });
    });

    it('should have valid DIVERGING_SCALES', () => {
      expect(Object.keys(DIVERGING_SCALES)).toContain('redGreen');
      expect(Object.keys(DIVERGING_SCALES)).toContain('blueRed');

      Object.values(DIVERGING_SCALES).forEach(scale => {
        expect(Array.isArray(scale)).toBe(true);
        expect(scale.length).toBeGreaterThan(0);
      });
    });

    it('should have valid CATEGORY_COLORS', () => {
      expect(typeof CATEGORY_COLORS).toBe('object');
      expect(Object.keys(CATEGORY_COLORS).length).toBeGreaterThan(0);

      Object.values(CATEGORY_COLORS).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have valid STATUS_COLORS', () => {
      expect(STATUS_COLORS).toHaveProperty('success');
      expect(STATUS_COLORS).toHaveProperty('warning');
      expect(STATUS_COLORS).toHaveProperty('error');
      expect(STATUS_COLORS).toHaveProperty('info');
    });
  });
});

describe('Chart Utilities - Formatting Functions', () => {
  describe('formatValue function', () => {
    it('should format regular numbers with precision', () => {
      expect(formatValue(123.456, { precision: 2 })).toBe('123.46');
    });

    it('should format null/undefined as dash', () => {
      expect(formatValue(null as unknown as number)).toBe('-');
      expect(formatValue(undefined as unknown as number)).toBe('-');
    });

    it('should format NaN as dash', () => {
      expect(formatValue(NaN)).toBe('-');
    });

    it('should use scientific notation for very small numbers', () => {
      const result = formatValue(0.0001, { isScientific: false });

      expect(result).toContain('e');
    });

    it('should force scientific notation when isScientific is true', () => {
      const result = formatValue(12345, { isScientific: true });

      expect(result).toContain('e');
    });

    it('should use compact notation for large numbers', () => {
      expect(formatValue(1500000, { compact: true })).toContain('M');
      expect(formatValue(1500, { compact: true })).toContain('k');
    });

    it('should not use compact notation when compact is false', () => {
      const result = formatValue(1500000, { compact: false });

      expect(result).not.toContain('M');
      expect(result).not.toContain('k');
    });

    it('should add unit suffix when provided', () => {
      const result = formatValue(100, { unit: 'MPa' });

      expect(result).toContain('100');
      expect(result).toContain('MPa');
    });

    it('should handle zero', () => {
      expect(formatValue(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      const result = formatValue(-123.456, { precision: 2 });

      expect(result).toContain('-');
      expect(result).toContain('123');
    });
  });

  describe('formatAxisTick function', () => {
    it('should format axis tick with compact notation', () => {
      const result = formatAxisTick(1500000);

      expect(result).toContain('M');
    });

    it('should handle scientific notation for very small values', () => {
      const result = formatAxisTick(0.00001);

      expect(result).toMatch(/e/);
    });

    it('should have limited precision for readability', () => {
      const result = formatAxisTick(123.456);

      expect(result).not.toMatch(/\.\d{2,}/);
    });
  });

  describe('formatPercent function', () => {
    it('should format decimal as percentage', () => {
      expect(formatPercent(0.5)).toBe('50.0%');
    });

    it('should handle custom precision', () => {
      expect(formatPercent(0.333333, 0)).toBe('33%');
      expect(formatPercent(0.333333, 2)).toBe('33.33%');
    });

    it('should handle zero', () => {
      expect(formatPercent(0)).toBe('0.0%');
    });

    it('should handle 100%', () => {
      expect(formatPercent(1)).toBe('100.0%');
    });

    it('should handle values > 1', () => {
      expect(formatPercent(1.5)).toBe('150.0%');
    });

    it('should handle negative percentages', () => {
      expect(formatPercent(-0.25)).toBe('-25.0%');
    });
  });
});

describe('Chart Utilities - Data Normalization', () => {
  describe('normalizeValues function', () => {
    it('should normalize array to [0,1] range', () => {
      const values = [10, 20, 30];
      const result = normalizeValues(values);

      expect(result.normalized).toHaveLength(3);
      expect(result.normalized[0]).toBe(0);
      expect(result.normalized[2]).toBe(1);
      expect(result.min).toBe(10);
      expect(result.max).toBe(30);
    });

    it('should handle identical values', () => {
      const values = [5, 5, 5];
      const result = normalizeValues(values);

      expect(result.normalized).toEqual([0, 0, 0]);
      expect(result.min).toBe(5);
      expect(result.max).toBe(5);
    });

    it('should handle negative values', () => {
      const values = [-10, 0, 10];
      const result = normalizeValues(values);

      expect(result.normalized[0]).toBe(0);
      expect(result.normalized[2]).toBe(1);
    });

    it('should handle single value', () => {
      const values = [42];
      const result = normalizeValues(values);

      expect(result.normalized[0]).toBe(0);
      expect(result.min).toBe(42);
    });

    it('should handle empty array', () => {
      const values: number[] = [];

      expect(() => normalizeValues(values)).toThrow();
    });

    it('should handle very large range', () => {
      const values = [0, 1e6, 1e9];
      const result = normalizeValues(values);

      expect(result.normalized[0]).toBeCloseTo(0);
      expect(result.normalized[2]).toBeCloseTo(1);
    });
  });

  describe('normalizeLogScale function', () => {
    it('should normalize using log scale', () => {
      const values = [1, 10, 100];
      const result = normalizeLogScale(values);

      expect(result.normalized).toHaveLength(3);
      expect(result.normalized[0]).toBeCloseTo(0);
      expect(result.normalized[2]).toBeCloseTo(1);
    });

    it('should handle values with zero', () => {
      const values = [0, 1, 10, 100];
      const result = normalizeLogScale(values);

      expect(result.normalized[0]).toBe(0);
      expect(result.normalized).toHaveLength(4);
    });

    it('should handle all zero values', () => {
      const values = [0, 0, 0];
      const result = normalizeLogScale(values);

      expect(result.normalized).toEqual([0, 0, 0]);
      expect(result.min).toBe(0);
      expect(result.max).toBe(1);
    });

    it('should handle negative values', () => {
      const values = [-10, -1, 1, 10];
      const result = normalizeLogScale(values);

      expect(result.normalized).toHaveLength(4);
      expect(result.normalized[0]).toBe(0); // negative values map to 0
    });

    it('should handle very small values', () => {
      const values = [1e-10, 1e-5, 1];
      const result = normalizeLogScale(values);

      expect(result.normalized[0]).toBeCloseTo(0);
      expect(result.normalized[2]).toBeCloseTo(1);
    });
  });
});

describe('Chart Utilities - Domain and Scale Calculations', () => {
  describe('calculateDomain function', () => {
    it('should calculate domain with default padding', () => {
      const values = [10, 20, 30];
      const [min, max] = calculateDomain(values);

      expect(min).toBeLessThan(10);
      expect(max).toBeGreaterThan(30);
    });

    it('should calculate domain with custom padding', () => {
      const values = [10, 20, 30];
      const [min, max] = calculateDomain(values, 0.2);

      const range = 30 - 10;
      const pad = range * 0.2;
      expect(min).toBeCloseTo(Math.max(0, 10 - pad));
      expect(max).toBeCloseTo(30 + pad);
    });

    it('should not go below zero with default padding', () => {
      const values = [1, 2, 3];
      const [min, _max] = calculateDomain(values);

      expect(min).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero padding', () => {
      const values = [10, 20, 30];
      const [min, max] = calculateDomain(values, 0);

      expect(min).toBe(10);
      expect(max).toBe(30);
    });

    it('should handle identical values', () => {
      const values = [5, 5, 5];
      const [min, max] = calculateDomain(values);

      expect(min).toBeLessThan(5);
      expect(max).toBeGreaterThan(5);
    });

    it('should handle negative values', () => {
      const values = [-30, -20, -10];
      const [min, max] = calculateDomain(values);

      expect(min).toBeLessThan(-30);
      expect(max).toBeGreaterThan(-10);
    });
  });

  describe('calculateNiceTicks function', () => {
    it('should generate nice tick values', () => {
      const ticks = calculateNiceTicks(0, 100, 5);

      expect(ticks.length).toBeGreaterThan(0);
      expect(ticks[0]).toBeLessThanOrEqual(0);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(100);
    });

    it('should respect target count approximately', () => {
      const ticks = calculateNiceTicks(0, 100, 5);

      // Should be close to target count
      expect(ticks.length).toBeGreaterThanOrEqual(4);
      expect(ticks.length).toBeLessThanOrEqual(8);
    });

    it('should use round step sizes', () => {
      const ticks = calculateNiceTicks(0, 100, 5);

      const steps: number[] = [];
      for (let i = 1; i < ticks.length; i++) {
        steps.push(ticks[i] - ticks[i - 1]);
      }

      // All steps should be equal (consistent spacing)
      expect(steps.every(s => s === steps[0])).toBe(true);
    });

    it('should handle very small ranges', () => {
      const ticks = calculateNiceTicks(0, 0.01, 5);

      expect(ticks.length).toBeGreaterThan(0);
      expect(ticks[0]).toBeLessThanOrEqual(0);
    });

    it('should handle large ranges', () => {
      const ticks = calculateNiceTicks(0, 1e6, 5);

      expect(ticks.length).toBeGreaterThan(0);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(1e6);
    });

    it('should handle negative ranges', () => {
      const ticks = calculateNiceTicks(-100, 0, 5);

      expect(ticks[0]).toBeLessThanOrEqual(-100);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(0);
    });

    it('should handle single tick target', () => {
      const ticks = calculateNiceTicks(0, 100, 1);

      expect(ticks.length).toBeGreaterThan(0);
    });
  });
});

describe('Chart Utilities - Tooltip Helpers', () => {
  describe('formatTooltipData function', () => {
    it('should format tooltip data from object', () => {
      const data = { stress_value: 250, temperature: 45.5 };
      const result = formatTooltipData(data);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('label');
      expect(result[0]).toHaveProperty('value');
    });

    it('should format numeric values with config', () => {
      const data = { stress: 1234567, cost: 0.0001 };
      const config = {
        stress: { precision: 0, unit: 'MPa' },
        cost: { isScientific: true }
      };
      const result = formatTooltipData(data, config);

      expect(result[0].value).toContain('MPa');
    });

    it('should handle string values', () => {
      const data = { name: 'Tank A', status: 'active' };
      const result = formatTooltipData(data);

      expect(result[0].value).toBe('Tank A');
      expect(result[1].value).toBe('active');
    });

    it('should capitalize labels', () => {
      const data = { first_name: 'John', last_name: 'Doe' };
      const result = formatTooltipData(data);

      expect(result[0].label).toContain('First');
      expect(result[1].label).toContain('Last');
    });

    it('should handle mixed numeric and string values', () => {
      const data = { id: '123', value: 456.78, status: 'OK' };
      const result = formatTooltipData(data);

      expect(result).toHaveLength(3);
      result.forEach(item => {
        expect(item.label).toBeTruthy();
        expect(item.value).toBeTruthy();
      });
    });

    it('should handle empty data object', () => {
      const data = {};
      const result = formatTooltipData(data);

      expect(result).toEqual([]);
    });
  });
});

describe('Chart Utilities - Configuration', () => {
  it('should have valid DEFAULT_CHART_CONFIG', () => {
    expect(DEFAULT_CHART_CONFIG).toHaveProperty('chartType');
    expect(DEFAULT_CHART_CONFIG).toHaveProperty('colorMode');
    expect(DEFAULT_CHART_CONFIG).toHaveProperty('showGrid');
    expect(DEFAULT_CHART_CONFIG.showGrid).toBe(true);
  });
});

// ============================================================================
// COLORMAP UTILITIES TESTS
// ============================================================================

describe('Colormap Utilities - Color Interpolation', () => {
  describe('colormapInterpolateColor function', () => {
    it('should interpolate color from jet colormap', () => {
      const color = colormapInterpolateColor(50, 0, 100, 'jet');

      expect(color).toHaveProperty('r');
      expect(color).toHaveProperty('g');
      expect(color).toHaveProperty('b');
      expect(color.r).toBeGreaterThanOrEqual(0);
      expect(color.r).toBeLessThanOrEqual(255);
    });

    it('should interpolate color from thermal colormap', () => {
      const color = colormapInterpolateColor(50, 0, 100, 'thermal');

      expect(color).toHaveProperty('r');
      expect(color).toHaveProperty('g');
      expect(color).toHaveProperty('b');
    });

    it('should interpolate color from viridis colormap', () => {
      const color = colormapInterpolateColor(50, 0, 100, 'viridis');

      expect(color).toHaveProperty('r');
      expect(color.b).toBeGreaterThanOrEqual(0);
    });

    it('should interpolate color from plasma colormap', () => {
      const color = colormapInterpolateColor(50, 0, 100, 'plasma');

      expect(color).toHaveProperty('r');
    });

    it('should interpolate color from coolwarm colormap', () => {
      const color = colormapInterpolateColor(50, 0, 100, 'coolwarm');

      expect(color).toHaveProperty('r');
    });

    it('should clamp values to [0,1] normalization', () => {
      const colorBelow = colormapInterpolateColor(-10, 0, 100, 'jet');
      const colorAbove = colormapInterpolateColor(150, 0, 100, 'jet');

      expect(colorBelow).toHaveProperty('r');
      expect(colorAbove).toHaveProperty('r');
    });

    it('should handle min equals max', () => {
      const color = colormapInterpolateColor(50, 50, 50, 'jet');

      expect(color).toHaveProperty('r');
    });

    it('should map value at min to start of colormap', () => {
      const color = colormapInterpolateColor(0, 0, 100, 'jet');

      // At the start of jet colormap (dark blue): r=0, g=0, b=143
      expect(color.r).toBe(0);
      expect(color.b).toBeGreaterThan(100);
    });

    it('should map value at max to end of colormap', () => {
      const color = colormapInterpolateColor(100, 0, 100, 'jet');

      expect(color.r).toBeGreaterThan(100);
    });
  });

  describe('interpolateColorHex function', () => {
    it('should return hex color string', () => {
      const color = interpolateColorHex(50, 0, 100, 'jet');

      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should be valid hex format for all colormaps', () => {
      const colormaps = ['jet', 'thermal', 'viridis', 'plasma', 'coolwarm'] as const;

      colormaps.forEach(colormap => {
        const color = interpolateColorHex(50, 0, 100, colormap);
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should produce consistent results for same input', () => {
      const color1 = interpolateColorHex(50, 0, 100, 'jet');
      const color2 = interpolateColorHex(50, 0, 100, 'jet');

      expect(color1).toBe(color2);
    });
  });

  describe('interpolateColorRGB function', () => {
    it('should return CSS rgb() string', () => {
      const color = interpolateColorRGB(50, 0, 100, 'jet');

      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('should produce valid rgb values', () => {
      const color = interpolateColorRGB(50, 0, 100, 'thermal');

      const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      if (match) {
        expect(parseInt(match[1])).toBeLessThanOrEqual(255);
        expect(parseInt(match[2])).toBeLessThanOrEqual(255);
        expect(parseInt(match[3])).toBeLessThanOrEqual(255);
      }
    });
  });
});

describe('Colormap Utilities - Color Stops and Discrete Colors', () => {
  describe('getColorStops function', () => {
    it('should return array of color stops', () => {
      const stops = getColorStops('jet');

      expect(Array.isArray(stops)).toBe(true);
      expect(stops.length).toBeGreaterThan(0);
    });

    it('should have offset and color properties', () => {
      const stops = getColorStops('jet');

      stops.forEach(stop => {
        expect(stop).toHaveProperty('offset');
        expect(stop).toHaveProperty('color');
        expect(stop.offset).toBeGreaterThanOrEqual(0);
        expect(stop.offset).toBeLessThanOrEqual(1);
        expect(stop.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should start at 0 and end at 1', () => {
      const stops = getColorStops('jet');

      expect(stops[0].offset).toBe(0);
      expect(stops[stops.length - 1].offset).toBeCloseTo(1);
    });

    it('should respect custom numStops parameter', () => {
      const stops5 = getColorStops('jet', 5);
      const stops20 = getColorStops('jet', 20);

      expect(stops5.length).toBe(5);
      expect(stops20.length).toBe(20);
    });

    it('should work with all colormap types', () => {
      const colormaps = ['jet', 'thermal', 'viridis', 'plasma', 'coolwarm'] as const;

      colormaps.forEach(colormap => {
        const stops = getColorStops(colormap);
        expect(stops.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getDiscreteColors function', () => {
    it('should return array of hex colors', () => {
      const colors = getDiscreteColors('jet', 5);

      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBe(5);
      expect(colors.every(c => c.match(/^#[0-9A-Fa-f]{6}$/))).toBe(true);
    });

    it('should respect numColors parameter', () => {
      const colors5 = getDiscreteColors('jet', 5);
      const colors10 = getDiscreteColors('jet', 10);

      expect(colors5.length).toBe(5);
      expect(colors10.length).toBe(10);
    });

    it('should use default numColors if not provided', () => {
      const colors = getDiscreteColors('jet');

      expect(colors.length).toBeGreaterThan(0);
    });

    it('should sample evenly across colormap', () => {
      const colors = getDiscreteColors('jet', 3);

      // First should be near dark blue, last should be near red
      expect(colors[0]).toBeTruthy();
      expect(colors[2]).toBeTruthy();
      expect(colors[0]).not.toBe(colors[2]);
    });

    it('should work with all colormaps', () => {
      const colormaps = ['jet', 'thermal', 'viridis', 'plasma', 'coolwarm'] as const;

      colormaps.forEach(colormap => {
        const colors = getDiscreteColors(colormap, 5);
        expect(colors.length).toBe(5);
      });
    });
  });
});

describe('Colormap Utilities - Colormap Management', () => {
  describe('getAvailableColormaps function', () => {
    it('should return array of colormap names', () => {
      const colormaps = getAvailableColormaps();

      expect(Array.isArray(colormaps)).toBe(true);
      expect(colormaps.length).toBeGreaterThan(0);
    });

    it('should include all expected colormaps', () => {
      const colormaps = getAvailableColormaps();

      expect(colormaps).toContain('jet');
      expect(colormaps).toContain('thermal');
      expect(colormaps).toContain('viridis');
    });
  });

  describe('getColormapDescription function', () => {
    it('should return string description for each colormap', () => {
      const descriptions = ['jet', 'thermal', 'viridis', 'plasma', 'coolwarm'] as const;

      descriptions.forEach(colormap => {
        const desc = getColormapDescription(colormap);
        expect(typeof desc).toBe('string');
        expect(desc.length).toBeGreaterThan(0);
      });
    });

    it('should describe jet colormap', () => {
      const desc = getColormapDescription('jet');

      expect(desc).toContain('FEA');
    });

    it('should describe thermal colormap', () => {
      const desc = getColormapDescription('thermal');

      expect(desc.includes('Temperature') || desc.includes('thermal')).toBe(true);
    });
  });
});

describe('Colormap Utilities - CSS and Three.js Integration', () => {
  describe('createCSSGradient function', () => {
    it('should return valid CSS gradient string', () => {
      const gradient = createCSSGradient('jet');

      expect(gradient).toContain('linear-gradient');
      expect(gradient).toContain('to right');
    });

    it('should respect direction parameter', () => {
      const gradientRight = createCSSGradient('jet', 'to right');
      const gradientBottom = createCSSGradient('jet', 'to bottom');

      expect(gradientRight).toContain('to right');
      expect(gradientBottom).toContain('to bottom');
    });

    it('should respect numStops parameter', () => {
      const gradient5 = createCSSGradient('jet', 'to right', 5);
      const gradient20 = createCSSGradient('jet', 'to right', 20);

      // More stops should mean more color definitions
      expect(gradient20.length).toBeGreaterThan(gradient5.length);
    });

    it('should include percentages in gradient', () => {
      const gradient = createCSSGradient('jet');

      expect(gradient).toContain('%');
    });

    it('should work with all colormaps', () => {
      const colormaps = ['jet', 'thermal', 'viridis', 'plasma', 'coolwarm'] as const;

      colormaps.forEach(colormap => {
        const gradient = createCSSGradient(colormap);
        expect(gradient).toContain('linear-gradient');
      });
    });
  });

  describe('getThreeColor function', () => {
    it('should return array of normalized RGB values', () => {
      const color = getThreeColor(50, 0, 100, 'jet');

      expect(Array.isArray(color)).toBe(true);
      expect(color).toHaveLength(3);
      expect(color[0]).toBeGreaterThanOrEqual(0);
      expect(color[0]).toBeLessThanOrEqual(1);
    });

    it('should normalize values to [0,1]', () => {
      const color = getThreeColor(50, 0, 100, 'jet');

      expect(color[0]).toBeGreaterThanOrEqual(0);
      expect(color[0]).toBeLessThanOrEqual(1);
      expect(color[1]).toBeGreaterThanOrEqual(0);
      expect(color[1]).toBeLessThanOrEqual(1);
      expect(color[2]).toBeGreaterThanOrEqual(0);
      expect(color[2]).toBeLessThanOrEqual(1);
    });

    it('should work with all colormaps', () => {
      const colormaps = ['jet', 'thermal', 'viridis', 'plasma', 'coolwarm'] as const;

      colormaps.forEach(colormap => {
        const color = getThreeColor(50, 0, 100, colormap);
        expect(color).toHaveLength(3);
      });
    });
  });

  describe('batchGetThreeColors function', () => {
    it('should return flat array of RGB values', () => {
      const colors = batchGetThreeColors([10, 50, 90], 0, 100, 'jet');

      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBe(9); // 3 colors * 3 values each
    });

    it('should preserve order of input values', () => {
      const values = [10, 50, 90];
      const colors = batchGetThreeColors(values, 0, 100, 'jet');

      // First color (value 10) should differ from last color (value 90)
      expect(colors[0]).not.toBe(colors[6]);
    });

    it('should handle empty array', () => {
      const colors = batchGetThreeColors([], 0, 100, 'jet');

      expect(colors).toEqual([]);
    });

    it('should handle single value', () => {
      const colors = batchGetThreeColors([50], 0, 100, 'jet');

      expect(colors).toHaveLength(3);
    });

    it('should all values be normalized [0,1]', () => {
      const colors = batchGetThreeColors([10, 50, 90], 0, 100, 'jet');

      colors.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('should work with all colormaps', () => {
      const colormaps = ['jet', 'thermal', 'viridis', 'plasma', 'coolwarm'] as const;
      const values = [25, 50, 75];

      colormaps.forEach(colormap => {
        const colors = batchGetThreeColors(values, 0, 100, colormap);
        expect(colors.length).toBe(9);
      });
    });
  });
});

describe('Chart Utilities - Edge Cases', () => {
  describe('NaN and Infinity handling', () => {
    it('should handle Infinity in values', () => {
      expect(() => normalizeValues([0, Infinity, 100])).toThrow();
    });

    it('should format Infinity with string representation', () => {
      expect(formatValue(Infinity)).toBe('Infinity');
      expect(formatValue(-Infinity)).toBe('-Infinity');
    });

    it('should handle NaN in color interpolation', () => {
      const colors = ['#FF0000', '#0000FF'];
      const result = interpolateColor(colors, NaN);

      expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });
  });

  describe('Empty and extreme data', () => {
    it('should handle empty arrays in normalization', () => {
      expect(() => normalizeValues([])).toThrow();
    });

    it('should handle very large numbers', () => {
      const values = [1e100, 2e100];
      const result = normalizeValues(values);

      expect(result.normalized[0]).toBe(0);
      expect(result.normalized[1]).toBeCloseTo(1);
    });

    it('should handle very small numbers', () => {
      const values = [1e-100, 2e-100];
      const result = normalizeValues(values);

      expect(result.normalized[0]).toBe(0);
      expect(result.normalized[1]).toBeCloseTo(1);
    });
  });

  describe('Type safety in formatting', () => {
    it('should handle invalid format gracefully', () => {
      expect(formatValue(123, { precision: -1 })).toBeTruthy();
    });

    it('should handle missing config options', () => {
      expect(formatValue(123, {})).toBeTruthy();
    });
  });
});
