import { Car, Plane, Factory, Zap } from 'lucide-react';

export type ApplicationType = 'automotive' | 'aviation' | 'stationary' | 'custom';

// Validation constraints (ISSUE-005, ISSUE-006, ISSUE-007)
export const VALIDATION_RULES = {
  pressure: { min: 200, max: 1000 }, // bar - typical H2 tank range
  weight: { min: 1 }, // kg - must be positive
  volume: { min: 10, max: 2000 }, // liters
  cost: { min: 100 }, // EUR - must be positive
  fatigueCycles: { min: 1000 }, // cycles
};

export interface ValidationErrors {
  working_pressure_bar?: string;
  target_weight_kg?: string;
  target_cost_eur?: string;
  operating_temp?: string;
  internal_volume_liters?: string;
  fatigue_cycles?: string;
}

export const STEPS = ['Application', 'Pressure', 'Capacity', 'Constraints', 'Environment', 'Certification', 'Review'];

export interface RequirementDefaults {
  working_pressure_bar: number;
  internal_volume_liters: number;
  target_weight_kg: number;
  target_cost_eur: number;
  operating_temp_min_c: number;
  operating_temp_max_c: number;
  fatigue_cycles: number;
  certification_region: string;
}

export interface ApplicationPreset {
  label: string;
  icon: typeof Car;
  description: string;
  defaults: RequirementDefaults;
}

export const APPLICATION_PRESETS: Record<ApplicationType, ApplicationPreset> = {
  automotive: {
    label: 'Automotive',
    icon: Car,
    description: '700 bar Type IV for fuel cell vehicles',
    defaults: {
      working_pressure_bar: 700,
      internal_volume_liters: 150,
      target_weight_kg: 80,
      target_cost_eur: 15000,
      operating_temp_min_c: -40,
      operating_temp_max_c: 85,
      fatigue_cycles: 11000,
      certification_region: 'EU',
    },
  },
  aviation: {
    label: 'Aviation',
    icon: Plane,
    description: '350 bar lightweight for drones/aircraft',
    defaults: {
      working_pressure_bar: 350,
      internal_volume_liters: 50,
      target_weight_kg: 25,
      target_cost_eur: 20000,
      operating_temp_min_c: -55,
      operating_temp_max_c: 70,
      fatigue_cycles: 20000,
      certification_region: 'International',
    },
  },
  stationary: {
    label: 'Stationary',
    icon: Factory,
    description: '500 bar for energy storage',
    defaults: {
      working_pressure_bar: 500,
      internal_volume_liters: 500,
      target_weight_kg: 200,
      target_cost_eur: 8000,
      operating_temp_min_c: -10,
      operating_temp_max_c: 50,
      fatigue_cycles: 45000,
      certification_region: 'EU',
    },
  },
  custom: {
    label: 'Custom',
    icon: Zap,
    description: 'Define your own specs',
    defaults: {
      working_pressure_bar: 700,
      internal_volume_liters: 100,
      target_weight_kg: 50,
      target_cost_eur: 10000,
      operating_temp_min_c: -40,
      operating_temp_max_c: 85,
      fatigue_cycles: 11000,
      certification_region: 'EU',
    },
  },
};
