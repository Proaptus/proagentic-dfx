/**
 * Pareto Chart Configuration
 * Centralized configuration for Pareto chart metrics, colors, and styling
 */

import type { ParetoDesign } from '@/lib/types';
import { formatCurrencyLabel } from '@/lib/utils/currency';

// Metric configuration for axis selection
export type ParetoXMetric = 'weight_kg' | 'cost_eur' | 'p_failure' | 'fatigue_life_cycles' | 'permeation_rate';
export type ParetoYMetric = 'weight_kg' | 'cost_eur' | 'p_failure' | 'burst_pressure_bar' | 'burst_ratio' | 'volumetric_efficiency';

export interface MetricOption {
  value: string;
  label: string;
}

export const X_AXIS_OPTIONS: MetricOption[] = [
  { value: 'weight_kg', label: 'Weight (kg)' },
  { value: 'cost_eur', label: 'Cost (€)' },
  { value: 'p_failure', label: 'P(Failure)' },
  { value: 'fatigue_life_cycles', label: 'Fatigue Life (cycles)' },
  { value: 'permeation_rate', label: 'Permeation Rate' },
];

export const Y_AXIS_OPTIONS: MetricOption[] = [
  { value: 'cost_eur', label: 'Cost (€)' },
  { value: 'weight_kg', label: 'Weight (kg)' },
  { value: 'burst_pressure_bar', label: 'Burst Pressure (bar)' },
  { value: 'burst_ratio', label: 'Burst Ratio' },
  { value: 'p_failure', label: 'P(Failure)' },
  { value: 'volumetric_efficiency', label: 'Vol. Efficiency' },
];

// Trade-off category color tokens (aligned with Tailwind design system)
export const CATEGORY_COLORS = Object.freeze({
  lightest: Object.freeze({
    bg: '#D1FAE5',
    text: '#065F46',
    dot: '#10B981',
  }),
  balanced: Object.freeze({
    bg: '#CFFAFE',
    text: '#155E75',
    dot: '#06B6D4',
  }),
  recommended: Object.freeze({
    bg: '#EDE9FE',
    text: '#5B21B6',
    dot: '#8B5CF6',
  }),
  conservative: Object.freeze({
    bg: '#F1F5F9',
    text: '#334155',
    dot: '#64748B',
  }),
  max_margin: Object.freeze({
    bg: '#F3E8FF',
    text: '#6B21A8',
    dot: '#A855F7',
  }),
  default: Object.freeze({
    bg: '#F3F4F6',
    text: '#374151',
    dot: '#9CA3AF',
  }),
});

export type TradeOffCategory = keyof typeof CATEGORY_COLORS;

// Legend items for UI display
export interface LegendItem {
  category: string;
  label: string;
  color: string;
}

export const LEGEND_ITEMS: LegendItem[] = [
  { category: 'lightest', label: 'Lightest', color: CATEGORY_COLORS.lightest.dot },
  { category: 'balanced', label: 'Balanced', color: CATEGORY_COLORS.balanced.dot },
  { category: 'recommended', label: 'Recommended', color: CATEGORY_COLORS.recommended.dot },
  { category: 'conservative', label: 'Conservative', color: CATEGORY_COLORS.conservative.dot },
  { category: 'max_margin', label: 'Max Margin', color: CATEGORY_COLORS.max_margin.dot },
  { category: 'selected', label: 'Selected', color: '#3B82F6' },
];

// Utility functions for color selection
export function getCategoryColors(category: string | undefined): { bg: string; text: string; dot: string } {
  if (!category || !(category in CATEGORY_COLORS)) {
    return CATEGORY_COLORS.default;
  }
  return CATEGORY_COLORS[category as TradeOffCategory];
}

export function formatCategoryLabel(category: string | undefined): string {
  if (!category) return 'Unknown';
  return category.replace(/_/g, ' ');
}

// Type guard for ParetoDesign with required fields
export function isValidParetoDesign(design: Partial<ParetoDesign> | null | undefined): design is ParetoDesign {
  if (!design || typeof design !== 'object') {
    return false;
  }
  return (
    typeof design.id === 'string' &&
    typeof design.weight_kg === 'number' &&
    typeof design.cost_eur === 'number' &&
    typeof design.burst_pressure_bar === 'number'
  );
}

// Extract design highlights (featured designs)
export function extractHighlightedDesigns(designs: ParetoDesign[]): ParetoDesign[] {
  return designs.filter((d) => d.trade_off_category);
}

// Find recommended design
export function findRecommendedDesign(designs: ParetoDesign[]): ParetoDesign | undefined {
  return designs.find((d) => d.trade_off_category === 'recommended');
}

// Dynamic axis options with currency formatting
export function getXAxisOptions(): MetricOption[] {
  return [
    { value: 'weight_kg', label: 'Weight (kg)' },
    { value: 'cost_eur', label: formatCurrencyLabel('Cost') },
    { value: 'p_failure', label: 'P(Failure)' },
    { value: 'fatigue_life_cycles', label: 'Fatigue Life (cycles)' },
    { value: 'permeation_rate', label: 'Permeation Rate' },
  ];
}

export function getYAxisOptions(): MetricOption[] {
  return [
    { value: 'cost_eur', label: formatCurrencyLabel('Cost') },
    { value: 'weight_kg', label: 'Weight (kg)' },
    { value: 'burst_pressure_bar', label: 'Burst Pressure (bar)' },
    { value: 'burst_ratio', label: 'Burst Ratio' },
    { value: 'p_failure', label: 'P(Failure)' },
    { value: 'volumetric_efficiency', label: 'Vol. Efficiency' },
  ];
}
