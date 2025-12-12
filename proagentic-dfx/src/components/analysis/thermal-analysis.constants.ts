/**
 * Constants and utility functions for ThermalAnalysisPanel
 * Extracted to keep component file under 500 lines
 */

import type { DesignThermal } from '@/lib/types';

export type ThermalScenario = 'fast_fill' | 'ambient_soak' | 'fire_exposure';

export const THERMAL_SCENARIOS: Record<ThermalScenario, string> = {
  fast_fill: 'Fast Fill (700 bar in 3 min)',
  ambient_soak: 'Ambient Soak (85°C)',
  fire_exposure: 'Fire Exposure (TPRD Activation)',
};

export function getTempStatusColor(status: string): string {
  switch (status) {
    case 'pass': return 'bg-green-50 border-green-500 text-green-700';
    case 'warn': return 'bg-yellow-50 border-yellow-500 text-yellow-700';
    case 'fail': return 'bg-red-50 border-red-500 text-red-700';
    default: return 'bg-gray-50 border-gray-500 text-gray-700';
  }
}

export interface ThroughWallPoint {
  position: string;
  distance: number;
  temperature: number;
}

export interface MaterialLimit {
  material: string;
  operating: number;
  limit: number;
  margin: number;
}

export interface TempDistribution {
  zone: string;
  temperature: number;
}

export function generateThroughWallProfile(thermalData: DesignThermal): ThroughWallPoint[] {
  return [
    { position: 'Inner Liner', distance: 0, temperature: thermalData.fast_fill.peak_liner_temp_c },
    { position: 'Composite Inner', distance: 2, temperature: thermalData.fast_fill.peak_liner_temp_c - 8 },
    { position: 'Composite Mid', distance: 6, temperature: thermalData.fast_fill.peak_liner_temp_c - 18 },
    { position: 'Composite Outer', distance: 10, temperature: thermalData.fast_fill.peak_wall_temp_c - 12 },
    { position: 'Outer Surface', distance: 12, temperature: thermalData.fast_fill.peak_wall_temp_c },
  ];
}

export function generateMaterialLimits(thermalData: DesignThermal): MaterialLimit[] {
  return [
    {
      material: 'HDPE Liner',
      operating: thermalData.fast_fill.peak_liner_temp_c,
      limit: thermalData.fast_fill.liner_limit_c,
      margin: thermalData.fast_fill.liner_limit_c - thermalData.fast_fill.peak_liner_temp_c,
    },
    {
      material: 'Epoxy Matrix',
      operating: thermalData.fast_fill.peak_wall_temp_c,
      limit: 120,
      margin: 120 - thermalData.fast_fill.peak_wall_temp_c,
    },
    {
      material: 'Carbon Fiber',
      operating: thermalData.fast_fill.peak_wall_temp_c,
      limit: 350,
      margin: 350 - thermalData.fast_fill.peak_wall_temp_c,
    },
  ];
}

export function generateTemperatureDistribution(thermalData: DesignThermal): TempDistribution[] {
  return [
    { zone: 'Boss Region', temperature: thermalData.fast_fill.peak_liner_temp_c - 5 },
    { zone: 'Dome Apex', temperature: thermalData.fast_fill.peak_liner_temp_c - 8 },
    { zone: 'Dome Equator', temperature: thermalData.fast_fill.peak_liner_temp_c - 3 },
    { zone: 'Cylinder Wall', temperature: thermalData.fast_fill.peak_liner_temp_c },
    { zone: 'Outer Surface', temperature: thermalData.fast_fill.peak_wall_temp_c },
  ];
}

export interface EquationVariable {
  symbol: string;
  description: string;
  value?: string;
}

export interface EquationData {
  title: string;
  equation: string;
  variables: EquationVariable[];
  explanation: string;
  defaultExpanded?: boolean;
}

export function getThermalEquations(thermalData: DesignThermal): EquationData[] {
  return [
    {
      title: 'Adiabatic Compression Temperature Rise',
      equation: 'T_2 = T_1 × (P_2 / P_1)^((γ-1)/γ)',
      variables: [
        { symbol: 'T_2', description: 'Final gas temperature', value: `${thermalData.fast_fill.peak_gas_temp_c}°C` },
        { symbol: 'T_1', description: 'Initial gas temperature', value: '20°C' },
        { symbol: 'P_2', description: 'Final pressure', value: '700 bar' },
        { symbol: 'P_1', description: 'Initial pressure', value: '1 bar' },
        { symbol: 'γ', description: 'Heat capacity ratio (H₂)', value: '1.41' },
      ],
      explanation: 'During fast filling, compression is nearly adiabatic (no heat transfer). This causes significant temperature rise in the hydrogen gas.',
    },
    {
      title: 'Thermal Stress (CTE Mismatch)',
      equation: 'σ_thermal = E × Δα × ΔT',
      variables: [
        { symbol: 'σ_thermal', description: 'Thermal stress', value: `${thermalData.thermal_stress.max_mpa} MPa` },
        { symbol: 'E', description: 'Elastic modulus', value: '135 GPa' },
        { symbol: 'Δα', description: 'CTE difference', value: '119.5 × 10⁻⁶/°C' },
        { symbol: 'ΔT', description: 'Temperature change', value: `${thermalData.fast_fill.peak_wall_temp_c - 20}°C` },
      ],
      explanation: 'When materials with different thermal expansion coefficients are bonded together, temperature changes create stress at the interface.',
    },
    {
      title: 'Temperature-Dependent Strength',
      equation: 'σ_allowable(T) = σ_ref × (1 - k × (T - T_ref))',
      variables: [
        { symbol: 'σ_allowable(T)', description: 'Temperature-adjusted strength' },
        { symbol: 'σ_ref', description: 'Reference strength at 20°C', value: '2700 MPa' },
        { symbol: 'k', description: 'Temperature degradation factor', value: '0.002/°C' },
        { symbol: 'T', description: 'Operating temperature' },
      ],
      explanation: 'Composite material strength decreases with increasing temperature. The degradation is approximately linear for epoxy-based composites up to glass transition temperature (Tg ≈ 120°C).',
      defaultExpanded: false,
    },
  ];
}
