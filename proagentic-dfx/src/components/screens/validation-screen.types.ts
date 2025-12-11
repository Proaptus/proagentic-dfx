/**
 * Types and constants for Validation Screen
 */

// ============================================================================
// Types
// ============================================================================

export interface SensorLocation {
  id: string;
  position: string;
  x: number;
  y: number;
  z: number;
  type: 'strain' | 'temperature' | 'acoustic';
  critical: boolean;
  inspection_interval_hours: number;
  rationale: string;
}

export interface TestType {
  id: string;
  name: string;
  standard: string;
  articles: number;
  cycles?: number;
  pressure_range?: string;
  temp_range?: string;
  duration_days: number;
  cost_eur: number;
  critical: boolean;
}

export interface InspectionScheduleItem {
  interval: string;
  checks: string;
  duration_min: number;
}

export interface ValidationStats {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  completionRate: number;
  lastRun: string;
}

export type ValidationTab = 'surrogate' | 'testing' | 'sentry' | 'verification';

export interface ValidationScreenProps {
  sensorLocations?: SensorLocation[];
  inspectionSchedule?: InspectionScheduleItem[];
  validationStats?: ValidationStats;
  onRunTests?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_TEST_PLAN: TestType[] = [
  {
    id: 'burst',
    name: 'Burst Test',
    standard: 'UN R134 / ISO 19881',
    articles: 3,
    pressure_range: '1575-2100 bar',
    duration_days: 5,
    cost_eur: 25000,
    critical: true,
  },
  {
    id: 'cycle',
    name: 'Pressure Cycling',
    standard: 'UN R134 §6.2.4',
    articles: 3,
    cycles: 22000,
    pressure_range: '2-700 bar',
    duration_days: 45,
    cost_eur: 35000,
    critical: true,
  },
  {
    id: 'permeation',
    name: 'Permeation Test',
    standard: 'ISO 19881 Annex B',
    articles: 2,
    temp_range: '15-85°C',
    duration_days: 14,
    cost_eur: 18000,
    critical: true,
  },
  {
    id: 'thermal',
    name: 'Extreme Temperature',
    standard: 'UN R134 §6.2.6',
    articles: 2,
    temp_range: '-40 to +85°C',
    duration_days: 7,
    cost_eur: 12000,
    critical: true,
  },
  {
    id: 'fire',
    name: 'Bonfire Test',
    standard: 'UN R134 §6.2.8',
    articles: 1,
    duration_days: 1,
    cost_eur: 20000,
    critical: true,
  },
  {
    id: 'drop',
    name: 'Drop Test',
    standard: 'UN R134 §6.2.9',
    articles: 2,
    duration_days: 3,
    cost_eur: 8000,
    critical: false,
  },
  {
    id: 'fatigue',
    name: 'Accelerated Stress Rupture',
    standard: 'ISO 11119-3',
    articles: 3,
    temp_range: '65°C sustained',
    duration_days: 1000,
    cost_eur: 45000,
    critical: true,
  },
  {
    id: 'impact',
    name: 'Ballistic Impact',
    standard: 'UN R134 §6.2.10',
    articles: 1,
    duration_days: 2,
    cost_eur: 15000,
    critical: false,
  },
];

export const DEFAULT_VALIDATION_STATS: ValidationStats = {
  totalTests: 42,
  passed: 38,
  failed: 2,
  warnings: 2,
  completionRate: 90,
  lastRun: '2025-01-15 14:32:00',
};
