/**
 * Types and constants for Pareto Chart
 */

import type { ParetoDesign } from '@/lib/types';
import type { ChartType, ColorMode } from '@/lib/charts/chart-utils';
import { formatCurrencyLabel, getCurrencySymbol } from '@/lib/utils/currency';
import { CATEGORY_COLORS as SHARED_CATEGORY_COLORS } from '@/lib/charts/chart-utils';

// ============================================================================
// Types
// ============================================================================

export type SizeMetric = 'none' | 'burst_ratio' | 'fatigue_life_cycles' | 'volumetric_efficiency' | 'p_failure';

export interface ParetoChartProps {
  designs: ParetoDesign[];
  xAxis: 'weight_kg' | 'cost_eur' | 'p_failure' | 'fatigue_life_cycles' | 'permeation_rate';
  yAxis: 'weight_kg' | 'cost_eur' | 'p_failure' | 'burst_pressure_bar' | 'burst_ratio' | 'volumetric_efficiency';
  selectedIds: string[];
  onSelect: (id: string) => void;
  recommendedId?: string;
  initialChartType?: ChartType;
  initialColorMode?: ColorMode;
  initialSizeMetric?: SizeMetric;
  showControls?: boolean;
  showBrush?: boolean;
  showReferenceAreas?: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

export const getAxisConfig = (): Record<string, { label: string; key: string; isScientific?: boolean; unit?: string }> => ({
  weight_kg: { label: 'Weight (kg)', key: 'weight_kg', unit: 'kg' },
  cost_eur: { label: formatCurrencyLabel('Cost'), key: 'cost_eur', unit: getCurrencySymbol() },
  p_failure: { label: 'P(failure)', key: 'p_failure', isScientific: true },
  burst_pressure_bar: { label: 'Burst Pressure (bar)', key: 'burst_pressure_bar', unit: 'bar' },
  burst_ratio: { label: 'Burst Ratio', key: 'burst_ratio' },
  fatigue_life_cycles: { label: 'Fatigue Life (cycles)', key: 'fatigue_life_cycles', unit: 'cycles' },
  permeation_rate: { label: 'Permeation (ml/L/hr)', key: 'permeation_rate', unit: 'ml/L/hr' },
  volumetric_efficiency: { label: 'Vol. Efficiency', key: 'volumetric_efficiency' },
});

export const CATEGORY_COLORS: Record<string, string> = {
  ...SHARED_CATEGORY_COLORS,
  lightest: '#10B981',
  balanced: '#06B6D4',
  recommended: '#8B5CF6',
  conservative: '#64748B',
  max_margin: '#A855F7',
};

export const SELECTED_COLOR = '#3B82F6';
export const DEFAULT_COLOR = '#9CA3AF';

export const SIZE_METRIC_OPTIONS = [
  { value: 'none', label: 'Fixed Size' },
  { value: 'burst_ratio', label: 'Burst Ratio' },
  { value: 'fatigue_life_cycles', label: 'Fatigue Life' },
  { value: 'volumetric_efficiency', label: 'Vol. Efficiency' },
  { value: 'p_failure', label: 'Reliability' },
];
