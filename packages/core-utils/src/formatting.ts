/**
 * Formatting Utilities
 * Shared formatting for engineering values
 */

/**
 * Format a number with specified decimal places
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number with engineering notation (k, M, G)
 */
export function formatEngineering(value: number, decimals: number = 2): string {
  const suffixes = ['', 'k', 'M', 'G', 'T'];
  let suffixIndex = 0;
  let scaledValue = value;

  while (Math.abs(scaledValue) >= 1000 && suffixIndex < suffixes.length - 1) {
    scaledValue /= 1000;
    suffixIndex++;
  }

  return `${scaledValue.toFixed(decimals)}${suffixes[suffixIndex]}`;
}

/**
 * Format a value with unit
 */
export function formatWithUnit(
  value: number,
  unit: string,
  decimals: number = 2
): string {
  return `${formatNumber(value, decimals)} ${unit}`;
}

/**
 * Common engineering unit formatters
 */
export const formatters = {
  pressure: (value: number, unit: 'bar' | 'MPa' = 'bar'): string =>
    formatWithUnit(value, unit, 1),

  temperature: (value: number, unit: 'C' | 'K' = 'C'): string =>
    formatWithUnit(value, unit === 'C' ? '°C' : 'K', 1),

  length: (value: number, unit: 'mm' | 'm' = 'mm'): string =>
    formatWithUnit(value, unit, unit === 'mm' ? 1 : 3),

  mass: (value: number, unit: 'kg' | 'g' = 'kg'): string =>
    formatWithUnit(value, unit, 2),

  stress: (value: number): string =>
    formatWithUnit(value, 'MPa', 1),

  volume: (value: number, unit: 'L' | 'm³' = 'L'): string =>
    formatWithUnit(value, unit, unit === 'L' ? 1 : 4),

  currency: (value: number, currency: string = 'EUR'): string => {
    const symbols: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };
    return `${symbols[currency] || currency}${formatNumber(value, 0)}`;
  },

  percentage: (value: number, decimals: number = 1): string =>
    `${formatNumber(value * 100, decimals)}%`,

  cycles: (value: number): string =>
    formatEngineering(value, 1) + ' cycles',

  probability: (value: number): string => {
    if (value < 0.0001) {
      return `${(value * 1e6).toFixed(1)} ppm`;
    }
    return formatters.percentage(value, 4);
  },
};

/**
 * Parse a string with unit to numeric value
 */
export function parseWithUnit(input: string): { value: number; unit: string } | null {
  const match = input.trim().match(/^([\d.,]+)\s*(.*)$/);
  if (!match) return null;

  const value = parseFloat(match[1].replace(',', '.'));
  const unit = match[2].trim();

  if (isNaN(value)) return null;

  return { value, unit };
}

/**
 * Convert between common engineering units
 */
export const conversions = {
  pressure: {
    barToMPa: (bar: number) => bar / 10,
    MPaToBar: (mpa: number) => mpa * 10,
    psiToBar: (psi: number) => psi * 0.0689476,
    barToPsi: (bar: number) => bar * 14.5038,
  },
  length: {
    mmToM: (mm: number) => mm / 1000,
    mToMm: (m: number) => m * 1000,
    inToMm: (inch: number) => inch * 25.4,
    mmToIn: (mm: number) => mm / 25.4,
  },
  temperature: {
    cToK: (c: number) => c + 273.15,
    kToC: (k: number) => k - 273.15,
    fToC: (f: number) => (f - 32) * (5 / 9),
    cToF: (c: number) => c * (9 / 5) + 32,
  },
  mass: {
    kgToG: (kg: number) => kg * 1000,
    gToKg: (g: number) => g / 1000,
    lbToKg: (lb: number) => lb * 0.453592,
    kgToLb: (kg: number) => kg / 0.453592,
  },
};
