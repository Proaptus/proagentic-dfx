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

export type ViewMode = 'overview' | 'breakdown' | 'matrix' | 'tests';
