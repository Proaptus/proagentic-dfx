/**
 * Types and constants for Cost Analysis Panel
 */

import type { DesignCost } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

export interface CostAnalysisPanelProps {
  data: DesignCost;
  designId?: string;
  onCostDataChange?: (data: DesignCost) => void;
}

export type ProductionVolume = '1k' | '5k' | '10k' | '50k';

export interface ManufacturingProcess {
  process: string;
  time_min: number;
  cost_eur: number;
}

// ============================================================================
// Constants
// ============================================================================

export const COST_COLORS = [
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#6366F1', // indigo-500
  '#F59E0B', // amber-500
  '#14B8A6', // teal-500
];

export const PRODUCTION_VOLUMES: Record<ProductionVolume, string> = {
  '1k': '1,000 units/year',
  '5k': '5,000 units/year (Baseline)',
  '10k': '10,000 units/year',
  '50k': '50,000 units/year',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate volume reduction percentage compared to baseline (5k)
 */
export function getVolumeReductionPct(volume: ProductionVolume): number {
  switch (volume) {
    case '50k': return -32;
    case '10k': return -15;
    case '1k': return +20;
    default: return 0;
  }
}

/**
 * Generate manufacturing process breakdown based on labor cost
 */
export function generateManufacturingProcesses(laborCost: number): ManufacturingProcess[] {
  return [
    { process: 'Liner Molding', time_min: 12, cost_eur: Math.round(laborCost * 0.15) },
    { process: 'Filament Winding', time_min: 45, cost_eur: Math.round(laborCost * 0.50) },
    { process: 'Curing', time_min: 180, cost_eur: Math.round(laborCost * 0.15) },
    { process: 'Boss Installation', time_min: 20, cost_eur: Math.round(laborCost * 0.10) },
    { process: 'Quality Control', time_min: 30, cost_eur: Math.round(laborCost * 0.10) },
  ];
}
