// H2 Tank Designer - Core Types
// Based on OpenAPI spec and mock-server-specification.md

// ============================================================================
// Requirements Types (Screen 1)
// ============================================================================

export interface RequirementsInput {
  input_mode: 'natural_language' | 'structured';
  raw_text?: string;
  structured?: StructuredRequirements;
}

export interface StructuredRequirements {
  pressure_bar: number;
  pressure_type?: 'working' | 'test' | 'burst';
  volume_liters: number;
  weight_max_kg?: number;
  cost_target_eur?: number;
  application?: ApplicationType;
  environment?: EnvironmentType;
  service_life_years?: number;
  region?: RegionType;
}

export type ApplicationType =
  | 'automotive_passenger'
  | 'automotive_hdt'
  | 'aerospace'
  | 'marine'
  | 'stationary'
  | 'portable';

export type EnvironmentType =
  | 'standard'
  | 'marine'
  | 'arctic'
  | 'desert'
  | 'corrosive';

export type RegionType = 'EU' | 'US' | 'Asia' | 'International';

export interface ParsedRequirementsResponse {
  success: boolean;
  parsed_requirements: ParsedRequirements;
  derived_requirements: DerivedRequirements;
  applicable_standards: ApplicableStandard[];
  confidence: number;
  warnings: string[];
  clarification_needed: string[];
}

export interface ParsedRequirements {
  pressure_bar: number;
  pressure_type: 'working' | 'test' | 'burst';
  volume_liters: number;
  weight_max_kg: number | null;
  cost_target_eur: number | null;
  application: ApplicationType;
  environment: EnvironmentType;
  service_life_years: number;
  region: RegionType;
}

export interface DerivedRequirements {
  test_pressure_bar: number;
  burst_pressure_min_bar: number;
  burst_ratio_min: number;
  cycle_life_min: number;
  permeation_max_nml_hr_l: number;
  temp_range_c: [number, number];
  fire_test_required: boolean;
  fire_test_type?: 'bonfire' | 'localized';
}

export interface ApplicableStandard {
  id: string;
  name: string;
  version?: string;
  selected: boolean;
}

// ============================================================================
// Standards Types
// ============================================================================

export interface StandardsResponse {
  standards: Standard[];
}

export interface Standard {
  id: string;
  name: string;
  version: string;
  region: string;
  requirements: StandardRequirements;
}

export interface StandardRequirements {
  burst_ratio_min?: number;
  cycle_life_min?: number;
  permeation_test?: boolean;
  fire_test?: boolean;
  temp_range_c?: [number, number];
  bonfire_test?: boolean;
  gunshot_test?: boolean;
}

// ============================================================================
// Materials Types (Screen 2)
// ============================================================================

export interface MaterialsResponse {
  fibers: FiberMaterial[];
  matrices: MatrixMaterial[];
  liners: LinerMaterial[];
  bosses: BossMaterial[];
}

export interface FiberMaterial {
  id: string;
  name: string;
  properties: FiberProperties;
  recommendation?: string;
}

export interface FiberProperties {
  E1_gpa: number;
  E2_gpa: number;
  G12_gpa: number;
  nu12: number;
  sigma1_ult_mpa: number;
  sigma2_ult_mpa: number;
  tau12_ult_mpa: number;
  density_kg_m3: number;
  cost_eur_kg: number;
}

export interface MatrixMaterial {
  id: string;
  name: string;
  properties: MatrixProperties;
}

export interface MatrixProperties {
  E_gpa: number;
  sigma_ult_mpa: number;
  Tg_c: number;
  cost_eur_kg: number;
}

export interface LinerMaterial {
  id: string;
  name: string;
  properties: LinerProperties;
}

export interface LinerProperties {
  E_gpa: number;
  permeability_mol_m_s_pa: number;
  cost_eur_kg: number;
}

export interface BossMaterial {
  id: string;
  name: string;
  properties: BossProperties;
  suitable_for: string[];
}

export interface BossProperties {
  E_gpa: number;
  sigma_yield_mpa: number;
  cost_eur_kg: number;
}

// ============================================================================
// Tank Type Types (Screen 2)
// ============================================================================

export interface TankTypeRequest {
  requirements: {
    pressure_bar: number;
    volume_liters: number;
    weight_max_kg?: number;
    environment?: EnvironmentType;
  };
}

export interface TankTypeResponse {
  recommendation: TankTypeRecommendation;
  alternatives: TankTypeAlternative[];
  type_comparison: TankTypeComparison[];
}

export interface TankTypeRecommendation {
  type: TankType;
  confidence: number;
  rationale: string;
}

export type TankType = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface TankTypeAlternative {
  type: TankType;
  feasible: boolean;
  estimated_weight_kg: number;
  reason: string;
  risk?: 'low' | 'medium' | 'high';
}

export interface TankTypeComparison {
  type: TankType;
  liner: string;
  kg_per_l: number;
  est_weight: number;
  feasible: boolean;
}

// ============================================================================
// Optimization Types (Screen 3)
// ============================================================================

export interface OptimizationRequest {
  requirements: ParsedRequirements;
  derived_requirements: DerivedRequirements;
  materials: MaterialSelection;
  objectives: OptimizationObjective[];
  priority: number[];
}

export interface MaterialSelection {
  fiber_id: string;
  matrix_id: string;
  liner_id: string;
  boss_id: string;
}

export type OptimizationObjective =
  | 'minimize_weight'
  | 'minimize_cost'
  | 'maximize_reliability'
  | 'maximize_burst_margin';

export interface OptimizationJob {
  job_id: string;
  status: 'started' | 'running' | 'completed' | 'failed' | 'cancelled';
  estimated_duration_seconds: number;
  stream_url: string;
}

export interface OptimizationProgress {
  progress_percent: number;
  generation: number;
  designs_evaluated: number;
  pareto_size: number;
  current_best?: CurrentBestDesigns;
  elapsed_seconds?: number;
  remaining_seconds?: number;
}

export interface CurrentBestDesigns {
  lightest: { weight_kg: number; cost_eur: number };
  cheapest: { weight_kg: number; cost_eur: number };
  most_reliable: { weight_kg: number; p_failure: number };
}

export interface OptimizationResults {
  job_id: string;
  status: 'completed';
  execution_time_seconds: number;
  total_evaluations: number;
  pareto_front_size: number;
  recommended_design_id: string;
  pareto_designs: ParetoDesign[];
}

export interface ParetoDesign {
  id: string;
  weight_kg: number;
  burst_pressure_bar: number;
  burst_ratio: number;
  cost_eur: number;
  p_failure: number;
  fatigue_life_cycles: number;
  permeation_rate: number;
  volumetric_efficiency: number;
  trade_off_category: 'lightest' | 'cheapest' | 'most_reliable' | 'balanced' | 'recommended' | 'conservative';
  recommendation_reason?: string;
}

// ============================================================================
// Design Analysis Types (Screen 5)
// ============================================================================

export interface DesignSummary {
  id: string;
  summary: {
    weight_kg: number;
    cost_eur: number;
    burst_pressure_bar: number;
    p_failure: number;
  };
}

export interface GeometryData {
  design_id: string;
  dimensions: Dimensions;
  dome: DomeGeometry;
  thickness_distribution: ThicknessDistribution;
  layup: LayupDefinition;
  mesh_for_3d?: MeshData;
}

export interface Dimensions {
  inner_radius_mm: number;
  outer_radius_mm: number;
  cylinder_length_mm: number;
  total_length_mm: number;
  wall_thickness_mm: number;
  internal_volume_liters: number;
}

export interface DomeGeometry {
  type: 'isotensoid' | 'hemispherical' | 'elliptical';
  parameters: {
    alpha_0_deg: number;
    r_0_mm: number;
    depth_mm: number;
    boss_id_mm: number;
    boss_od_mm: number;
  };
  profile_points: Array<{ r: number; z: number }>;
}

export interface ThicknessDistribution {
  cylinder_mm: number;
  dome_apex_mm: number;
  boss_region_mm: number;
  transition_mm: number;
  contour_data: Array<{ r: number; z: number; t: number }>;
}

export interface LayupDefinition {
  total_layers: number;
  helical_count: number;
  hoop_count: number;
  fiber_volume_fraction: number;
  liner_thickness_mm: number;
  layers: Layer[];
}

export interface Layer {
  layer: number;
  type: 'helical' | 'hoop';
  angle_deg: number;
  thickness_mm: number;
  coverage: 'full' | 'cylinder';
}

export interface MeshData {
  format: 'indexed_triangles';
  vertices: number[][];
  indices: number[];
  normals: number[][];
}

export interface StressData {
  design_id: string;
  load_case: 'test' | 'burst';
  load_pressure_bar: number;
  stress_type: StressType;
  max_stress: MaxStress;
  contour_data: ContourData;
  per_layer_stress: LayerStress[];
  stress_ratios: StressRatios;
}

export type StressType = 'vonMises' | 'hoop' | 'axial' | 'shear' | 'tsaiWu';

export interface MaxStress {
  value_mpa: number;
  location: { r: number; z: number; theta: number };
  region: string;
  allowable_mpa: number;
  margin_percent: number;
}

export interface ContourData {
  type: 'nodal';
  colormap: string;
  min_value: number;
  max_value: number;
  nodes: Array<{ x: number; y: number; z: number; value: number }>;
}

export interface LayerStress {
  layer: number;
  type: 'helical' | 'hoop';
  sigma1_mpa: number;
  sigma2_mpa: number;
  tau12_mpa: number;
  tsai_wu: number;
}

export interface StressRatios {
  hoop_to_axial: number;
  netting_theory_ratio: number;
  deviation_percent: number;
}

export interface FailureData {
  design_id: string;
  predicted_failure_mode: PredictedFailureMode;
  tsai_wu: TsaiWuData;
  first_ply_failure: FirstPlyFailure;
  progressive_failure_sequence: ProgressiveFailureEvent[];
  hashin_indices: HashinIndices;
}

export interface PredictedFailureMode {
  mode: 'fiber_breakage' | 'matrix_cracking' | 'delamination';
  is_preferred: boolean;
  location: string;
  confidence: number;
  explanation: string;
}

export interface TsaiWuData {
  max_at_test: { value: number; layer: number; location: string };
  max_at_burst: { value: number; layer: number; location: string };
  contour_data: Array<{ x: number; y: number; z: number; value: number }>;
}

export interface FirstPlyFailure {
  layer: number;
  layer_type: 'helical' | 'hoop';
  angle_deg: number;
  location: string;
  pressure_bar: number;
  mode: string;
  note: string;
}

export interface ProgressiveFailureEvent {
  pressure_bar: number;
  event: string;
  layers_affected?: number[];
  interface?: string;
  region?: string;
}

export interface HashinIndices {
  at_test: HashinValues;
  at_burst: HashinValues;
}

export interface HashinValues {
  fiber_tension: number;
  fiber_compression: number;
  matrix_tension: number;
  matrix_compression: number;
}

export interface ThermalData {
  design_id: string;
  fast_fill: FastFillAnalysis;
  thermal_stress: ThermalStressData;
  extreme_temperature_performance: ExtremeTemperatureResult[];
}

export interface FastFillAnalysis {
  scenario: string;
  peak_gas_temp_c: number;
  peak_wall_temp_c: number;
  peak_liner_temp_c: number;
  time_to_peak_seconds: number;
  liner_limit_c: number;
  status: 'pass' | 'fail';
  temperature_contour?: Array<{ x: number; y: number; z: number; value: number }>;
}

export interface ThermalStressData {
  max_mpa: number;
  location: string;
  components: {
    hoop_mpa: number;
    axial_mpa: number;
    radial_mpa: number;
  };
  combined_with_pressure_max_mpa: number;
}

export interface ExtremeTemperatureResult {
  condition: 'cold_soak' | 'hot_soak' | 'hot_fill';
  temp_c: number;
  max_stress_mpa: number;
  margin_percent: number;
  status: 'pass' | 'fail';
}

export interface ReliabilityData {
  design_id: string;
  monte_carlo: MonteCarloResult;
  burst_distribution: BurstDistribution;
  uncertainty_breakdown: UncertaintySource[];
  key_insight: string;
  sensitivity: SensitivityResult[];
}

export interface MonteCarloResult {
  samples: number;
  p_failure: number;
  interpretation: string;
  comparison_to_requirement: string;
}

export interface BurstDistribution {
  mean_bar: number;
  std_bar: number;
  cov: number;
  percentile_5: number;
  percentile_95: number;
  histogram: Array<{ bin_center: number; count: number }>;
}

export interface UncertaintySource {
  source: string;
  cov: number;
  variance_contribution: number;
}

export interface SensitivityResult {
  parameter: string;
  effect_bar_per_percent: number;
}

export interface CostData {
  design_id: string;
  unit_cost_eur: number;
  breakdown: CostBreakdownItem[];
  weight_cost_tradeoff: WeightCostPoint[];
  physics: PhysicsData;
}

export interface CostBreakdownItem {
  component: string;
  cost_eur: number;
  percentage: number;
}

export interface WeightCostPoint {
  design_id: string;
  weight_kg: number;
  cost_eur: number;
}

export interface PhysicsData {
  hoop_stress_mpa: number;
  axial_stress_mpa: number;
  hoop_to_axial_ratio: number;
  stored_energy_mj: number;
  permeation_rate: number;
  permeation_limit: number;
}

// ============================================================================
// Compliance Types
// ============================================================================

export interface ComplianceData {
  design_id: string;
  overall_status: 'pass' | 'fail';
  standards: StandardComplianceResult[];
}

export interface StandardComplianceResult {
  standard_id: string;
  standard_name: string;
  status: 'pass' | 'fail';
  clauses: ClauseResult[];
}

export interface ClauseResult {
  clause: string;
  description: string;
  status: 'pass' | 'fail' | 'na';
  actual_value?: string;
  required_value?: string;
}

// ============================================================================
// Validation Types (Screen 7)
// ============================================================================

export interface SurrogateConfidence {
  design_id: string;
  metrics: SurrogateMetric[];
}

export interface SurrogateMetric {
  metric: string;
  r_squared: number;
  error_percent: number;
  confidence_interval: { lower: number; upper: number };
}

export interface TestPlan {
  design_id: string;
  tests: TestRequirement[];
  total_articles: string;
  total_duration: string;
  estimated_cost: string;
}

export interface TestRequirement {
  test: string;
  articles: number;
  duration: string;
  parameters: string;
}

export interface SentrySpec {
  design_id: string;
  critical_monitoring_points: MonitoringPoint[];
  recommended_sensors: SensorRecommendation[];
  inspection_schedule: InspectionSchedule;
}

export interface MonitoringPoint {
  id: number;
  location: { r: number; z: number; theta: number };
  region: string;
  reason: string;
  recommended_sensor: string;
  inspection_interval_months: number;
}

export interface SensorRecommendation {
  type: string;
  count: number;
  purpose: string;
}

export interface InspectionSchedule {
  visual: string;
  acoustic_monitoring: string;
  full_inspection: string;
  replacement_trigger: string;
}

// ============================================================================
// Export Types (Screen 8)
// ============================================================================

export interface ExportRequest {
  design_id: string;
  include: ExportInclusions;
  format: 'zip';
}

export interface ExportInclusions {
  geometry: string[];
  manufacturing: string[];
  analysis: string[];
  compliance: string[];
  sentry: string[];
}

export interface ExportJob {
  export_id: string;
  status: 'generating' | 'completed' | 'failed';
  estimated_duration_seconds?: number;
  status_url: string;
}

export interface ExportStatus {
  export_id: string;
  status: 'generating' | 'completed' | 'failed';
  files?: ExportFile[];
  total_size_bytes?: number;
  download_url?: string;
}

export interface ExportFile {
  name: string;
  size_bytes: number;
}

// ============================================================================
// Comparison Types (Screen 6)
// ============================================================================

export interface CompareRequest {
  design_ids: string[];
}

export interface CompareResponse {
  designs: ComparedDesign[];
  radar_data: RadarDataPoint[];
  metrics: ComparisonMetric[];
}

export interface ComparedDesign {
  id: string;
  weight_kg: number;
  burst_pressure_bar: number;
  cost_eur: number;
  p_failure: number;
  fatigue_life_cycles: number;
  permeation_rate: number;
  max_stress_mpa: number;
  stress_margin_percent: number;
}

export interface RadarDataPoint {
  metric: string;
  [designId: string]: number | string;
}

export interface ComparisonMetric {
  metric: string;
  values: { [designId: string]: number | string };
  better: string;
}

// ============================================================================
// SSE Event Types
// ============================================================================

export type SSEEventType = 'progress' | 'best_update' | 'complete' | 'error';

export interface SSEEvent {
  type: SSEEventType;
  data: OptimizationProgress | CurrentBestDesigns | { job_id: string; status: string } | { error: string };
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

export type DataMode = 'static' | 'simulated' | 'hybrid';
