/**
 * Types and constants for Failure Analysis Panel
 */

import type { DesignFailure } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

export interface FailureAnalysisPanelProps {
  data: DesignFailure;
  designId?: string;
  onFailureDataChange?: (data: DesignFailure) => void;
}

export type LoadCase = 'test_pressure' | 'burst_pressure' | 'operating_pressure';
export type FailureMode = 'fiber_tension' | 'fiber_compression' | 'matrix_tension' | 'matrix_compression';

// ============================================================================
// Constants
// ============================================================================

export const LOAD_CASES: Record<LoadCase, string> = {
  test_pressure: 'Test Pressure (1.5×)',
  burst_pressure: 'Burst Pressure (2.25×)',
  operating_pressure: 'Operating Pressure (1.0×)',
};

export const FAILURE_MODES: Record<FailureMode, string> = {
  fiber_tension: 'Fiber Tension',
  fiber_compression: 'Fiber Compression',
  matrix_tension: 'Matrix Tension',
  matrix_compression: 'Matrix Compression',
};

// ============================================================================
// Static Configuration Data
// ============================================================================

import type { SensitivityParameter } from '@/components/charts/TornadoChart';
import type { RadarMetric, RadarDesignData } from '@/components/charts/RadarChart';

export const DEFAULT_SENSITIVITY_DATA: SensitivityParameter[] = [
  { parameter: 'fiber_strength', label: 'Fiber Strength', low_impact: -12.5, high_impact: 15.8, baseline: 2700, unit: 'MPa' },
  { parameter: 'fiber_volume_fraction', label: 'Fiber Volume Fraction', low_impact: -8.2, high_impact: 9.4, baseline: 0.62 },
  { parameter: 'layer_thickness', label: 'Layer Thickness', low_impact: -6.1, high_impact: 7.3, baseline: 0.15, unit: 'mm' },
  { parameter: 'matrix_strength', label: 'Matrix Strength', low_impact: -5.4, high_impact: 6.2, baseline: 85, unit: 'MPa' },
  { parameter: 'winding_angle', label: 'Winding Angle', low_impact: -4.8, high_impact: 5.1, baseline: 15, unit: '°' },
];

export const FAILURE_METRICS: RadarMetric[] = [
  { metric: 'fiber_tension', label: 'Fiber Tension', unit: '', higherIsBetter: false },
  { metric: 'fiber_compression', label: 'Fiber Compression', unit: '', higherIsBetter: false },
  { metric: 'matrix_tension', label: 'Matrix Tension', unit: '', higherIsBetter: false },
  { metric: 'matrix_compression', label: 'Matrix Compression', unit: '', higherIsBetter: false },
  { metric: 'shear', label: 'Shear', unit: '', higherIsBetter: false },
];

export function generateFailureEnvelopeData(hashinCriteria: Array<{ mode: string; value: number }>, tsaiWuValue: number): RadarDesignData[] {
  return [
    {
      designId: 'hashin', designName: 'Hashin Criteria',
      values: {
        fiber_tension: hashinCriteria.find(h => h.mode === 'Fiber Tension')?.value || 0.38,
        fiber_compression: hashinCriteria.find(h => h.mode === 'Fiber Compression')?.value || 0.22,
        matrix_tension: hashinCriteria.find(h => h.mode === 'Matrix Tension')?.value || 0.65,
        matrix_compression: hashinCriteria.find(h => h.mode === 'Matrix Compression')?.value || 0.41,
        shear: 0.52,
      },
      color: '#3B82F6',
    },
    {
      designId: 'tsai_wu', designName: 'Tsai-Wu',
      values: { fiber_tension: tsaiWuValue, fiber_compression: 0.72, matrix_tension: 0.88, matrix_compression: 0.68, shear: 0.75 },
      color: '#10B981',
    },
    {
      designId: 'max_stress', designName: 'Max Stress',
      values: { fiber_tension: 0.92, fiber_compression: 0.78, matrix_tension: 0.95, matrix_compression: 0.82, shear: 0.88 },
      color: '#F59E0B',
    },
  ];
}
