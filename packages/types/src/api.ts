/**
 * API Types
 * Shared API request/response types for all domains
 */

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  processingTime?: number;
}

// Requirements Parsing
export interface RequirementsInput {
  input_mode: 'natural_language' | 'structured';
  raw_text?: string;
  structured?: Record<string, unknown>;
}

export interface ParsedRequirements {
  success: boolean;
  parsed_requirements: Record<string, unknown>;
  derived_requirements: Record<string, unknown>;
  applicable_standards: StandardReference[];
  confidence: number;
  warnings: string[];
  clarification_needed: string[];
}

export interface StandardReference {
  id: string;
  name: string;
  region: string;
  relevance: 'Primary' | 'Secondary' | 'Legacy';
  key_requirements: string[];
}

// Design Types
export interface DesignCandidate {
  id: string;
  trade_off_category: string;
  summary: DesignSummary;
  geometry: DesignGeometry;
  stress?: StressAnalysis;
  failure?: FailureAnalysis;
  thermal?: ThermalAnalysis;
  reliability?: ReliabilityAnalysis;
  compliance?: ComplianceStatus;
}

export interface DesignSummary {
  weight_kg: number;
  cost_eur: number;
  burst_pressure_bar: number;
  burst_ratio: number;
  p_failure: number;
  fatigue_life_cycles: number;
}

export interface DesignGeometry {
  dimensions: Record<string, number>;
  layup?: LayupDefinition;
  dome?: DomeProfile;
}

export interface LayupDefinition {
  total_layers: number;
  helical_count: number;
  hoop_count: number;
  fiber_volume_fraction: number;
  liner_thickness_mm: number;
  layers: LayerDefinition[];
}

export interface LayerDefinition {
  layer: number;
  type: 'helical' | 'hoop';
  angle_deg: number;
  thickness_mm: number;
  coverage: string;
}

export interface DomeProfile {
  type: string;
  profile_points: Array<{ r: number; z: number }>;
  parameters: Record<string, unknown>;
}

export interface StressAnalysis {
  max_principal_mpa: number;
  max_shear_mpa: number;
  safety_factor: number;
  critical_location: string;
}

export interface FailureAnalysis {
  tsai_wu_index: number;
  hashin_fiber: number;
  hashin_matrix: number;
  first_ply_failure: string;
}

export interface ThermalAnalysis {
  max_temp_c: number;
  min_temp_c: number;
  thermal_stress_mpa: number;
}

export interface ReliabilityAnalysis {
  p_failure: number;
  confidence_interval: [number, number];
  monte_carlo_samples: number;
}

export interface ComplianceStatus {
  status: 'pass' | 'fail' | 'warning';
  checks: ComplianceCheck[];
}

export interface ComplianceCheck {
  standard: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  value?: number;
  threshold?: number;
}

// Optimization
export interface OptimizationRequest {
  requirements: Record<string, unknown>;
  objectives: string[];
  constraints?: Record<string, unknown>;
}

export interface OptimizationResult {
  pareto_front: DesignCandidate[];
  generation_count: number;
  convergence_metric: number;
}

// Export
export interface ExportRequest {
  design_id: string;
  formats: string[];
  include_analysis: boolean;
}

export interface ExportResult {
  export_id: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  download_url?: string;
  files?: string[];
}
