/**
 * Domain Configuration Types
 * Defines the structure for any engineering domain (H2 Tank, Pressure Vessel, etc.)
 * This is the core extensibility mechanism for adding new designers.
 */

export interface DomainConfiguration {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Requirements configuration
  requirements: {
    fields: RequirementField[];
    defaults: Record<string, unknown>;
    validations: Record<string, ValidationRule>;
  };

  // Optimization objectives
  objectives: ObjectiveDefinition[];

  // Analysis modules available
  analysisModules: AnalysisModule[];

  // Standards/compliance
  applicableStandards: Standard[];

  // Visualization config
  visualization: VisualizationConfig;

  // API endpoints (can point to different backends)
  endpoints: DomainEndpoints;
}

export interface RequirementField {
  key: string;
  label: string;
  type: 'number' | 'select' | 'text' | 'range';
  unit?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  group?: string;
}

export interface ObjectiveDefinition {
  key: string;
  label: string;
  type: 'minimize' | 'maximize';
  unit: string;
  description?: string;
}

export interface AnalysisModule {
  id: string;
  name: string;
  icon: string;
  endpoint: string;
  description?: string;
}

export interface Standard {
  code: string;
  name: string;
  region: string;
  version?: string;
}

export interface ValidationRule {
  type: 'range' | 'regex' | 'custom';
  params?: unknown;
  message?: string;
}

export interface VisualizationConfig {
  type: 'cad' | '2d' | 'schematic';
  showLayers: boolean;
  showStress: boolean;
  showCutaway: boolean;
  defaultView?: string;
}

export interface DomainEndpoints {
  requirements: string;
  optimize: string;
  designs: string;
  export: string;
  [key: string]: string; // Allow custom endpoints
}

/**
 * Domain Registry - Maps domain IDs to their configurations
 */
export interface DomainRegistry {
  domains: Record<string, DomainConfiguration>;
  defaultDomain: string;
}
