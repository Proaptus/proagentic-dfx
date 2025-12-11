import { z } from 'zod';

/**
 * Zod schemas for runtime validation of application data types
 */

// ParsedRequirements Schema
export const ParsedRequirementsSchema = z.object({
  internal_volume_liters: z.number().positive('Volume must be positive'),
  working_pressure_bar: z.number().positive('Pressure must be positive'),
  target_weight_kg: z.number().positive('Weight must be positive'),
  target_cost_eur: z.number().positive('Cost must be positive'),
  min_burst_ratio: z.number().min(1, 'Burst ratio must be at least 1'),
  max_permeation_rate: z.number().nonnegative('Permeation rate cannot be negative'),
  operating_temp_min_c: z.number(),
  operating_temp_max_c: z.number(),
  fatigue_cycles: z.number().int().nonnegative('Fatigue cycles must be non-negative'),
  certification_region: z.string().min(1, 'Certification region is required'),
}).refine(
  (data) => data.operating_temp_max_c > data.operating_temp_min_c,
  {
    message: 'Maximum temperature must be greater than minimum temperature',
    path: ['operating_temp_max_c'],
  }
);

// DerivedRequirements Schema
export const DerivedRequirementsSchema = z.object({
  burst_pressure_bar: z.number().positive(),
  test_pressure_bar: z.number().positive(),
  min_wall_thickness_mm: z.number().positive(),
  applicable_standards: z.array(z.string()),
});

// ApplicableStandard Schema
export const ApplicableStandardSchema = z.object({
  id: z.string(),
  name: z.string(),
  region: z.string(),
  relevance: z.string(),
  key_requirements: z.array(z.string()),
});

// ParseRequirementsResponse Schema
export const ParseRequirementsResponseSchema = z.object({
  success: z.boolean(),
  parsed_requirements: ParsedRequirementsSchema,
  derived_requirements: DerivedRequirementsSchema,
  applicable_standards: z.array(ApplicableStandardSchema),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string()),
  clarification_needed: z.array(z.string()),
});

// TankType Schema
export const TankTypeSchema = z.enum(['IV', 'III', 'V']);

// OptimizationConfig Schema
export const OptimizationConfigSchema = z.object({
  requirements: ParsedRequirementsSchema,
  tank_type: TankTypeSchema,
  materials: z.object({
    fiber: z.string().min(1, 'Fiber material is required'),
    matrix: z.string().min(1, 'Matrix material is required'),
    liner: z.string().min(1, 'Liner material is required'),
  }),
  objectives: z.array(z.string()).min(1, 'At least one objective is required'),
  constraints: z.record(z.string(), z.number()),
});

// Design Schema (ParetoDesign)
export const DesignSchema = z.object({
  id: z.string(),
  weight_kg: z.number().positive(),
  cost_eur: z.number().positive(),
  burst_pressure_bar: z.number().positive(),
  burst_ratio: z.number().positive(),
  p_failure: z.number().min(0).max(1),
  fatigue_life_cycles: z.number().nonnegative(),
  permeation_rate: z.number().nonnegative(),
  volumetric_efficiency: z.number().min(0).max(1),
  trade_off_category: z.enum([
    'lightest',
    'cheapest',
    'recommended',
    'most_reliable',
    'balanced',
    'conservative',
    'max_margin'
  ]).optional(),
  recommendation_reason: z.string().optional(),
});

// ExportOptions Schema
export const ExportOptionsSchema = z.object({
  format: z.enum(['csv', 'json']),
  includeHeader: z.boolean(),
  precision: z.number().int().min(0).max(10, 'Precision must be between 0 and 10'),
});

// DesignGeometry Schema
export const DesignGeometrySchema = z.object({
  outer_radius_mm: z.number().positive(),
  inner_radius_mm: z.number().positive(),
  cylinder_length_mm: z.number().positive(),
  total_length_mm: z.number().positive(),
  internal_volume_liters: z.number().positive(),
  total_weight_kg: z.number().positive(),
}).refine(
  (data) => data.outer_radius_mm > data.inner_radius_mm,
  {
    message: 'Outer radius must be greater than inner radius',
    path: ['outer_radius_mm'],
  }
);

// Layer Schema
export const LayerSchema = z.object({
  layer_num: z.number().int().positive(),
  type: z.enum(['liner', 'hoop', 'helical']),
  angle_deg: z.number().min(-90).max(90).optional(),
  thickness_mm: z.number().positive(),
  material: z.string(),
});

// StressAnalysis Schema
export const StressAnalysisSchema = z.object({
  max_von_mises_mpa: z.number().nonnegative(),
  max_principal_stress_mpa: z.number(),
  min_safety_factor: z.number().positive(),
  critical_location: z.string(),
});

export type ParsedRequirements = z.infer<typeof ParsedRequirementsSchema>;
export type DerivedRequirements = z.infer<typeof DerivedRequirementsSchema>;
export type ApplicableStandard = z.infer<typeof ApplicableStandardSchema>;
export type ParseRequirementsResponse = z.infer<typeof ParseRequirementsResponseSchema>;
export type TankType = z.infer<typeof TankTypeSchema>;
export type OptimizationConfig = z.infer<typeof OptimizationConfigSchema>;
export type Design = z.infer<typeof DesignSchema>;
export type ExportOptions = z.infer<typeof ExportOptionsSchema>;
export type DesignGeometry = z.infer<typeof DesignGeometrySchema>;
export type Layer = z.infer<typeof LayerSchema>;
export type StressAnalysis = z.infer<typeof StressAnalysisSchema>;
