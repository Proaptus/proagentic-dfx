/**
 * Type definitions and constants for Thermal Analysis Panel
 */

import type { DesignThermal } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

export interface ThermalAnalysisPanelProps {
  data: DesignThermal;
  designId?: string;
  onThermalDataChange?: (data: DesignThermal) => void;
}

export type ThermalScenario = 'fast_fill' | 'ambient_soak' | 'fire_exposure';

// ============================================================================
// Constants
// ============================================================================

export const THERMAL_SCENARIOS: Record<ThermalScenario, string> = {
  fast_fill: 'Fast Fill (700 bar in 3 min)',
  ambient_soak: 'Ambient Soak (85°C)',
  fire_exposure: 'Fire Exposure (TPRD Activation)',
};

// ============================================================================
// Utility Functions
// ============================================================================

export function getTempStatusColor(status: string): string {
  switch (status) {
    case 'pass': return 'bg-green-50 border-green-500 text-green-700';
    case 'warn': return 'bg-yellow-50 border-yellow-500 text-yellow-700';
    case 'fail': return 'bg-red-50 border-red-500 text-red-700';
    default: return 'bg-gray-50 border-gray-500 text-gray-700';
  }
}

// ============================================================================
// Data Generation Utilities
// ============================================================================

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

export interface TemperatureZone {
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

export function generateTemperatureDistribution(thermalData: DesignThermal): TemperatureZone[] {
  return [
    { zone: 'Boss Region', temperature: thermalData.fast_fill.peak_liner_temp_c - 5 },
    { zone: 'Dome Apex', temperature: thermalData.fast_fill.peak_liner_temp_c - 8 },
    { zone: 'Dome Equator', temperature: thermalData.fast_fill.peak_liner_temp_c - 3 },
    { zone: 'Cylinder Wall', temperature: thermalData.fast_fill.peak_liner_temp_c },
    { zone: 'Outer Surface', temperature: thermalData.fast_fill.peak_wall_temp_c },
  ];
}
