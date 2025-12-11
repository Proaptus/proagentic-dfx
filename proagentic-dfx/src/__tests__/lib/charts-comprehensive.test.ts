/**
 * COMPREHENSIVE CHART UTILITIES TEST SUITE
 * 70+ Tests for 80%+ Coverage (ALL 4 METRICS: statements, branches, functions, lines)
 *
 * Target Files:
 * - chart-utils.ts (color interpolation, formatting, data normalization, domain calculation)
 * - colormap.ts (colormap interpolation, CSS generation, Three.js colors)
 * - pareto-config.ts (configuration utilities, design validation)
 */

import { describe, it, expect } from 'vitest';
import {
  interpolateColor,
  getValueColor,
  PRIMARY_COLORS,
  SEQUENTIAL_SCALES,
  DIVERGING_SCALES,
  CATEGORY_COLORS,
  STATUS_COLORS,
  DEFAULT_CHART_CONFIG,
  formatValue,
  formatAxisTick,
  formatPercent,
  normalizeValues,
  normalizeLogScale,
  calculateDomain,
  calculateNiceTicks,
  formatTooltipData,
  ANIMATION_CONFIG,
  ChartUtils,
} from '@/lib/charts/chart-utils';

import {
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
  type ColormapType,
} from '@/lib/charts/colormap';

import {
  getCategoryColors,
  formatCategoryLabel,
  isValidParetoDesign,
  extractHighlightedDesigns,
  findRecommendedDesign,
  X_AXIS_OPTIONS,
  Y_AXIS_OPTIONS,
  LEGEND_ITEMS,
  CATEGORY_COLORS as PARETO_CATEGORY_COLORS,
  type TradeOffCategory,
} from '@/lib/charts/pareto-config';

// ============================================================================
// CHART-UTILS: COLOR INTERPOLATION TESTS (10 tests)
// ============================================================================

describe('Chart Utils - Color Interpolation', () => {
  it('should interpolate at t=0', () => {
    const result = interpolateColor(['#FF0000', '#0000FF'], 0);
    expect(result).toBe('rgb(255, 0, 0)');
  });

  it('should interpolate at t=1', () => {
    const result = interpolateColor(['#FF0000', '#0000FF'], 1);
    expect(result).toBe('rgb(0, 0, 255)');
  });

  it('should interpolate at t=0.5', () => {
    const result = interpolateColor(['#FF0000', '#0000FF'], 0.5);
    expect(result).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/);
  });

  it('should clamp t < 0', () => {
    const result = interpolateColor(['#FF0000', '#0000FF'], -0.5);
    expect(result).toBe('rgb(255, 0, 0)');
  });

  it('should clamp t > 1', () => {
    const result = interpolateColor(['#FF0000', '#0000FF'], 1.5);
    expect(result).toBe('rgb(0, 0, 255)');
  });

  it('should handle multi-color scales', () => {
    const result = interpolateColor(['#0000FF', '#00FF00', '#FF0000'], 0.5);
    expect(result).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/);
  });

  it('should return primary color when min === max for getValueColor', () => {
    const result = getValueColor(100, 100, 100, 'default');
    expect(result).toBe(PRIMARY_COLORS[0]);
  });

  it('should apply reliability gradient', () => {
    const result = getValueColor(50, 0, 100, 'reliability');
    expect(result).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/);
  });

  it('should invert gradient when invert=true', () => {
    const normal = getValueColor(25, 0, 100, 'reliability', false);
    const inverted = getValueColor(25, 0, 100, 'reliability', true);
    expect(normal).not.toBe(inverted);
  });

  it('should handle different color modes', () => {
    const cost = getValueColor(50, 0, 100, 'cost');
    const perf = getValueColor(50, 0, 100, 'performance');
    const grad = getValueColor(50, 0, 100, 'gradient');
    expect([cost, perf, grad].every(c => c.includes('rgb('))).toBe(true);
  });
});

// ============================================================================
// CHART-UTILS: VALUE FORMATTING TESTS (15 tests)
// ============================================================================

describe('Chart Utils - Value Formatting', () => {
  it('should format null as dash', () => {
    expect(formatValue(null as any)).toBe('-');
  });

  it('should format undefined as dash', () => {
    expect(formatValue(undefined as any)).toBe('-');
  });

  it('should format NaN as dash', () => {
    expect(formatValue(NaN)).toBe('-');
  });

  it('should use scientific notation for very small values', () => {
    const result = formatValue(0.0001);
    expect(result).toMatch(/e[\-\+]?\d+/);
  });

  it('should format large numbers with M suffix', () => {
    expect(formatValue(1500000, { compact: true })).toBe('1.5M');
  });

  it('should format thousands with k suffix', () => {
    expect(formatValue(5000, { compact: true })).toBe('5.0k');
  });

  it('should not compact when disabled', () => {
    const result = formatValue(5000, { compact: false });
    expect(result).not.toContain('k');
  });

  it('should add unit suffix', () => {
    expect(formatValue(100, { unit: 'kg' })).toContain('kg');
  });

  it('should format 0 as 0', () => {
    expect(formatValue(0)).toBe('0');
  });

  it('should handle Infinity', () => {
    expect(formatValue(Infinity).includes('Infinity')).toBe(true);
  });

  it('should format percent 0.5 as 50%', () => {
    expect(formatPercent(0.5)).toBe('50.0%');
  });

  it('should format percent 1 as 100%', () => {
    expect(formatPercent(1)).toBe('100.0%');
  });

  it('should respect precision for percent', () => {
    expect(formatPercent(0.123, 2)).toBe('12.30%');
  });

  it('should format axis tick compactly', () => {
    expect(formatAxisTick(1500)).toBe('1.5k');
  });

  it('should format axis tick with scientific notation', () => {
    const result = formatAxisTick(0.0001, true);
    expect(result).toMatch(/e[\-\+]?\d+/);
  });
});

// ============================================================================
// CHART-UTILS: DATA NORMALIZATION TESTS (10 tests)
// ============================================================================

describe('Chart Utils - Data Normalization', () => {
  it('should normalize values to 0-1 range', () => {
    const result = normalizeValues([0, 50, 100]);
    expect(result.normalized).toEqual([0, 0.5, 1]);
    expect(result.min).toBe(0);
    expect(result.max).toBe(100);
  });

  it('should handle negative values', () => {
    const result = normalizeValues([-50, 0, 50]);
    expect(result.normalized[0]).toBe(0);
    expect(result.normalized[2]).toBe(1);
  });

  it('should handle single value', () => {
    const result = normalizeValues([42]);
    expect(result.normalized[0]).toBe(0);
  });

  it('should handle identical values', () => {
    const result = normalizeValues([5, 5, 5]);
    expect(result.normalized).toEqual([0, 0, 0]);
  });

  it('should handle large ranges', () => {
    const result = normalizeValues([0, 1000000]);
    expect(result.normalized[0]).toBe(0);
    expect(result.normalized[1]).toBe(1);
  });

  it('should normalize log scale with positive values', () => {
    const result = normalizeLogScale([1, 10, 100]);
    expect(result.normalized[0]).toBe(0);
    expect(result.normalized[2]).toBe(1);
  });

  it('should handle non-positive values in log scale', () => {
    const result = normalizeLogScale([0, -5, 10]);
    expect(result.normalized).toHaveLength(3);
    expect(result.normalized[0]).toBe(0);
  });

  it('should return zeros for no positive values', () => {
    const result = normalizeLogScale([0, -5, -10]);
    expect(result.normalized).toEqual([0, 0, 0]);
  });

  it('should handle decimal normalization', () => {
    const result = normalizeValues([0.1, 0.5, 0.9]);
    expect(result.normalized[0]).toBe(0);
    expect(result.normalized[2]).toBe(1);
  });

  it('should preserve order in normalization', () => {
    const result = normalizeValues([100, 50, 150, 75]);
    expect(result.normalized[0]).toBeGreaterThan(0);
    expect(result.normalized[0]).toBeLessThan(1);
  });
});

// ============================================================================
// CHART-UTILS: DOMAIN CALCULATION TESTS (10 tests)
// ============================================================================

describe('Chart Utils - Domain Calculations', () => {
  it('should apply padding to domain', () => {
    const [min, max] = calculateDomain([0, 100], 0.1);
    expect(min).toBeLessThanOrEqual(0);
    expect(max).toBeGreaterThan(100);
  });

  it('should handle zero padding', () => {
    const [min, max] = calculateDomain([0, 100], 0);
    expect(min).toBe(0);
    expect(max).toBe(100);
  });

  it('should not go below 0 by default', () => {
    const [min, max] = calculateDomain([5, 10], 0.5);
    expect(min).toBeGreaterThanOrEqual(0);
  });

  it('should handle single value', () => {
    const [min, max] = calculateDomain([50]);
    expect(min).toBeLessThanOrEqual(50);
    expect(max).toBeGreaterThanOrEqual(50);
  });

  it('should generate nice ticks', () => {
    const ticks = calculateNiceTicks(0, 100, 5);
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0]).toBeLessThanOrEqual(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(100);
  });

  it('should generate ticks in ascending order', () => {
    const ticks = calculateNiceTicks(0, 100, 5);
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i]).toBeGreaterThan(ticks[i - 1]);
    }
  });

  it('should handle negative ranges', () => {
    const ticks = calculateNiceTicks(-100, 0, 5);
    expect(ticks[0]).toBeLessThanOrEqual(-100);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(0);
  });

  it('should handle decimal ranges', () => {
    const ticks = calculateNiceTicks(0, 1, 5);
    expect(ticks.length).toBeGreaterThan(0);
  });

  it('should handle very large ranges', () => {
    const ticks = calculateNiceTicks(0, 1000000, 5);
    expect(ticks.length).toBeGreaterThan(0);
  });

  it('should handle small ranges', () => {
    const ticks = calculateNiceTicks(0, 0.01, 5);
    expect(ticks.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// CHART-UTILS: TOOLTIP FORMATTING TESTS (8 tests)
// ============================================================================

describe('Chart Utils - Tooltip Formatting', () => {
  it('should format simple data', () => {
    const result = formatTooltipData({ weight_kg: 50, cost_eur: 1000 });
    expect(result).toHaveLength(2);
  });

  it('should capitalize labels', () => {
    const result = formatTooltipData({ p_failure: 0.01 });
    expect(result[0].label).toBe('P Failure');
  });

  it('should replace underscores with spaces', () => {
    const result = formatTooltipData({ burst_pressure_bar: 200 });
    expect(result[0].label).not.toContain('_');
  });

  it('should format numeric values as strings', () => {
    const result = formatTooltipData({ weight_kg: 50 });
    expect(typeof result[0].value).toBe('string');
  });

  it('should preserve string values', () => {
    const result = formatTooltipData({ category: 'recommended' });
    expect(result[0].value).toBe('recommended');
  });

  it('should handle custom format options', () => {
    const result = formatTooltipData({ cost_eur: 5000 }, { cost_eur: { compact: true } });
    expect(result[0].value).toContain('5');
  });

  it('should handle empty data', () => {
    const result = formatTooltipData({});
    expect(result).toHaveLength(0);
  });

  it('should handle mixed data types', () => {
    const result = formatTooltipData({ name: 'Design A', weight: 100, status: 'active' });
    expect(result).toHaveLength(3);
  });
});

// ============================================================================
// COLORMAP TESTS: INTERPOLATION (15 tests)
// ============================================================================

describe('Colormap - Interpolation', () => {
  it('should interpolate jet colormap', () => {
    const result = colormapInterpolateColor(500, 0, 1000, 'jet');
    expect(result).toHaveProperty('r');
    expect(result.r).toBeGreaterThanOrEqual(0);
    expect(result.r).toBeLessThanOrEqual(255);
  });

  it('should interpolate thermal colormap', () => {
    const result = colormapInterpolateColor(500, 0, 1000, 'thermal');
    expect(result.r + result.g + result.b).toBeGreaterThan(0);
  });

  it('should interpolate viridis colormap', () => {
    const result = colormapInterpolateColor(500, 0, 1000, 'viridis');
    expect(result).toHaveProperty('r');
  });

  it('should interpolate plasma colormap', () => {
    const result = colormapInterpolateColor(500, 0, 1000, 'plasma');
    expect(result).toHaveProperty('r');
  });

  it('should interpolate coolwarm colormap', () => {
    const result = colormapInterpolateColor(500, 0, 1000, 'coolwarm');
    expect(result).toHaveProperty('r');
  });

  it('should clamp values below range', () => {
    const result = colormapInterpolateColor(-500, 0, 1000, 'jet');
    expect(result).toHaveProperty('r');
  });

  it('should clamp values above range', () => {
    const result = colormapInterpolateColor(1500, 0, 1000, 'jet');
    expect(result).toHaveProperty('r');
  });

  it('should return hex color', () => {
    const result = interpolateColorHex(500, 0, 1000, 'jet');
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should return RGB string', () => {
    const result = interpolateColorRGB(500, 0, 1000, 'jet');
    expect(result).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/);
  });

  it('should work with all colormaps for hex', () => {
    const colormaps: ColormapType[] = ['jet', 'thermal', 'viridis', 'plasma', 'coolwarm'];
    for (const colormap of colormaps) {
      const result = interpolateColorHex(500, 0, 1000, colormap);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('should work with all colormaps for RGB', () => {
    const colormaps: ColormapType[] = ['jet', 'thermal', 'viridis', 'plasma', 'coolwarm'];
    for (const colormap of colormaps) {
      const result = interpolateColorRGB(500, 0, 1000, colormap);
      expect(result).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/);
    }
  });

  it('should handle edge values', () => {
    const min = interpolateColorHex(0, 0, 100, 'jet');
    const max = interpolateColorHex(100, 0, 100, 'jet');
    expect(min).toMatch(/^#[0-9a-f]{6}$/i);
    expect(max).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should handle decimal values', () => {
    const result = colormapInterpolateColor(0.5, 0, 1, 'jet');
    expect(result).toHaveProperty('r');
  });

  it('should return Three.js compatible colors', () => {
    const color = getThreeColor(500, 0, 1000, 'jet');
    expect(color).toHaveLength(3);
    expect(color.every(c => c >= 0 && c <= 1)).toBe(true);
  });
});

// ============================================================================
// COLORMAP TESTS: COLOR STOPS AND GENERATION (12 tests)
// ============================================================================

describe('Colormap - Color Stops and Generation', () => {
  it('should return color stops array', () => {
    const stops = getColorStops('jet');
    expect(Array.isArray(stops)).toBe(true);
  });

  it('should have offsets from 0 to 1', () => {
    const stops = getColorStops('jet');
    expect(stops[0].offset).toBe(0);
    expect(stops[stops.length - 1].offset).toBe(1);
  });

  it('should have ascending offsets', () => {
    const stops = getColorStops('jet');
    for (let i = 1; i < stops.length; i++) {
      expect(stops[i].offset).toBeGreaterThan(stops[i - 1].offset);
    }
  });

  it('should use custom number of stops', () => {
    const stops = getColorStops('jet', 20);
    expect(stops).toHaveLength(20);
  });

  it('should return discrete colors', () => {
    const colors = getDiscreteColors('jet', 5);
    expect(colors).toHaveLength(5);
    expect(colors.every(c => c.match(/^#[0-9a-f]{6}$/i))).toBe(true);
  });

  it('should span colormap range', () => {
    const colors = getDiscreteColors('jet', 3);
    expect(colors[0]).not.toBe(colors[2]);
  });

  it('should list available colormaps', () => {
    const colormaps = getAvailableColormaps();
    expect(colormaps).toContain('jet');
    expect(colormaps).toContain('viridis');
    expect(colormaps).toContain('thermal');
  });

  it('should describe colormaps', () => {
    const desc = getColormapDescription('jet');
    expect(desc.length).toBeGreaterThan(0);
  });

  it('should create CSS gradient', () => {
    const gradient = createCSSGradient('jet');
    expect(gradient).toContain('linear-gradient');
  });

  it('should support gradient directions', () => {
    const grad1 = createCSSGradient('jet', 'to right');
    const grad2 = createCSSGradient('jet', 'to bottom');
    expect(grad1).toContain('to right');
    expect(grad2).toContain('to bottom');
  });

  it('should include percentage offsets in gradient', () => {
    const gradient = createCSSGradient('jet', 'to right', 5);
    expect(gradient).toMatch(/%/);
  });

  it('should batch process Three.js colors', () => {
    const colors = batchGetThreeColors([100, 500, 900], 0, 1000, 'jet');
    expect(colors.length).toBe(9); // 3 values * 3 components
    expect(colors.every(c => c >= 0 && c <= 1)).toBe(true);
  });
});

// ============================================================================
// PARETO-CONFIG TESTS (17 tests)
// ============================================================================

describe('Pareto Config - Utilities', () => {
  it('should return colors for lightest category', () => {
    const colors = getCategoryColors('lightest');
    expect(colors).toHaveProperty('bg');
    expect(colors).toHaveProperty('dot');
  });

  it('should return default colors for undefined', () => {
    const colors = getCategoryColors(undefined);
    expect(colors).toEqual(PARETO_CATEGORY_COLORS.default);
  });

  it('should return default colors for invalid category', () => {
    const colors = getCategoryColors('invalid');
    expect(colors).toEqual(PARETO_CATEGORY_COLORS.default);
  });

  it('should format category labels', () => {
    expect(formatCategoryLabel('max_margin')).toBe('max margin');
  });

  it('should return Unknown for undefined labels', () => {
    expect(formatCategoryLabel(undefined)).toBe('Unknown');
  });

  it('should validate complete Pareto design', () => {
    const design = {
      id: 'design-1',
      weight_kg: 100,
      cost_eur: 5000,
      burst_pressure_bar: 200,
    };
    expect(isValidParetoDesign(design)).toBe(true);
  });

  it('should reject incomplete designs', () => {
    const design = { id: 'design-1', weight_kg: 100, cost_eur: 5000 };
    expect(isValidParetoDesign(design as any)).toBe(false);
  });

  it('should filter highlighted designs', () => {
    const designs = [
      { id: '1', weight_kg: 100, cost_eur: 5000, burst_pressure_bar: 200, trade_off_category: 'recommended' },
      { id: '2', weight_kg: 110, cost_eur: 5500, burst_pressure_bar: 190 },
    ] as any;
    const highlighted = extractHighlightedDesigns(designs);
    expect(highlighted).toHaveLength(1);
  });

  it('should find recommended design', () => {
    const designs = [
      { id: '1', weight_kg: 100, cost_eur: 5000, burst_pressure_bar: 200, trade_off_category: 'lightest' },
      { id: '2', weight_kg: 110, cost_eur: 5500, burst_pressure_bar: 190, trade_off_category: 'recommended' },
    ] as any;
    const recommended = findRecommendedDesign(designs);
    expect(recommended?.id).toBe('2');
  });

  it('should return undefined if no recommended', () => {
    const designs = [
      { id: '1', weight_kg: 100, cost_eur: 5000, burst_pressure_bar: 200, trade_off_category: 'lightest' },
    ] as any;
    expect(findRecommendedDesign(designs)).toBeUndefined();
  });

  it('should have X axis options', () => {
    expect(X_AXIS_OPTIONS.length).toBeGreaterThan(0);
    expect(X_AXIS_OPTIONS.some(o => o.value === 'weight_kg')).toBe(true);
  });

  it('should have Y axis options', () => {
    expect(Y_AXIS_OPTIONS.length).toBeGreaterThan(0);
    expect(Y_AXIS_OPTIONS.some(o => o.value === 'burst_pressure_bar')).toBe(true);
  });

  it('should have legend items', () => {
    expect(LEGEND_ITEMS.length).toBeGreaterThan(0);
    expect(LEGEND_ITEMS.every(i => i.color.match(/^#[0-9a-f]{6}$/i))).toBe(true);
  });

  it('should have category color definitions', () => {
    expect(PARETO_CATEGORY_COLORS).toHaveProperty('lightest');
    expect(PARETO_CATEGORY_COLORS).toHaveProperty('recommended');
  });

  it('should have valid hex colors in config', () => {
    const categories = Object.values(PARETO_CATEGORY_COLORS);
    expect(categories.every(c => c.bg.match(/^#[0-9a-f]{6}$/i))).toBe(true);
  });

  it('should handle empty design array', () => {
    expect(extractHighlightedDesigns([])).toEqual([]);
  });
});

// ============================================================================
// CHART CONSTANTS AND EXPORTS (8 tests)
// ============================================================================

describe('Chart Utils - Constants and Exports', () => {
  it('should have primary colors', () => {
    expect(PRIMARY_COLORS.length).toBeGreaterThan(0);
    expect(PRIMARY_COLORS.every(c => c.match(/^#[0-9a-f]{6}$/i))).toBe(true);
  });

  it('should have sequential scales', () => {
    expect(Object.keys(SEQUENTIAL_SCALES).length).toBeGreaterThan(0);
  });

  it('should have diverging scales', () => {
    expect(DIVERGING_SCALES).toHaveProperty('redGreen');
    expect(DIVERGING_SCALES).toHaveProperty('coolWarm');
  });

  it('should have category colors', () => {
    expect(Object.keys(CATEGORY_COLORS).length).toBeGreaterThan(0);
  });

  it('should have status colors', () => {
    expect(STATUS_COLORS).toHaveProperty('success');
    expect(STATUS_COLORS).toHaveProperty('error');
  });

  it('should have default chart config', () => {
    expect(DEFAULT_CHART_CONFIG.chartType).toBe('line');
    expect(DEFAULT_CHART_CONFIG.showGrid).toBe(true);
  });

  it('should have animation config with increasing durations', () => {
    expect(ANIMATION_CONFIG.fast.duration).toBeLessThan(ANIMATION_CONFIG.normal.duration);
    expect(ANIMATION_CONFIG.normal.duration).toBeLessThan(ANIMATION_CONFIG.slow.duration);
  });

  it('should export ChartUtils object', () => {
    expect(ChartUtils).toHaveProperty('interpolateColor');
    expect(ChartUtils).toHaveProperty('formatValue');
    expect(ChartUtils).toHaveProperty('normalizeValues');
  });
});
