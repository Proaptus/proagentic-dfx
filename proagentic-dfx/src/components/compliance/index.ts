/**
 * Compliance Components - Barrel Exports
 * REQ-084 to REQ-089: Compliance verification components
 */

export { ClauseBreakdown } from './ClauseBreakdown';
export { ComplianceMatrix } from './ComplianceMatrix';
export { ComplianceStatCard, type ComplianceStatCardProps } from './ComplianceStatCard';
export { ComplianceAlert, type ComplianceAlertProps } from './ComplianceAlert';
export { StandardCard, type StandardCardProps } from './StandardCard';
export { TabButton, type TabButtonProps } from './TabButton';
export { TestRequirementsPanel } from './TestRequirementsPanel';
export { StandardsLibraryPanel } from './StandardsLibraryPanel';

export type {
  ComplianceStatus,
  StandardStatus,
  ClauseCompliance,
  StandardCompliance,
  DesignCompliance,
  TestRequirement,
  RecommendedLab,
  TestPlan,
  EnhancedClause,
  EnhancedStandard,
  MatrixRequirement,
  ComplianceStats,
  ViewMode,
  // Standards Library types
  StandardApplicability,
  KeyRequirement,
  RegulatoryStandard,
  IndustryStandard,
  InternalPolicy,
  CustomerRequirement,
  StandardsLibrary,
} from './types';
