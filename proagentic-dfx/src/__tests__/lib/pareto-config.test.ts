/**
 * Pareto Configuration Test Suite
 * Tests for lib/charts/pareto-config.ts
 *
 * Coverage targets:
 * - Metric option generation and currency formatting
 * - Trade-off category color management
 * - Pareto design validation
 * - Design highlighting and recommendation logic
 * - Legend configuration
 * - Category color utilities
 * - Format utilities for labels
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getXAxisOptions,
  getYAxisOptions,
  X_AXIS_OPTIONS,
  Y_AXIS_OPTIONS,
  CATEGORY_COLORS,
  LEGEND_ITEMS,
  getCategoryColors,
  formatCategoryLabel,
  isValidParetoDesign,
  extractHighlightedDesigns,
  findRecommendedDesign,
} from '@/lib/charts/pareto-config';
import { ParetoDesign } from '@/lib/types';
import * as currencyUtils from '@/lib/utils/currency';

// Mock the currency utilities
vi.mock('@/lib/utils/currency', () => ({
  formatCurrencyLabel: vi.fn((label: string) => `${label} (£)`),
}));

describe('Pareto Configuration - TDD Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof localStorage !== 'undefined' && localStorage.clear) {
      localStorage.clear();
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // AXIS OPTIONS TESTS
  // ============================================================================

  describe('getXAxisOptions - X-Axis Metric Options', () => {
    it('should return array of metric options', () => {
      const options = getXAxisOptions();

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it('should include weight_kg metric', () => {
      const options = getXAxisOptions();
      const weightOption = options.find((opt) => opt.value === 'weight_kg');

      expect(weightOption).toBeDefined();
      expect(weightOption?.label).toBe('Weight (kg)');
    });

    it('should include cost_eur metric with formatted label', () => {
      const options = getXAxisOptions();
      const costOption = options.find((opt) => opt.value === 'cost_eur');

      expect(costOption).toBeDefined();
      expect(currencyUtils.formatCurrencyLabel).toHaveBeenCalledWith('Cost');
    });

    it('should include p_failure metric', () => {
      const options = getXAxisOptions();
      const failureOption = options.find((opt) => opt.value === 'p_failure');

      expect(failureOption).toBeDefined();
      expect(failureOption?.label).toBe('P(Failure)');
    });

    it('should include fatigue_life_cycles metric', () => {
      const options = getXAxisOptions();
      const fatigueOption = options.find((opt) => opt.value === 'fatigue_life_cycles');

      expect(fatigueOption).toBeDefined();
      expect(fatigueOption?.label).toBe('Fatigue Life (cycles)');
    });

    it('should include permeation_rate metric', () => {
      const options = getXAxisOptions();
      const permeationOption = options.find((opt) => opt.value === 'permeation_rate');

      expect(permeationOption).toBeDefined();
      expect(permeationOption?.label).toBe('Permeation Rate');
    });

    it('should return 5 metrics for X-axis', () => {
      const options = getXAxisOptions();

      expect(options.length).toBe(5);
    });

    it('should not return undefined or null values', () => {
      const options = getXAxisOptions();

      options.forEach((option) => {
        expect(option.value).toBeDefined();
        expect(option.label).toBeDefined();
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
      });
    });

    it('should have consistent option structure', () => {
      const options = getXAxisOptions();

      options.forEach((option) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(Object.keys(option).length).toBe(2);
      });
    });
  });

  describe('getYAxisOptions - Y-Axis Metric Options', () => {
    it('should return array of metric options', () => {
      const options = getYAxisOptions();

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it('should include cost_eur metric with formatted label', () => {
      const options = getYAxisOptions();
      const costOption = options.find((opt) => opt.value === 'cost_eur');

      expect(costOption).toBeDefined();
      expect(currencyUtils.formatCurrencyLabel).toHaveBeenCalledWith('Cost');
    });

    it('should include weight_kg metric', () => {
      const options = getYAxisOptions();
      const weightOption = options.find((opt) => opt.value === 'weight_kg');

      expect(weightOption).toBeDefined();
      expect(weightOption?.label).toBe('Weight (kg)');
    });

    it('should include burst_pressure_bar metric', () => {
      const options = getYAxisOptions();
      const burstPressureOption = options.find((opt) => opt.value === 'burst_pressure_bar');

      expect(burstPressureOption).toBeDefined();
      expect(burstPressureOption?.label).toBe('Burst Pressure (bar)');
    });

    it('should include burst_ratio metric', () => {
      const options = getYAxisOptions();
      const burstRatioOption = options.find((opt) => opt.value === 'burst_ratio');

      expect(burstRatioOption).toBeDefined();
      expect(burstRatioOption?.label).toBe('Burst Ratio');
    });

    it('should include p_failure metric', () => {
      const options = getYAxisOptions();
      const failureOption = options.find((opt) => opt.value === 'p_failure');

      expect(failureOption).toBeDefined();
      expect(failureOption?.label).toBe('P(Failure)');
    });

    it('should include volumetric_efficiency metric', () => {
      const options = getYAxisOptions();
      const efficiencyOption = options.find((opt) => opt.value === 'volumetric_efficiency');

      expect(efficiencyOption).toBeDefined();
      expect(efficiencyOption?.label).toBe('Vol. Efficiency');
    });

    it('should return 6 metrics for Y-axis', () => {
      const options = getYAxisOptions();

      expect(options.length).toBe(6);
    });

    it('should not return undefined or null values', () => {
      const options = getYAxisOptions();

      options.forEach((option) => {
        expect(option.value).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });
  });

  describe('Backward Compatibility - Static Exports', () => {
    it('should export static X_AXIS_OPTIONS', () => {
      expect(X_AXIS_OPTIONS).toBeDefined();
      expect(Array.isArray(X_AXIS_OPTIONS)).toBe(true);
    });

    it('should export static Y_AXIS_OPTIONS', () => {
      expect(Y_AXIS_OPTIONS).toBeDefined();
      expect(Array.isArray(Y_AXIS_OPTIONS)).toBe(true);
    });

    it('should have same structure as function returns', () => {
      const xFromFunction = getXAxisOptions();
      const yFromFunction = getYAxisOptions();

      expect(X_AXIS_OPTIONS.length).toBe(xFromFunction.length);
      expect(Y_AXIS_OPTIONS.length).toBe(yFromFunction.length);
    });
  });

  // ============================================================================
  // CATEGORY COLOR TESTS
  // ============================================================================

  describe('CATEGORY_COLORS - Color Token Configuration', () => {
    it('should define all trade-off categories', () => {
      expect(CATEGORY_COLORS).toHaveProperty('lightest');
      expect(CATEGORY_COLORS).toHaveProperty('balanced');
      expect(CATEGORY_COLORS).toHaveProperty('recommended');
      expect(CATEGORY_COLORS).toHaveProperty('conservative');
      expect(CATEGORY_COLORS).toHaveProperty('max_margin');
      expect(CATEGORY_COLORS).toHaveProperty('default');
    });

    it('should have complete color properties for each category', () => {
      Object.values(CATEGORY_COLORS).forEach((colors) => {
        expect(colors).toHaveProperty('bg');
        expect(colors).toHaveProperty('text');
        expect(colors).toHaveProperty('dot');
      });
    });

    it('should have valid hex color codes', () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;

      Object.values(CATEGORY_COLORS).forEach((colors) => {
        expect(colors.bg).toMatch(hexRegex);
        expect(colors.text).toMatch(hexRegex);
        expect(colors.dot).toMatch(hexRegex);
      });
    });

    it('should define lightest category colors', () => {
      const lightest = CATEGORY_COLORS.lightest;

      expect(lightest.bg).toBe('#D1FAE5');
      expect(lightest.text).toBe('#065F46');
      expect(lightest.dot).toBe('#10B981');
    });

    it('should define balanced category colors', () => {
      const balanced = CATEGORY_COLORS.balanced;

      expect(balanced.bg).toBe('#CFFAFE');
      expect(balanced.text).toBe('#155E75');
      expect(balanced.dot).toBe('#06B6D4');
    });

    it('should define recommended category colors', () => {
      const recommended = CATEGORY_COLORS.recommended;

      expect(recommended.bg).toBe('#EDE9FE');
      expect(recommended.text).toBe('#5B21B6');
      expect(recommended.dot).toBe('#8B5CF6');
    });

    it('should define conservative category colors', () => {
      const conservative = CATEGORY_COLORS.conservative;

      expect(conservative.bg).toBe('#F1F5F9');
      expect(conservative.text).toBe('#334155');
      expect(conservative.dot).toBe('#64748B');
    });

    it('should define max_margin category colors', () => {
      const maxMargin = CATEGORY_COLORS.max_margin;

      expect(maxMargin.bg).toBe('#F3E8FF');
      expect(maxMargin.text).toBe('#6B21A8');
      expect(maxMargin.dot).toBe('#A855F7');
    });

    it('should define default category colors', () => {
      const defaultColors = CATEGORY_COLORS.default;

      expect(defaultColors.bg).toBe('#F3F4F6');
      expect(defaultColors.text).toBe('#374151');
      expect(defaultColors.dot).toBe('#9CA3AF');
    });

    it('should be immutable (readonly)', () => {
      expect(() => {
        (CATEGORY_COLORS as Record<string, unknown>).newCategory = { bg: '#000', text: '#FFF', dot: '#FFF' };
      }).toThrow();
    });
  });

  describe('getCategoryColors - Category Color Selection', () => {
    it('should return colors for lightest category', () => {
      const colors = getCategoryColors('lightest');

      expect(colors).toBe(CATEGORY_COLORS.lightest);
      expect(colors.bg).toBe('#D1FAE5');
    });

    it('should return colors for balanced category', () => {
      const colors = getCategoryColors('balanced');

      expect(colors).toBe(CATEGORY_COLORS.balanced);
      expect(colors.dot).toBe('#06B6D4');
    });

    it('should return colors for recommended category', () => {
      const colors = getCategoryColors('recommended');

      expect(colors).toBe(CATEGORY_COLORS.recommended);
      expect(colors.text).toBe('#5B21B6');
    });

    it('should return default colors for undefined category', () => {
      const colors = getCategoryColors(undefined);

      expect(colors).toBe(CATEGORY_COLORS.default);
    });

    it('should return default colors for invalid category', () => {
      const colors = getCategoryColors('invalid-category');

      expect(colors).toBe(CATEGORY_COLORS.default);
    });

    it('should return default colors for null category string', () => {
      const colors = getCategoryColors(null as unknown as string | undefined);

      expect(colors).toBe(CATEGORY_COLORS.default);
    });

    it('should return default colors for empty string', () => {
      const colors = getCategoryColors('');

      expect(colors).toBe(CATEGORY_COLORS.default);
    });

    it('should handle case-sensitive category names', () => {
      const colors = getCategoryColors('LIGHTEST');

      // Should return default since category names are case-sensitive
      expect(colors).toBe(CATEGORY_COLORS.default);
    });

    it('should return all category color sets correctly', () => {
      const categories: Array<keyof typeof CATEGORY_COLORS> = [
        'lightest',
        'balanced',
        'recommended',
        'conservative',
        'max_margin',
        'default',
      ];

      categories.forEach((category) => {
        const colors = getCategoryColors(category);
        expect(colors).toBe(CATEGORY_COLORS[category]);
      });
    });
  });

  // ============================================================================
  // LABEL FORMATTING TESTS
  // ============================================================================

  describe('formatCategoryLabel - Category Label Formatting', () => {
    it('should replace underscores with spaces', () => {
      const label = formatCategoryLabel('max_margin');

      expect(label).toBe('max margin');
    });

    it('should replace multiple underscores', () => {
      const label = formatCategoryLabel('very_long_category_name');

      expect(label).toBe('very long category name');
    });

    it('should handle single word categories', () => {
      const label = formatCategoryLabel('lightest');

      expect(label).toBe('lightest');
    });

    it('should return "Unknown" for undefined category', () => {
      const label = formatCategoryLabel(undefined);

      expect(label).toBe('Unknown');
    });

    it('should return "Unknown" for null category', () => {
      const label = formatCategoryLabel(null as unknown as string | undefined);

      expect(label).toBe('Unknown');
    });

    it('should return "Unknown" for empty string', () => {
      const label = formatCategoryLabel('');

      expect(label).toBe('Unknown');
    });

    it('should not affect already formatted labels', () => {
      const label = formatCategoryLabel('lightest');

      expect(label).toEqual('lightest');
    });

    it('should preserve case of letters', () => {
      const label = formatCategoryLabel('Max_Margin');

      expect(label).toBe('Max Margin');
    });

    it('should format all standard category names', () => {
      const categories = ['lightest', 'balanced', 'recommended', 'conservative', 'max_margin'];

      categories.forEach((cat) => {
        const label = formatCategoryLabel(cat);
        expect(label).not.toContain('_');
      });
    });
  });

  // ============================================================================
  // PARETO DESIGN VALIDATION TESTS
  // ============================================================================

  describe('isValidParetoDesign - Design Validation', () => {
    const createValidDesign = (overrides?: Partial<ParetoDesign>): Partial<ParetoDesign> => ({
      id: 'design-001',
      weight_kg: 100,
      cost_eur: 5000,
      burst_pressure_bar: 350,
      burst_ratio: 2.5,
      p_failure: 0.001,
      fatigue_life_cycles: 1000000,
      permeation_rate: 0.05,
      volumetric_efficiency: 0.85,
      ...overrides,
    });

    it('should validate complete and valid design', () => {
      const design = createValidDesign();

      expect(isValidParetoDesign(design)).toBe(true);
    });

    it('should require id field', () => {
      const design = createValidDesign({ id: undefined });

      expect(isValidParetoDesign(design)).toBe(false);
    });

    it('should require id to be string', () => {
      const design = createValidDesign({ id: 12345 as unknown as string });

      expect(isValidParetoDesign(design)).toBe(false);
    });

    it('should require weight_kg field', () => {
      const design = createValidDesign({ weight_kg: undefined });

      expect(isValidParetoDesign(design)).toBe(false);
    });

    it('should require weight_kg to be number', () => {
      const design = createValidDesign({ weight_kg: '100' as unknown as number });

      expect(isValidParetoDesign(design)).toBe(false);
    });

    it('should require cost_eur field', () => {
      const design = createValidDesign({ cost_eur: undefined });

      expect(isValidParetoDesign(design)).toBe(false);
    });

    it('should require cost_eur to be number', () => {
      const design = createValidDesign({ cost_eur: '5000' as unknown as number });

      expect(isValidParetoDesign(design)).toBe(false);
    });

    it('should require burst_pressure_bar field', () => {
      const design = createValidDesign({ burst_pressure_bar: undefined });

      expect(isValidParetoDesign(design)).toBe(false);
    });

    it('should require burst_pressure_bar to be number', () => {
      const design = createValidDesign({ burst_pressure_bar: '350' as unknown as number });

      expect(isValidParetoDesign(design)).toBe(false);
    });

    it('should not require optional trade_off_category field', () => {
      const design = createValidDesign({ trade_off_category: undefined });

      expect(isValidParetoDesign(design)).toBe(true);
    });

    it('should allow optional fields to be present', () => {
      const design = createValidDesign({
        trade_off_category: 'recommended',
        recommendation_reason: 'Best overall balance',
      });

      expect(isValidParetoDesign(design)).toBe(true);
    });

    it('should validate designs with zero weight', () => {
      const design = createValidDesign({ weight_kg: 0 });

      expect(isValidParetoDesign(design)).toBe(true);
    });

    it('should validate designs with large weight values', () => {
      const design = createValidDesign({ weight_kg: 999999 });

      expect(isValidParetoDesign(design)).toBe(true);
    });

    it('should validate designs with very low cost', () => {
      const design = createValidDesign({ cost_eur: 0.01 });

      expect(isValidParetoDesign(design)).toBe(true);
    });

    it('should validate designs with negative cost (edge case)', () => {
      const design = createValidDesign({ cost_eur: -100 });

      expect(isValidParetoDesign(design)).toBe(true);
    });

    it('should not validate empty object', () => {
      expect(isValidParetoDesign({})).toBe(false);
    });

    it('should not validate null', () => {
      expect(isValidParetoDesign(null as Partial<ParetoDesign> | null | undefined)).toBe(false);
    });

    it('should require all three critical fields', () => {
      const designWithOnlyId = { id: 'design-001' };
      expect(isValidParetoDesign(designWithOnlyId)).toBe(false);

      const designWithIdAndWeight = {
        id: 'design-001',
        weight_kg: 100,
      };
      expect(isValidParetoDesign(designWithIdAndWeight)).toBe(false);

      const designWithIdWeightAndCost = {
        id: 'design-001',
        weight_kg: 100,
        cost_eur: 5000,
      };
      expect(isValidParetoDesign(designWithIdWeightAndCost)).toBe(false);
    });
  });

  // ============================================================================
  // LEGEND ITEMS TESTS
  // ============================================================================

  describe('LEGEND_ITEMS - Legend Configuration', () => {
    it('should export legend items array', () => {
      expect(Array.isArray(LEGEND_ITEMS)).toBe(true);
      expect(LEGEND_ITEMS.length).toBeGreaterThan(0);
    });

    it('should include lightest legend item', () => {
      const item = LEGEND_ITEMS.find((l) => l.category === 'lightest');

      expect(item).toBeDefined();
      expect(item?.label).toBe('Lightest');
      expect(item?.color).toBe(CATEGORY_COLORS.lightest.dot);
    });

    it('should include balanced legend item', () => {
      const item = LEGEND_ITEMS.find((l) => l.category === 'balanced');

      expect(item).toBeDefined();
      expect(item?.label).toBe('Balanced');
      expect(item?.color).toBe(CATEGORY_COLORS.balanced.dot);
    });

    it('should include recommended legend item', () => {
      const item = LEGEND_ITEMS.find((l) => l.category === 'recommended');

      expect(item).toBeDefined();
      expect(item?.label).toBe('Recommended');
      expect(item?.color).toBe(CATEGORY_COLORS.recommended.dot);
    });

    it('should include conservative legend item', () => {
      const item = LEGEND_ITEMS.find((l) => l.category === 'conservative');

      expect(item).toBeDefined();
      expect(item?.label).toBe('Conservative');
      expect(item?.color).toBe(CATEGORY_COLORS.conservative.dot);
    });

    it('should include max_margin legend item', () => {
      const item = LEGEND_ITEMS.find((l) => l.category === 'max_margin');

      expect(item).toBeDefined();
      expect(item?.label).toBe('Max Margin');
      expect(item?.color).toBe(CATEGORY_COLORS.max_margin.dot);
    });

    it('should include selected legend item', () => {
      const item = LEGEND_ITEMS.find((l) => l.category === 'selected');

      expect(item).toBeDefined();
      expect(item?.label).toBe('Selected');
      expect(item?.color).toBe('#3B82F6');
    });

    it('should have all legend items with valid colors', () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;

      LEGEND_ITEMS.forEach((item) => {
        expect(item.color).toMatch(hexRegex);
      });
    });

    it('should have consistent legend item structure', () => {
      LEGEND_ITEMS.forEach((item) => {
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('color');
        expect(typeof item.category).toBe('string');
        expect(typeof item.label).toBe('string');
        expect(typeof item.color).toBe('string');
      });
    });
  });

  // ============================================================================
  // HIGHLIGHTED DESIGNS TESTS
  // ============================================================================

  describe('extractHighlightedDesigns - Design Highlighting', () => {
    const createDesign = (overrides?: Partial<ParetoDesign>): ParetoDesign => ({
      id: 'design-001',
      weight_kg: 100,
      cost_eur: 5000,
      burst_pressure_bar: 350,
      burst_ratio: 2.5,
      p_failure: 0.001,
      fatigue_life_cycles: 1000000,
      permeation_rate: 0.05,
      volumetric_efficiency: 0.85,
      ...overrides,
    });

    it('should return empty array for empty designs list', () => {
      const highlighted = extractHighlightedDesigns([]);

      expect(highlighted).toEqual([]);
    });

    it('should filter designs with trade_off_category', () => {
      const designs = [
        createDesign({ id: 'design-1' }),
        createDesign({ id: 'design-2', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-3' }),
        createDesign({ id: 'design-4', trade_off_category: 'recommended' }),
      ];

      const highlighted = extractHighlightedDesigns(designs);

      expect(highlighted.length).toBe(2);
      expect(highlighted[0].id).toBe('design-2');
      expect(highlighted[1].id).toBe('design-4');
    });

    it('should return only designs with category defined', () => {
      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-2' }),
        createDesign({ id: 'design-3', trade_off_category: 'balanced' }),
      ];

      const highlighted = extractHighlightedDesigns(designs);

      expect(highlighted).toHaveLength(2);
      highlighted.forEach((design) => {
        expect(design.trade_off_category).toBeDefined();
      });
    });

    it('should preserve design order', () => {
      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-2', trade_off_category: 'balanced' }),
        createDesign({ id: 'design-3', trade_off_category: 'recommended' }),
      ];

      const highlighted = extractHighlightedDesigns(designs);

      expect(highlighted[0].id).toBe('design-1');
      expect(highlighted[1].id).toBe('design-2');
      expect(highlighted[2].id).toBe('design-3');
    });

    it('should include all trade-off categories', () => {
      const categories: Array<'lightest' | 'cheapest' | 'recommended' | 'most_reliable' | 'balanced' | 'conservative' | 'max_margin'> = [
        'lightest',
        'cheapest',
        'recommended',
        'most_reliable',
        'balanced',
        'conservative',
        'max_margin',
      ];

      const designs = categories.map((cat, idx) =>
        createDesign({ id: `design-${idx}`, trade_off_category: cat })
      );

      const highlighted = extractHighlightedDesigns(designs);

      expect(highlighted).toHaveLength(categories.length);
    });

    it('should handle large design lists', () => {
      const designs: ParetoDesign[] = [];
      for (let i = 0; i < 1000; i++) {
        if (i % 10 === 0) {
          designs.push(createDesign({ id: `design-${i}`, trade_off_category: 'lightest' }));
        } else {
          designs.push(createDesign({ id: `design-${i}` }));
        }
      }

      const highlighted = extractHighlightedDesigns(designs);

      expect(highlighted.length).toBe(100);
    });

    it('should not modify original designs array', () => {
      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-2' }),
      ];

      const originalLength = designs.length;
      extractHighlightedDesigns(designs);

      expect(designs.length).toBe(originalLength);
    });
  });

  // ============================================================================
  // RECOMMENDED DESIGN TESTS
  // ============================================================================

  describe('findRecommendedDesign - Recommended Design Selection', () => {
    const createDesign = (overrides?: Partial<ParetoDesign>): ParetoDesign => ({
      id: 'design-001',
      weight_kg: 100,
      cost_eur: 5000,
      burst_pressure_bar: 350,
      burst_ratio: 2.5,
      p_failure: 0.001,
      fatigue_life_cycles: 1000000,
      permeation_rate: 0.05,
      volumetric_efficiency: 0.85,
      ...overrides,
    });

    it('should find design with recommended category', () => {
      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-2', trade_off_category: 'recommended' }),
        createDesign({ id: 'design-3', trade_off_category: 'balanced' }),
      ];

      const recommended = findRecommendedDesign(designs);

      expect(recommended?.id).toBe('design-2');
    });

    it('should return undefined when no recommended design exists', () => {
      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-2', trade_off_category: 'balanced' }),
      ];

      const recommended = findRecommendedDesign(designs);

      expect(recommended).toBeUndefined();
    });

    it('should return undefined for empty designs list', () => {
      const recommended = findRecommendedDesign([]);

      expect(recommended).toBeUndefined();
    });

    it('should return first recommended design if multiple exist', () => {
      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'recommended' }),
        createDesign({ id: 'design-2', trade_off_category: 'recommended' }),
      ];

      const recommended = findRecommendedDesign(designs);

      expect(recommended?.id).toBe('design-1');
    });

    it('should only find exact "recommended" category', () => {
      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-2', trade_off_category: 'balanced' }),
        createDesign({ id: 'design-3', trade_off_category: 'recommended' }),
      ];

      const recommended = findRecommendedDesign(designs);

      expect(recommended?.trade_off_category).toBe('recommended');
    });

    it('should preserve all design properties in result', () => {
      const designProperties = {
        id: 'recommended-design',
        trade_off_category: 'recommended' as const,
        weight_kg: 150,
        cost_eur: 7500,
        burst_pressure_bar: 400,
        burst_ratio: 3.0,
        p_failure: 0.0005,
        fatigue_life_cycles: 2000000,
        permeation_rate: 0.03,
        volumetric_efficiency: 0.90,
        recommendation_reason: 'Best overall balance',
      };

      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign(designProperties),
        createDesign({ id: 'design-3', trade_off_category: 'balanced' }),
      ];

      const recommended = findRecommendedDesign(designs);

      expect(recommended?.id).toBe('recommended-design');
      expect(recommended?.weight_kg).toBe(150);
      expect(recommended?.recommendation_reason).toBe('Best overall balance');
    });

    it('should handle designs without category field', () => {
      const designs = [
        createDesign({ id: 'design-1' }),
        createDesign({ id: 'design-2', trade_off_category: 'recommended' }),
      ];

      const recommended = findRecommendedDesign(designs);

      expect(recommended?.id).toBe('design-2');
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests - Complete Workflows', () => {
    const createDesign = (overrides?: Partial<ParetoDesign>): ParetoDesign => ({
      id: 'design-001',
      weight_kg: 100,
      cost_eur: 5000,
      burst_pressure_bar: 350,
      burst_ratio: 2.5,
      p_failure: 0.001,
      fatigue_life_cycles: 1000000,
      permeation_rate: 0.05,
      volumetric_efficiency: 0.85,
      ...overrides,
    });

    it('should validate and highlight designs together', () => {
      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-2' }),
        createDesign({ id: 'design-3', trade_off_category: 'recommended' }),
      ];

      const allValid = designs.every(isValidParetoDesign);
      const highlighted = extractHighlightedDesigns(designs);

      expect(allValid).toBe(true);
      expect(highlighted).toHaveLength(2);
    });

    it('should find recommended design and get its colors', () => {
      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-2', trade_off_category: 'recommended' }),
      ];

      const recommended = findRecommendedDesign(designs);
      const colors = getCategoryColors(recommended?.trade_off_category);

      expect(colors).toBe(CATEGORY_COLORS.recommended);
    });

    it('should build chart data with axis options and colors', () => {
      const xOptions = getXAxisOptions();
      const yOptions = getYAxisOptions();
      const legendItems = LEGEND_ITEMS;

      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-2', trade_off_category: 'recommended' }),
      ];

      expect(xOptions.length).toBeGreaterThan(0);
      expect(yOptions.length).toBeGreaterThan(0);
      expect(legendItems.length).toBeGreaterThan(0);

      designs.forEach((design) => {
        if (design.trade_off_category) {
          const colors = getCategoryColors(design.trade_off_category);
          expect(colors).toBeDefined();
        }
      });
    });

    it('should handle complete pareto chart configuration', () => {
      const configs = {
        xAxisOptions: getXAxisOptions(),
        yAxisOptions: getYAxisOptions(),
        categoryColors: CATEGORY_COLORS,
        legendItems: LEGEND_ITEMS,
      };

      const designs = [
        createDesign({ id: 'design-1', trade_off_category: 'lightest' }),
        createDesign({ id: 'design-2', trade_off_category: 'balanced' }),
        createDesign({ id: 'design-3', trade_off_category: 'recommended' }),
      ];

      const highlighted = extractHighlightedDesigns(designs);
      const recommended = findRecommendedDesign(designs);

      expect(configs.xAxisOptions.length).toBe(5);
      expect(configs.yAxisOptions.length).toBe(6);
      expect(configs.legendItems.length).toBe(6);
      expect(highlighted).toHaveLength(3);
      expect(recommended?.trade_off_category).toBe('recommended');
    });
  });

  // ============================================================================
  // EDGE CASES AND BOUNDARY TESTS
  // ============================================================================

  describe('Edge Cases - Boundary Conditions', () => {
    it('should handle metric options consistency across calls', () => {
      const options1 = getXAxisOptions();
      const options2 = getXAxisOptions();

      expect(options1).toEqual(options2);
    });

    it('should handle very large pareto design lists', () => {
      const designs: ParetoDesign[] = [];
      for (let i = 0; i < 10000; i++) {
        designs.push({
          id: `design-${i}`,
          weight_kg: Math.random() * 500,
          cost_eur: Math.random() * 100000,
          burst_pressure_bar: 200 + Math.random() * 300,
          burst_ratio: 1 + Math.random() * 5,
          p_failure: Math.random() * 0.1,
          fatigue_life_cycles: Math.random() * 5000000,
          permeation_rate: Math.random() * 0.2,
          volumetric_efficiency: Math.random() * 1.0,
          trade_off_category: i % 100 === 0 ? 'recommended' : undefined,
        });
      }

      const highlighted = extractHighlightedDesigns(designs);
      const recommended = findRecommendedDesign(designs);

      expect(highlighted.length).toBeGreaterThan(0);
      expect(recommended).toBeDefined();
    });

    it('should handle category with very long names', () => {
      const longCategory = 'this_is_a_very_long_category_name_with_many_parts';
      const label = formatCategoryLabel(longCategory);

      expect(label).not.toContain('_');
      expect(label.split(' ').length).toBeGreaterThan(1);
    });

    it('should handle metric options with special characters', () => {
      const options = getXAxisOptions();

      options.forEach((option) => {
        expect(option.value).toBeTruthy();
        expect(option.label).toBeTruthy();
      });
    });

    it('should handle design validation with extreme values', () => {
      const extremeDesigns = [
        { id: 'extreme-1', weight_kg: 0.00001, cost_eur: 0.01, burst_pressure_bar: 1 },
        { id: 'extreme-2', weight_kg: 999999999, cost_eur: 999999999, burst_pressure_bar: 999999 },
        { id: 'extreme-3', weight_kg: -1, cost_eur: -1, burst_pressure_bar: -1 },
      ];

      extremeDesigns.forEach((design) => {
        const valid = isValidParetoDesign(design as Partial<ParetoDesign>);
        expect(typeof valid).toBe('boolean');
      });
    });
  });
});
