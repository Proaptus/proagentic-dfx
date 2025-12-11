/**
 * Shared Chart Utilities
 * Common configuration, colors, formatting, and utilities for all charts
 */

// ============================================================================
// Chart Types & Modes
// ============================================================================

export type ChartType = 'line' | 'area' | 'bar' | 'scatter' | 'bubble' | 'radar' | 'pie';
export type ColorMode = 'default' | 'category' | 'gradient' | 'reliability' | 'cost' | 'performance';
export type SizeMode = 'fixed' | 'value' | 'metric';

export interface ChartConfig {
  chartType: ChartType;
  colorMode: ColorMode;
  sizeMode: SizeMode;
  sizeMetric?: string;
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  animate: boolean;
  zoomEnabled: boolean;
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  chartType: 'line',
  colorMode: 'default',
  sizeMode: 'fixed',
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  animate: true,
  zoomEnabled: false,
};

// ============================================================================
// Color Palettes
// ============================================================================

// Primary color palette - professional blues and purples
export const PRIMARY_COLORS = [
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
];

// Sequential color scales for gradients
export const SEQUENTIAL_SCALES = {
  blue: ['#EFF6FF', '#BFDBFE', '#60A5FA', '#2563EB', '#1E40AF'],
  green: ['#F0FDF4', '#BBF7D0', '#4ADE80', '#16A34A', '#166534'],
  red: ['#FEF2F2', '#FECACA', '#F87171', '#DC2626', '#991B1B'],
  purple: ['#FAF5FF', '#E9D5FF', '#C084FC', '#9333EA', '#6B21A8'],
  orange: ['#FFF7ED', '#FED7AA', '#FB923C', '#EA580C', '#9A3412'],
};

// Diverging color scales (good for showing positive/negative or high/low)
export const DIVERGING_SCALES = {
  redGreen: ['#EF4444', '#F59E0B', '#FBBF24', '#A3E635', '#22C55E'],
  blueRed: ['#3B82F6', '#8B5CF6', '#D946EF', '#F43F5E', '#EF4444'],
  coolWarm: ['#06B6D4', '#38BDF8', '#94A3B8', '#FB923C', '#EF4444'],
};

// Category colors for trade-off categories
export const CATEGORY_COLORS: Record<string, string> = {
  lightest: '#10B981',      // green-500
  balanced: '#06B6D4',      // cyan-500
  recommended: '#8B5CF6',   // violet-500
  conservative: '#64748B',  // slate-500
  max_margin: '#A855F7',    // purple-500
  optimal: '#22C55E',       // green-500
  suboptimal: '#F59E0B',    // amber-500
  critical: '#EF4444',      // red-500
};

// Status colors
export const STATUS_COLORS = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  neutral: '#64748B',
};

// ============================================================================
// Color Interpolation
// ============================================================================

/**
 * Interpolate between colors in a scale based on a 0-1 value
 */
export function interpolateColor(colors: string[], t: number): string {
  // Handle single color array
  if (colors.length === 1) {
    const c = colors[0];
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Handle NaN by treating it as 0
  const clampedT = Math.max(0, Math.min(1, isNaN(t) ? 0 : t));
  const n = colors.length - 1;
  const i = Math.min(Math.floor(clampedT * n), n - 1);
  const f = clampedT * n - i;

  const c1 = colors[i];
  const c2 = colors[i + 1];

  // Parse hex colors
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);

  // Interpolate
  const r = Math.round(r1 + f * (r2 - r1));
  const g = Math.round(g1 + f * (g2 - g1));
  const b = Math.round(b1 + f * (b2 - b1));

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Get color for a value based on color mode
 */
export function getValueColor(
  value: number,
  min: number,
  max: number,
  colorMode: ColorMode,
  invert: boolean = false
): string {
  if (min === max) return PRIMARY_COLORS[0];
  
  let t = (value - min) / (max - min);
  if (invert) t = 1 - t;

  switch (colorMode) {
    case 'reliability':
      return interpolateColor(DIVERGING_SCALES.redGreen, t);
    case 'cost':
      return interpolateColor(DIVERGING_SCALES.redGreen.slice().reverse(), t);
    case 'performance':
      return interpolateColor(SEQUENTIAL_SCALES.purple, t);
    case 'gradient':
      return interpolateColor(SEQUENTIAL_SCALES.blue, t);
    default:
      return PRIMARY_COLORS[0];
  }
}

// ============================================================================
// Value Formatting
// ============================================================================

export interface FormatOptions {
  isScientific?: boolean;
  precision?: number;
  unit?: string;
  compact?: boolean;
}

/**
 * Format a numeric value for display
 */
export function formatValue(value: number, options: FormatOptions = {}): string {
  const { isScientific, unit, compact = true } = options;
  // Clamp precision to valid range (0-100) for toFixed
  const precision = Math.max(0, Math.min(100, options.precision ?? 2));

  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  // Handle Infinity
  if (value === Infinity) {
    return 'Infinity';
  }
  if (value === -Infinity) {
    return '-Infinity';
  }

  // Handle zero explicitly
  if (value === 0) {
    return unit ? `0 ${unit}` : '0';
  }

  // Scientific notation for very small or explicitly scientific values
  if (isScientific || (value !== 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(precision > 0 ? precision - 1 : 0);
  }

  // Compact notation for large numbers
  if (compact && Math.abs(value) >= 1000000) {
    const formatted = `${(value / 1000000).toFixed(1)}M`;
    return unit ? `${formatted} ${unit}` : formatted;
  }
  if (compact && Math.abs(value) >= 1000) {
    const formatted = `${(value / 1000).toFixed(1)}k`;
    return unit ? `${formatted} ${unit}` : formatted;
  }

  // Small decimals
  if (Math.abs(value) < 1 && value !== 0) {
    const formatted = value.toFixed(precision);
    return unit ? `${formatted} ${unit}` : formatted;
  }

  // Regular numbers - always respect precision
  const formatted = value.toFixed(precision);

  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format axis tick value
 */
export function formatAxisTick(value: number, isScientific?: boolean): string {
  return formatValue(value, { isScientific, precision: 1, compact: true });
}

/**
 * Format percentage
 */
export function formatPercent(value: number, precision: number = 1): string {
  return `${(value * 100).toFixed(precision)}%`;
}

// ============================================================================
// Data Normalization
// ============================================================================

/**
 * Normalize values to 0-1 range
 */
export function normalizeValues(values: number[]): { normalized: number[]; min: number; max: number } {
  // Throw on empty array
  if (!values || values.length === 0) {
    throw new Error('Cannot normalize empty array');
  }

  // Check for invalid values
  for (const v of values) {
    if (!isFinite(v)) {
      throw new Error('Cannot normalize array with NaN or Infinity values');
    }
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return {
    normalized: values.map(v => (v - min) / range),
    min,
    max,
  };
}

/**
 * Normalize to log scale (useful for p_failure)
 */
export function normalizeLogScale(values: number[]): { normalized: number[]; min: number; max: number } {
  const positiveValues = values.filter(v => v > 0);
  if (positiveValues.length === 0) {
    return { normalized: values.map(() => 0), min: 0, max: 1 };
  }
  
  const logValues = positiveValues.map(v => Math.log10(v));
  const min = Math.min(...logValues);
  const max = Math.max(...logValues);
  const range = max - min || 1;
  
  return {
    normalized: values.map(v => v > 0 ? (Math.log10(v) - min) / range : 0),
    min: Math.pow(10, min),
    max: Math.pow(10, max),
  };
}

// ============================================================================
// Domain Calculation
// ============================================================================

/**
 * Calculate domain with padding
 */
export function calculateDomain(values: number[], padding: number = 0.1): [number, number] {
  // Validate input
  if (!values || values.length === 0) {
    throw new Error('Cannot calculate domain for empty array');
  }

  // Check for invalid values
  for (const v of values) {
    if (isNaN(v) || !isFinite(v)) {
      throw new Error('Cannot calculate domain with NaN or Infinity values');
    }
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  // Handle single value or identical values
  if (min === max) {
    const absVal = Math.abs(min);
    const pad = absVal > 0 ? absVal * padding : 1;
    return [min - pad, max + pad];
  }

  const range = max - min;
  const pad = range * padding;

  // Don't force min to be >= 0, allow negative domains
  return [min - pad, max + pad];
}

/**
 * Calculate nice tick values for an axis
 */
export function calculateNiceTicks(min: number, max: number, targetCount: number = 5): number[] {
  const range = max - min;

  // Handle edge case: targetCount <= 1
  if (targetCount <= 1) {
    return [min, max];
  }

  const roughStep = range / (targetCount - 1);
  
  // Find a nice step size
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  
  let niceStep: number;
  if (residual <= 1.5) niceStep = magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;
  
  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;
  
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax; v += niceStep) {
    ticks.push(v);
  }
  
  return ticks;
}

// ============================================================================
// Tooltip Helpers
// ============================================================================

export interface TooltipData {
  label: string;
  value: string | number;
  color?: string;
  highlight?: boolean;
}

/**
 * Format tooltip content
 */
export function formatTooltipData(data: Record<string, number | string>, config: Record<string, FormatOptions> = {}): TooltipData[] {
  return Object.entries(data).map(([key, value]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: typeof value === 'number' ? formatValue(value, config[key]) : value,
  }));
}

// ============================================================================
// Animation Helpers
// ============================================================================

export const ANIMATION_CONFIG = {
  fast: { duration: 200, easing: 'ease-out' },
  normal: { duration: 400, easing: 'ease-in-out' },
  slow: { duration: 800, easing: 'ease-in-out' },
};

// ============================================================================
// Export all utilities
// ============================================================================

export const ChartUtils = {
  // Colors
  PRIMARY_COLORS,
  SEQUENTIAL_SCALES,
  DIVERGING_SCALES,
  CATEGORY_COLORS,
  STATUS_COLORS,
  interpolateColor,
  getValueColor,
  
  // Formatting
  formatValue,
  formatAxisTick,
  formatPercent,
  
  // Data
  normalizeValues,
  normalizeLogScale,
  calculateDomain,
  calculateNiceTicks,
  
  // Tooltip
  formatTooltipData,
  
  // Animation
  ANIMATION_CONFIG,
};
