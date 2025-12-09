/**
 * Compliance Types
 * Type definitions for compliance verification system
 */

export type ComplianceStatus = 'pass' | 'fail' | 'warning';
export type StandardStatus = 'pass' | 'in_progress' | 'pending';

export interface ClauseCompliance {
  clause: string;
  description: string;
  status: ComplianceStatus;
  actual_value: string;
  required_value: string;
}

export interface StandardCompliance {
  standard_id: string;
  standard_name: string;
  status: 'pass' | 'fail';
  clauses: ClauseCompliance[];
}

export interface DesignCompliance {
  design_id: string;
  overall_status: 'pass' | 'fail';
  standards: StandardCompliance[];
}

export interface TestRequirement {
  test: string;
  articles: number;
  duration: string;
  parameters: string;
}

export interface RecommendedLab {
  name: string;
  location: string;
  accreditation: string;
  specialization: string;
  leadTime: string;
}

export interface TestPlan {
  design_id: string;
  tests: TestRequirement[];
  total_articles: string;
  total_duration: string;
  estimated_cost: string;
  recommended_labs?: RecommendedLab[];
}

export interface EnhancedClause {
  clause: string;
  description: string;
  requirement_text: string;
  status: ComplianceStatus;
  actual_value: string;
  required_value: string;
  evidence: string;
  justification: string;
  test_reference?: string;
  design_check_completed: boolean;
  test_required: boolean;
  verified: boolean;
}

export interface EnhancedStandard {
  standard_id: string;
  standard_name: string;
  version: string;
  applicability: 'required' | 'recommended' | 'optional';
  status: StandardStatus;
  clauses: EnhancedClause[];
}

export interface MatrixRequirement {
  requirement_id: string;
  standard: string;
  clause: string;
  description: string;
  design_check: 'complete' | 'incomplete';
  test_required: boolean;
  verified: 'yes' | 'no' | 'pending';
  status: ComplianceStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ComplianceStats {
  totalRequirements: number;
  passedRequirements: number;
  failedRequirements: number;
  overallPercentage: number;
  standardsCompliant: number;
  totalStandards: number;
}

export type ViewMode = 'overview' | 'breakdown' | 'matrix' | 'tests' | 'library';

// Standards Library Types
export interface StandardApplicability {
  tank_types?: string[];
  pressure_range?: { min: number; max: number };
  gas_types?: string[];
  regions?: string[];
  volume_max_liters?: number;
  vehicle_types?: string[];
}

export interface KeyRequirement {
  clause?: string;
  id?: string;
  summary: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

export interface RegulatoryStandard {
  id: string;
  code: string;
  title: string;
  full_title: string;
  type: 'regulatory';
  version: string;
  release_date?: string;
  scope: string;
  description: string;
  applicability: StandardApplicability;
  is_mandatory: boolean;
  clauses_count: number;
  status: 'active' | 'superseded' | 'draft';
  superseded_by?: string;
  key_requirements: KeyRequirement[];
  certification_bodies: string[];
}

export interface IndustryStandard {
  id: string;
  code: string;
  title: string;
  type: 'industry';
  version: string;
  scope: string;
  description: string;
  applicability: StandardApplicability;
  is_mandatory: boolean;
  clauses_count: number;
  status: 'active' | 'superseded' | 'draft';
}

export interface InternalPolicy {
  id: string;
  code: string;
  title: string;
  type: 'internal';
  version: string;
  owner: string;
  scope: string;
  description: string;
  requirements: KeyRequirement[];
  effective_date: string;
  review_date: string;
  status: 'active' | 'draft' | 'archived';
}

export interface CustomerRequirement {
  id: string;
  code: string;
  title: string;
  type: 'customer';
  customer: string;
  version: string;
  scope: string;
  description: string;
  requirements: KeyRequirement[];
  status: 'active' | 'inactive';
}

export interface StandardsLibrary {
  regulatory_standards: RegulatoryStandard[];
  industry_standards: IndustryStandard[];
  internal_policies: InternalPolicy[];
  customer_requirements: CustomerRequirement[];
  summary: {
    total_regulatory: number;
    total_industry: number;
    total_internal_policies: number;
    total_customer_requirements: number;
    last_updated: string;
  };
}
