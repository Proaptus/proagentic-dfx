/**
 * ComplianceScreen Component
 * REQ-084 to REQ-089: Enhanced compliance verification with clause-by-clause breakdown
 *
 * This component now uses the enhanced version with:
 * - Compliance summary dashboard
 * - Clause-by-clause breakdown
 * - Compliance matrix
 * - Test requirements panel
 *
 * REFINEMENT v2 IMPROVEMENTS:
 * - TypeScript strict mode compliance
 * - Extracted reusable components
 * - Type guards instead of assertions
 * - Improved accessibility
 * - Memoized calculations
 * - Comprehensive unit tests
 */

'use client';

// Re-export the refined enhanced version as the main ComplianceScreen
export { ComplianceScreenEnhanced as ComplianceScreen } from './ComplianceScreen.enhanced.v2';
