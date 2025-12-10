/**
 * Currency utilities for H2 Tank Designer
 * Provides user-configurable currency settings with GBP as default
 */

export type CurrencyCode = 'GBP' | 'EUR' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  position: 'before' | 'after';
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound Sterling',
    locale: 'en-GB',
    position: 'before',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    position: 'before',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    position: 'before',
  },
};

// Default currency is GBP
export const DEFAULT_CURRENCY: CurrencyCode = 'GBP';

// Storage key for persisted currency preference
const CURRENCY_STORAGE_KEY = 'h2-tank-currency';

/**
 * Get the user's preferred currency from localStorage
 */
export function getStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;

  const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (stored && stored in CURRENCIES) {
    return stored as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}

/**
 * Store the user's preferred currency in localStorage
 */
export function setStoredCurrency(currency: CurrencyCode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}

/**
 * Get the currency configuration for a given currency code
 */
export function getCurrencyConfig(code: CurrencyCode = DEFAULT_CURRENCY): CurrencyConfig {
  return CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
}

/**
 * Format a number as currency with the appropriate symbol
 * @param value - The numeric value to format
 * @param currency - The currency code (defaults to user's stored preference or GBP)
 * @param options - Additional formatting options
 */
export function formatCurrency(
  value: number,
  currency?: CurrencyCode,
  options: {
    showDecimals?: boolean;
    compact?: boolean;
    perUnit?: string;
  } = {}
): string {
  const currencyCode = currency || getStoredCurrency();
  const config = getCurrencyConfig(currencyCode);
  const { showDecimals = false, compact = false, perUnit } = options;

  let formattedNumber: string;

  if (compact && Math.abs(value) >= 1000) {
    // Use compact notation for large numbers
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      formattedNumber = `${(value / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      formattedNumber = `${(value / 1000).toFixed(0)}k`;
    } else {
      formattedNumber = value.toLocaleString(config.locale);
    }
  } else if (showDecimals) {
    formattedNumber = value.toLocaleString(config.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formattedNumber = value.toLocaleString(config.locale, {
      maximumFractionDigits: 0,
    });
  }

  // Build the formatted string
  let result: string;
  if (config.position === 'before') {
    result = `${config.symbol}${formattedNumber}`;
  } else {
    result = `${formattedNumber}${config.symbol}`;
  }

  // Add per-unit suffix if specified
  if (perUnit) {
    result += `/${perUnit}`;
  }

  return result;
}

/**
 * Get just the currency symbol
 */
export function getCurrencySymbol(currency?: CurrencyCode): string {
  const currencyCode = currency || getStoredCurrency();
  return getCurrencyConfig(currencyCode).symbol;
}

/**
 * Format a currency label for charts/axes
 * e.g., "Cost (£)" or "Unit Cost (£)"
 */
export function formatCurrencyLabel(label: string, currency?: CurrencyCode): string {
  const symbol = getCurrencySymbol(currency);
  return `${label} (${symbol})`;
}

/**
 * Get all available currencies as options for a select dropdown
 */
export function getCurrencyOptions(): Array<{ value: CurrencyCode; label: string }> {
  return Object.entries(CURRENCIES).map(([code, config]) => ({
    value: code as CurrencyCode,
    label: `${config.symbol} ${config.code} - ${config.name}`,
  }));
}
