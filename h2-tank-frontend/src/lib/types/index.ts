// H2 Tank Designer Frontend Types

export interface ParsedRequirements {
  internal_volume_liters: number;
  working_pressure_bar: number;
  target_weight_kg: number;
  target_cost_eur: number;
  min_burst_ratio: number;
  max_permeation_rate: number;
  operating_temp_min_c: number;
  operating_temp_max_c: number;
  fatigue_cycles: number;
  certification_region: string;
}

export interface DerivedRequirements {
  burst_pressure_bar: number;
  test_pressure_bar: number;
  min_wall_thickness_mm: number;
  applicable_standards: string[];
}

export interface ApplicableStandard {
  id: string;
  name: string;
  region: string;
  relevance: string;
  key_requirements: string[];
}

export interface ParseRequirementsResponse {
  success: boolean;
  parsed_requirements: ParsedRequirements;
  derived_requirements: DerivedRequirements;
  applicable_standards: ApplicableStandard[];
  confidence: number;
  warnings: string[];
  clarification_needed: string[];
}

export interface TankTypeRecommendation {
  recommended_type: 'IV' | 'III' | 'V';
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    type: string;
    pros: string[];
    cons: string[];
  }>;
}

export interface OptimizationConfig {
  requirements: ParsedRequirements;
  tank_type: 'IV' | 'III' | 'V';
  materials: {
    fiber: string;
    matrix: string;
    liner: string;
  };
  objectives: string[];
  constraints: Record<string, number>;
}

export interface OptimizationJob {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  stream_url: string;
}

export interface ProgressEvent {
  progress_percent: number;
  generation: number;
  designs_evaluated: number;
  pareto_size: number;
  current_best: {
    lightest: { weight_kg: number; cost_eur: number };
    cheapest: { weight_kg: number; cost_eur: number };
    most_reliable: { weight_kg: number; p_failure: number };
  };
  elapsed_seconds: number;
  remaining_seconds: number;
}

export interface ParetoDesign {
  id: string;
  weight_kg: number;
  cost_eur: number;
  burst_pressure_bar: number;
  p_failure: number;
  fatigue_life_cycles: number;
  permeation_rate: number;
  volumetric_efficiency: number;
  trade_off_category?: 'lightest' | 'cheapest' | 'recommended' | 'most_reliable' | 'balanced';
}

export interface OptimizationResults {
  job_id: string;
  status: 'completed';
  pareto_front: ParetoDesign[];
  recommended: ParetoDesign;
  total_designs_evaluated: number;
  generations: number;
  elapsed_time_seconds: number;
}

export interface DesignSummary {
  id: string;
  trade_off_category?: string;
  recommendation_reason?: string;
  summary: {
    weight_kg: number;
    cost_eur: number;
    burst_pressure_bar: number;
    burst_ratio: number;
    p_failure: number;
    fatigue_life_cycles: number;
    permeation_rate: number;
    volumetric_efficiency: number;
  };
}

export interface DesignGeometry {
  design_id: string;
  dimensions: {
    inner_radius_mm: number;
    outer_radius_mm: number;
    cylinder_length_mm: number;
    total_length_mm: number;
    wall_thickness_mm: number;
    internal_volume_liters: number;
  };
  dome: {
    type: string;
    parameters: {
      alpha_0_deg: number;
      r_0_mm: number;
      depth_mm: number;
      boss_id_mm: number;
      boss_od_mm: number;
    };
    profile_points: Array<{ r: number; z: number }>;
  };
  thickness_distribution: {
    cylinder_mm: number;
    dome_average_mm: number;
    dome_apex_mm: number;
    boss_region_mm: number;
  };
  winding_pattern: {
    layers: Array<{
      type: 'helical' | 'hoop';
      angle_deg: number;
      thickness_mm: number;
      count: number;
    }>;
    total_layers: number;
    fiber_length_m: number;
  };
}

export interface StressNode {
  x: number;
  y: number;
  z: number;
  value: number;
}

export interface DesignStress {
  design_id: string;
  load_case: string;
  load_pressure_bar: number;
  stress_type: string;
  max_stress: {
    value_mpa: number;
    location: { r: number; z: number; theta: number };
    region: string;
    allowable_mpa: number;
    margin_percent: number;
  };
  contour_data: {
    type: string;
    colormap: string;
    min_value: number;
    max_value: number;
    nodes: StressNode[];
  };
}

export interface DesignFailure {
  design_id: string;
  predicted_failure_mode: {
    mode: string;
    is_preferred: boolean;
    location: string;
    confidence: number;
    explanation: string;
  };
  tsai_wu: {
    max_at_test: { value: number; layer: number; location: string };
    max_at_burst: { value: number; layer: number; location: string };
  };
}

export interface DesignThermal {
  design_id: string;
  fast_fill: {
    scenario: string;
    peak_gas_temp_c: number;
    peak_wall_temp_c: number;
    peak_liner_temp_c: number;
    time_to_peak_seconds: number;
    liner_limit_c: number;
    status: 'pass' | 'warn' | 'fail';
  };
  thermal_stress: {
    max_mpa: number;
    location: string;
    components: { hoop_mpa: number; axial_mpa: number; radial_mpa: number };
  };
}

export interface DesignReliability {
  design_id: string;
  monte_carlo: {
    samples: number;
    p_failure: number;
    interpretation: string;
    comparison_to_requirement: string;
  };
  burst_distribution: {
    mean_bar: number;
    std_bar: number;
    cov: number;
    histogram: Array<{ bin_center: number; count: number }>;
  };
}

export interface DesignCost {
  design_id: string;
  unit_cost_eur: number;
  breakdown: Array<{
    component: string;
    cost_eur: number;
    percentage: number;
  }>;
}

export interface ComplianceClause {
  clause: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  actual_value: string;
  required_value: string;
}

export interface ComplianceStandard {
  standard_id: string;
  standard_name: string;
  status: 'pass' | 'fail';
  clauses: ComplianceClause[];
}

export interface DesignCompliance {
  design_id: string;
  overall_status: 'pass' | 'fail';
  standards: ComplianceStandard[];
}

export interface CompareResponse {
  designs: Array<{
    id: string;
    weight_kg: number;
    burst_pressure_bar: number;
    cost_eur: number;
    p_failure: number;
    fatigue_life_cycles: number;
    permeation_rate: number;
    max_stress_mpa: number;
    stress_margin_percent: number;
  }>;
  radar_data: Array<Record<string, number | string>>;
  metrics: Array<{
    metric: string;
    values: Record<string, number | string>;
    better: string;
  }>;
}

// App state types
export type Screen =
  | 'requirements'
  | 'pareto'
  | 'viewer'
  | 'compare'
  | 'analysis'
  | 'compliance'
  | 'export'
  | 'sentry';

export interface AppState {
  currentScreen: Screen;
  requirements: ParsedRequirements | null;
  tankType: 'IV' | 'III' | 'V' | null;
  optimizationJob: OptimizationJob | null;
  paretoFront: ParetoDesign[];
  selectedDesigns: string[];
  currentDesign: string | null;
  analysisTab: 'stress' | 'failure' | 'thermal' | 'reliability' | 'cost';
}
