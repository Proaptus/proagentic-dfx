/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
/**
 * Utility Functions Tests
 * Tests for comparison.ts and currency.ts utility functions
 * Using fail-first TDD approach - all tests fail initially before implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateDifferenceIndicator,
  formatMetricValue,
  getComparisonMetrics,
  COMPARISON_METRICS,
} from '@/lib/utils/comparison';
import {
  formatCurrency,
  getCurrencySymbol,
  formatCurrencyLabel,
  getCurrencyOptions,
  getStoredCurrency,
  setStoredCurrency,
  getCurrencyConfig,
  CURRENCIES,
  DEFAULT_CURRENCY,
  type CurrencyCode,
} from '@/lib/utils/currency';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Comparison Utilities', () => {
  describe('calculateDifferenceIndicator', () => {
    it('FAIL: should identify best metric when lower is better', () => {
      const values = [100, 200, 300];
      const result = calculateDifferenceIndicator('weight', 100, values);

      expect(result.isBest).toBe(true);
      expect(result.isLowerIsBetter).toBe(true);
    });

    it('FAIL: should identify best metric when higher is better', () => {
      const values = [100, 200, 300];
      const result = calculateDifferenceIndicator('burst_pressure', 300, values);

      expect(result.isBest).toBe(true);
      expect(result.isLowerIsBetter).toBe(false);
    });

    it('FAIL: should calculate average for comparison', () => {
      const values = [100, 200, 300];
      const result = calculateDifferenceIndicator('weight', 150, values);

      expect(result.isAboveAverage).toBe(true); // 150 < 200 avg, which is good for lower-is-better
      expect(result.isBest).toBe(false);
    });

    it('FAIL: should detect cost as lower-is-better metric', () => {
      const values = [1000, 1500, 2000];
      const result = calculateDifferenceIndicator('cost', 1500, values);

      expect(result.isLowerIsBetter).toBe(true);
    });

    it('FAIL: should detect weight as lower-is-better metric', () => {
      const values = [40, 45, 50];
      const result = calculateDifferenceIndicator('weight', 45, values);

      expect(result.isLowerIsBetter).toBe(true);
    });

    it('FAIL: should detect burst_pressure as higher-is-better metric', () => {
      const values = [1500, 1700, 1800];
      const result = calculateDifferenceIndicator('burst_pressure_bar', 1700, values);

      expect(result.isLowerIsBetter).toBe(false);
    });

    it('FAIL: should mark above average for higher-is-better metrics', () => {
      const values = [1500, 1700, 1900];
      const result = calculateDifferenceIndicator('pressure', 1800, values);

      expect(result.isAboveAverage).toBe(true);
    });

    it('FAIL: should mark below average for higher-is-better metrics', () => {
      const values = [1500, 1700, 1900];
      const result = calculateDifferenceIndicator('pressure', 1600, values);

      expect(result.isAboveAverage).toBe(false);
    });

    it('FAIL: should handle single value array', () => {
      const values = [1500];
      const result = calculateDifferenceIndicator('weight', 1500, values);

      expect(result.isBest).toBe(true);
    });

    it('FAIL: should handle identical values', () => {
      const values = [1500, 1500, 1500];
      const result = calculateDifferenceIndicator('cost', 1500, values);

      expect(result.isBest).toBe(true);
    });

    it('FAIL: should handle negative values', () => {
      const values = [-100, -50, 0];
      const result = calculateDifferenceIndicator('metric', -100, values);

      expect(result.isBest).toBe(true);
    });

    it('FAIL: should be case insensitive for metric key', () => {
      const values = [100, 200, 300];
      const result1 = calculateDifferenceIndicator('Weight', 100, values);
      const result2 = calculateDifferenceIndicator('WEIGHT', 100, values);

      expect(result1.isLowerIsBetter).toBe(result2.isLowerIsBetter);
    });
  });

  describe('formatMetricValue', () => {
    it('FAIL: should return string values unchanged', () => {
      const result = formatMetricValue('test_string', 'anyKey');
      expect(result).toBe('test_string');
    });

    it('FAIL: should format p_failure as exponential notation', () => {
      const result = formatMetricValue(0.000123, 'p_failure');
      expect(result).toMatch(/e/i);
    });

    it('FAIL: should use 2 decimal places for exponential notation', () => {
      const result = formatMetricValue(0.000123, 'p_failure');
      expect(result).toMatch(/\d\.\d{2}e/i);
    });

    it('FAIL: should format regular numbers with locale', () => {
      const result = formatMetricValue(1500, 'weight');
      expect(result).toContain('1');
      expect(result).toContain('500');
    });

    it('FAIL: should format large numbers with thousands separator', () => {
      const result = formatMetricValue(1000000, 'metric');
      expect(result).toMatch(/[,.\s]/); // Locale separator
    });

    it('FAIL: should handle zero', () => {
      const result = formatMetricValue(0, 'weight');
      expect(result).toBe('0');
    });

    it('FAIL: should handle very small numbers', () => {
      const result = formatMetricValue(0.0001, 'p_failure');
      expect(result).toMatch(/e/i);
    });

    it('FAIL: should be case insensitive for metric key', () => {
      const result1 = formatMetricValue(0.000123, 'P_Failure');
      const result2 = formatMetricValue(0.000123, 'P_FAILURE');
      expect(result1).toMatch(/e/i);
      expect(result2).toMatch(/e/i);
    });
  });

  describe('getComparisonMetrics', () => {
    it('FAIL: should return array of metrics', () => {
      const metrics = getComparisonMetrics();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('FAIL: should include weight metric', () => {
      const metrics = getComparisonMetrics();
      const weight = metrics.find(m => m.key === 'weight_kg');
      expect(weight).toBeDefined();
      expect(weight?.label).toBe('Weight');
    });

    it('FAIL: should include cost metric', () => {
      const metrics = getComparisonMetrics();
      const cost = metrics.find(m => m.key === 'cost_eur');
      expect(cost).toBeDefined();
      expect(cost?.label).toBe('Cost');
    });

    it('FAIL: should include burst pressure metric', () => {
      const metrics = getComparisonMetrics();
      const pressure = metrics.find(m => m.key === 'burst_pressure_bar');
      expect(pressure).toBeDefined();
      expect(pressure?.label).toBe('Burst Pressure');
    });

    it('FAIL: should include stress margin metric', () => {
      const metrics = getComparisonMetrics();
      const margin = metrics.find(m => m.key === 'stress_margin_percent');
      expect(margin).toBeDefined();
    });

    it('FAIL: should have correct units', () => {
      const metrics = getComparisonMetrics();
      expect(metrics.find(m => m.key === 'weight_kg')?.unit).toBe('kg');
      expect(metrics.find(m => m.key === 'burst_pressure_bar')?.unit).toBe('bar');
    });

    it('FAIL: should mark weight and cost as lower-is-better', () => {
      const metrics = getComparisonMetrics();
      const weight = metrics.find(m => m.key === 'weight_kg');
      const cost = metrics.find(m => m.key === 'cost_eur');

      expect(weight?.lowerIsBetter).toBe(true);
      expect(cost?.lowerIsBetter).toBe(true);
    });

    it('FAIL: should mark pressure and margin as higher-is-better', () => {
      const metrics = getComparisonMetrics();
      const pressure = metrics.find(m => m.key === 'burst_pressure_bar');
      const margin = metrics.find(m => m.key === 'stress_margin_percent');

      expect(pressure?.lowerIsBetter).toBe(false);
      expect(margin?.lowerIsBetter).toBe(false);
    });

    it('FAIL: should include currency symbol in cost unit', () => {
      const metrics = getComparisonMetrics();
      const cost = metrics.find(m => m.key === 'cost_eur');
      expect(cost?.unit).toBeDefined();
      expect(cost?.unit).toMatch(/£|€|\$/);
    });
  });
});

describe('Currency Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getCurrencyConfig', () => {
    it('FAIL: should return GBP config by default', () => {
      const config = getCurrencyConfig();
      expect(config.code).toBe('GBP');
      expect(config.symbol).toBe('£');
    });

    it('FAIL: should return EUR config when requested', () => {
      const config = getCurrencyConfig('EUR');
      expect(config.code).toBe('EUR');
      expect(config.symbol).toBe('€');
    });

    it('FAIL: should return USD config when requested', () => {
      const config = getCurrencyConfig('USD');
      expect(config.code).toBe('USD');
      expect(config.symbol).toBe('$');
    });

    it('FAIL: should include locale for each currency', () => {
      const gbp = getCurrencyConfig('GBP');
      const eur = getCurrencyConfig('EUR');
      const usd = getCurrencyConfig('USD');

      expect(gbp.locale).toBe('en-GB');
      expect(eur.locale).toBe('de-DE');
      expect(usd.locale).toBe('en-US');
    });

    it('FAIL: should include position for each currency', () => {
      const gbp = getCurrencyConfig('GBP');
      const eur = getCurrencyConfig('EUR');

      expect(['before', 'after']).toContain(gbp.position);
      expect(['before', 'after']).toContain(eur.position);
    });

    it('FAIL: should include full name for each currency', () => {
      const gbp = getCurrencyConfig('GBP');
      expect(gbp.name).toBe('British Pound Sterling');
    });

    it('FAIL: should fallback to GBP for invalid currency', () => {
      const config = getCurrencyConfig('INVALID' as CurrencyCode);
      expect(config.code).toBe('GBP');
    });
  });

  describe('getStoredCurrency', () => {
    it('FAIL: should return default currency if nothing stored', () => {
      const currency = getStoredCurrency();
      expect(currency).toBe(DEFAULT_CURRENCY);
    });

    it('FAIL: should return stored currency from localStorage', () => {
      localStorage.setItem('h2-tank-currency', 'EUR');
      const currency = getStoredCurrency();
      expect(currency).toBe('EUR');
    });

    it('FAIL: should validate stored currency against CURRENCIES', () => {
      localStorage.setItem('h2-tank-currency', 'INVALID');
      const currency = getStoredCurrency();
      expect(currency).toBe(DEFAULT_CURRENCY);
    });

    it('FAIL: should handle server-side rendering (no window)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      const currency = getStoredCurrency();
      expect(currency).toBe(DEFAULT_CURRENCY);

      global.window = originalWindow;
    });
  });

  describe('setStoredCurrency', () => {
    it('FAIL: should store currency in localStorage', () => {
      setStoredCurrency('EUR');
      expect(localStorage.getItem('h2-tank-currency')).toBe('EUR');
    });

    it('FAIL: should persist across getStoredCurrency calls', () => {
      setStoredCurrency('USD');
      const currency = getStoredCurrency();
      expect(currency).toBe('USD');
    });

    it('FAIL: should handle server-side rendering gracefully', () => {
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      expect(() => setStoredCurrency('EUR')).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('formatCurrency', () => {
    it('FAIL: should format number with default GBP', () => {
      const result = formatCurrency(1250);
      expect(result).toContain('1');
      expect(result).toContain('250');
    });

    it('FAIL: should format with £ symbol for GBP', () => {
      const result = formatCurrency(1250, 'GBP');
      expect(result).toContain('£');
    });

    it('FAIL: should format with € symbol for EUR', () => {
      const result = formatCurrency(1250, 'EUR');
      expect(result).toContain('€');
    });

    it('FAIL: should format with $ symbol for USD', () => {
      const result = formatCurrency(1250, 'USD');
      expect(result).toContain('$');
    });

    it('FAIL: should place symbol before value for GBP', () => {
      const result = formatCurrency(1250, 'GBP');
      expect(result).toMatch(/^£/);
    });

    it('FAIL: should use locale-specific number formatting', () => {
      const gbp = formatCurrency(1500.5, 'GBP');
      const usd = formatCurrency(1500.5, 'USD');

      // Both should be valid, format depends on locale
      expect(gbp).toBeTruthy();
      expect(usd).toBeTruthy();
    });

    it('FAIL: should show decimals when requested', () => {
      const result = formatCurrency(1250.50, 'GBP', { showDecimals: true });
      expect(result).toMatch(/\d\.\d{2}/);
    });

    it('FAIL: should not show decimals by default', () => {
      const result = formatCurrency(1250.50, 'GBP');
      // Should round to no decimals (1251 when rounded)
      expect(result).not.toMatch(/\.\d{2}/);
    });

    it('FAIL: should use compact notation for large numbers', () => {
      const result = formatCurrency(1500000, 'GBP', { compact: true });
      expect(result).toContain('M');
    });

    it('FAIL: should show K suffix for thousands in compact mode', () => {
      const result = formatCurrency(1500, 'GBP', { compact: true });
      expect(result).toContain('k');
    });

    it('FAIL: should not use compact for small numbers', () => {
      const result = formatCurrency(500, 'GBP', { compact: true });
      expect(result).toContain('500');
    });

    it('FAIL: should append per-unit suffix when requested', () => {
      const result = formatCurrency(25, 'GBP', { perUnit: 'kg' });
      expect(result).toContain('/kg');
    });

    it('FAIL: should handle zero', () => {
      const result = formatCurrency(0, 'GBP');
      expect(result).toContain('0');
    });

    it('FAIL: should handle negative values', () => {
      const result = formatCurrency(-1250, 'GBP');
      expect(result).toContain('-');
      expect(result).toContain('1');
    });

    it('FAIL: should handle very large numbers', () => {
      const result = formatCurrency(999999999, 'GBP');
      expect(result).toBeTruthy();
    });

    it('FAIL: should handle decimal precision', () => {
      const result = formatCurrency(1234.567, 'GBP', { showDecimals: true });
      expect(result).toMatch(/\.\d{2}$/);
    });
  });

  describe('getCurrencySymbol', () => {
    it('FAIL: should return GBP symbol by default', () => {
      const symbol = getCurrencySymbol();
      expect(symbol).toBe('£');
    });

    it('FAIL: should return EUR symbol when requested', () => {
      const symbol = getCurrencySymbol('EUR');
      expect(symbol).toBe('€');
    });

    it('FAIL: should return USD symbol when requested', () => {
      const symbol = getCurrencySymbol('USD');
      expect(symbol).toBe('$');
    });

    it('FAIL: should use stored currency by default', () => {
      localStorage.setItem('h2-tank-currency', 'EUR');
      const symbol = getCurrencySymbol();
      expect(symbol).toBe('€');
    });
  });

  describe('formatCurrencyLabel', () => {
    it('FAIL: should format label with currency symbol', () => {
      const label = formatCurrencyLabel('Cost', 'GBP');
      expect(label).toContain('Cost');
      expect(label).toContain('£');
    });

    it('FAIL: should include parentheses', () => {
      const label = formatCurrencyLabel('Unit Cost', 'GBP');
      expect(label).toContain('(');
      expect(label).toContain(')');
    });

    it('FAIL: should format as "Label (Symbol)"', () => {
      const label = formatCurrencyLabel('Price', 'EUR');
      expect(label).toMatch(/Price \(€\)/);
    });

    it('FAIL: should use stored currency by default', () => {
      localStorage.setItem('h2-tank-currency', 'USD');
      const label = formatCurrencyLabel('Cost', undefined);
      expect(label).toContain('$');
    });
  });

  describe('getCurrencyOptions', () => {
    it('FAIL: should return array of options', () => {
      const options = getCurrencyOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(3);
    });

    it('FAIL: should include GBP option', () => {
      const options = getCurrencyOptions();
      const gbp = options.find(o => o.value === 'GBP');
      expect(gbp).toBeDefined();
    });

    it('FAIL: should include EUR option', () => {
      const options = getCurrencyOptions();
      const eur = options.find(o => o.value === 'EUR');
      expect(eur).toBeDefined();
    });

    it('FAIL: should include USD option', () => {
      const options = getCurrencyOptions();
      const usd = options.find(o => o.value === 'USD');
      expect(usd).toBeDefined();
    });

    it('FAIL: should have descriptive labels', () => {
      const options = getCurrencyOptions();
      options.forEach(opt => {
        expect(opt.label).toMatch(/£|€|\$/);
        expect(opt.label).toContain(opt.value);
      });
    });

    it('FAIL: should format labels with symbol, code, and name', () => {
      const options = getCurrencyOptions();
      const gbp = options.find(o => o.value === 'GBP');
      expect(gbp?.label).toContain('£');
      expect(gbp?.label).toContain('GBP');
      expect(gbp?.label).toContain('British');
    });
  });

  describe('Currency Constants', () => {
    it('FAIL: should have CURRENCIES object with all codes', () => {
      expect(CURRENCIES.GBP).toBeDefined();
      expect(CURRENCIES.EUR).toBeDefined();
      expect(CURRENCIES.USD).toBeDefined();
    });

    it('FAIL: should have DEFAULT_CURRENCY set to GBP', () => {
      expect(DEFAULT_CURRENCY).toBe('GBP');
    });

    it('FAIL: each currency should have required properties', () => {
      Object.values(CURRENCIES).forEach(currency => {
        expect(currency).toHaveProperty('code');
        expect(currency).toHaveProperty('symbol');
        expect(currency).toHaveProperty('name');
        expect(currency).toHaveProperty('locale');
        expect(currency).toHaveProperty('position');
      });
    });
  });

  describe('Integration Tests', () => {
    it('FAIL: should use stored currency in formatCurrency', () => {
      setStoredCurrency('EUR');
      const result = formatCurrency(1250);
      expect(result).toContain('€');
    });

    it('FAIL: should use stored currency in getCurrencySymbol', () => {
      setStoredCurrency('USD');
      const symbol = getCurrencySymbol();
      expect(symbol).toBe('$');
    });

    it('FAIL: should format complete currency label with stored currency', () => {
      setStoredCurrency('EUR');
      const label = formatCurrencyLabel('Total Cost');
      expect(label).toContain('€');
    });

    it('FAIL: should work with comparison metrics', () => {
      const metrics = getComparisonMetrics();
      const costMetric = metrics.find(m => m.key === 'cost_eur');
      expect(costMetric?.unit).toBeDefined();
      expect(costMetric?.unit).toMatch(/£|€|\$/);
    });
  });

  describe('Edge Cases', () => {
    it('FAIL: should handle fraction of cent', () => {
      const result = formatCurrency(1250.001, 'GBP', { showDecimals: true });
      expect(result).toBeTruthy();
    });

    it('FAIL: should handle very small number', () => {
      const result = formatCurrency(0.01, 'GBP');
      expect(result).toBeTruthy();
    });

    it('FAIL: should handle NaN gracefully', () => {
      const result = formatCurrency(NaN, 'GBP');
      // Should not crash
      expect(typeof result).toBe('string');
    });

    it('FAIL: should handle Infinity gracefully', () => {
      const result = formatCurrency(Infinity, 'GBP');
      // Should not crash
      expect(typeof result).toBe('string');
    });

    it('FAIL: should maintain precision with compact notation', () => {
      const result = formatCurrency(1500000, 'GBP', { compact: true });
      expect(result).toContain('1.5');
    });
  });
});
