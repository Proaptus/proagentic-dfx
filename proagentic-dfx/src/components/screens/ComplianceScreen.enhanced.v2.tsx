/**
 * Enhanced ComplianceScreen Component (Refined v2)
 * REQ-084 to REQ-089: Complete compliance verification system
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getDesignCompliance, getDesignTestPlan } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { CheckCircle, XCircle, FileText, Beaker, TrendingUp } from 'lucide-react';
import { ClauseBreakdown } from '@/components/compliance/ClauseBreakdown';
import { ComplianceMatrix } from '@/components/compliance/ComplianceMatrix';
import { ComplianceStatCard } from '@/components/compliance/ComplianceStatCard';
import { ComplianceAlert } from '@/components/compliance/ComplianceAlert';
import { StandardCard } from '@/components/compliance/StandardCard';
import { TabButton } from '@/components/compliance/TabButton';
import { TestRequirementsPanel } from '@/components/compliance/TestRequirementsPanel';
import {
  type DesignCompliance,
  type TestPlan,
  type EnhancedStandard,
  type MatrixRequirement,
  type ComplianceStats,
  type ViewMode,
} from '@/components/compliance/types';

// Type guard for DesignCompliance
function isDesignCompliance(data: unknown): data is DesignCompliance {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.design_id === 'string' &&
    (d.overall_status === 'pass' || d.overall_status === 'fail') &&
    Array.isArray(d.standards)
  );
}

// Type guard for TestPlan
function isTestPlan(data: unknown): data is TestPlan {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.design_id === 'string' &&
    Array.isArray(d.tests) &&
    typeof d.total_articles === 'string' &&
    typeof d.total_duration === 'string' &&
    typeof d.estimated_cost === 'string'
  );
}

export function ComplianceScreenEnhanced() {
  const { currentDesign, setCurrentDesign } = useAppStore();

  const [compliance, setCompliance] = useState<DesignCompliance | null>(null);
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  // Default to design C if none selected
  useEffect(() => {
    if (!currentDesign) {
      setCurrentDesign('C');
    }
  }, [currentDesign, setCurrentDesign]);

  // Fetch compliance data
  useEffect(() => {
    if (!currentDesign) return;

    setLoading(true);
    setError(null);

    Promise.all([
      getDesignCompliance(currentDesign),
      getDesignTestPlan(currentDesign),
    ])
      .then(([compData, testData]) => {
        if (!isDesignCompliance(compData)) {
          throw new Error('Invalid compliance data format');
        }
        if (!isTestPlan(testData)) {
          throw new Error('Invalid test plan data format');
        }
        setCompliance(compData);
        setTestPlan(testData);
      })
      .catch((err) => {
        console.error('Failed to fetch compliance data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load compliance data'
        );
      })
      .finally(() => setLoading(false));
  }, [currentDesign]);

  // Transform API data to enhanced format (memoized)
  const enhancedStandards: EnhancedStandard[] = useMemo(() => {
    if (!compliance) return [];

    return compliance.standards.map((standard) => ({
      standard_id: standard.standard_id,
      standard_name: standard.standard_name,
      version: '2022',
      applicability: 'required' as const,
      status: standard.status === 'pass' ? ('pass' as const) : ('in_progress' as const),
      clauses: standard.clauses.map((clause) => ({
        clause: clause.clause,
        description: clause.description,
        requirement_text: `${clause.description} - Required: ${clause.required_value}`,
        status: clause.status,
        actual_value: clause.actual_value,
        required_value: clause.required_value,
        evidence: `Design calculation shows ${clause.actual_value}`,
        justification:
          clause.status === 'pass'
            ? 'Meets requirement'
            : 'Requires design modification',
        test_reference: clause.status === 'fail' ? 'verification-test-001' : undefined,
        design_check_completed: true,
        test_required: clause.status === 'fail',
        verified: clause.status === 'pass',
      })),
    }));
  }, [compliance]);

  // Transform to matrix format (memoized)
  const matrixRequirements: MatrixRequirement[] = useMemo(() => {
    if (!compliance) return [];

    return compliance.standards.flatMap((standard) =>
      standard.clauses.map((clause, idx) => ({
        requirement_id: `REQ-${standard.standard_id.replace(/[^0-9]/g, '')}-${String(idx + 1).padStart(3, '0')}`,
        standard: standard.standard_id,
        clause: clause.clause,
        description: clause.description,
        design_check: clause.status === 'pass' ? ('complete' as const) : ('incomplete' as const),
        test_required: clause.status === 'fail',
        verified:
          clause.status === 'pass'
            ? ('yes' as const)
            : clause.status === 'fail'
              ? ('no' as const)
              : ('pending' as const),
        status: clause.status,
        priority:
          clause.status === 'fail'
            ? ('critical' as const)
            : clause.status === 'warning'
              ? ('high' as const)
              : ('medium' as const),
      }))
    );
  }, [compliance]);

  // Calculate compliance statistics (memoized)
  const complianceStats: ComplianceStats = useMemo(() => {
    const totalReqs = matrixRequirements.length;
    const passedReqs = matrixRequirements.filter((r) => r.status === 'pass').length;
    const failedReqs = matrixRequirements.filter((r) => r.status === 'fail').length;

    return {
      totalRequirements: totalReqs,
      passedRequirements: passedReqs,
      failedRequirements: failedReqs,
      overallPercentage: totalReqs > 0 ? Math.round((passedReqs / totalReqs) * 100) : 0,
      standardsCompliant: compliance?.standards.filter((s) => s.status === 'pass').length ?? 0,
      totalStandards: compliance?.standards.length ?? 0,
    };
  }, [matrixRequirements, compliance]);

  // Callbacks for view mode changes
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingState variant="spinner" size="lg" text="Loading compliance data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-600">
        <div className="text-center">
          <XCircle size={48} className="mx-auto mb-4" />
          <p className="text-lg font-semibold">Error loading compliance data</p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!compliance) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No compliance data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Compliance Dashboard
            </h1>
            <p className="text-gray-700 text-lg mb-1">
              Design {currentDesign} - Hydrogen Pressure Vessel Standards Verification
            </p>
            <p className="text-gray-600 text-sm max-w-3xl">
              Comprehensive compliance analysis against ISO 11119-3, UN ECE R134, and SAE J2579 standards.
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-sm ${
              compliance.overall_status === 'pass'
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-red-100 text-red-800 border-2 border-red-300'
            }`}
            role="status"
            aria-label={`Overall compliance status: ${compliance.overall_status}`}
          >
            {compliance.overall_status === 'pass' ? (
              <CheckCircle size={24} className="flex-shrink-0" aria-hidden="true" />
            ) : (
              <XCircle size={24} className="flex-shrink-0" aria-hidden="true" />
            )}
            <span className="font-semibold text-lg">
              Overall: {compliance.overall_status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-200" role="tablist">
        <TabButton active={viewMode === 'overview'} onClick={() => handleViewModeChange('overview')} icon={TrendingUp} label="Overview" />
        <TabButton active={viewMode === 'breakdown'} onClick={() => handleViewModeChange('breakdown')} icon={FileText} label="Clause Breakdown" />
        <TabButton active={viewMode === 'matrix'} onClick={() => handleViewModeChange('matrix')} icon={CheckCircle} label="Compliance Matrix" />
        <TabButton active={viewMode === 'tests'} onClick={() => handleViewModeChange('tests')} icon={Beaker} label="Test Requirements" />
      </div>

      {/* Compliance Summary Dashboard */}
      {viewMode === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ComplianceStatCard
              label="Overall Compliance"
              value={`${complianceStats.overallPercentage}%`}
              icon={TrendingUp}
              variant="default"
              progress={{ value: complianceStats.overallPercentage, max: 100, showBar: true }}
            />
            <ComplianceStatCard
              label="Requirements Passed"
              value={complianceStats.passedRequirements}
              subtitle={`of ${complianceStats.totalRequirements} total`}
              icon={CheckCircle}
              variant="success"
            />
            <ComplianceStatCard
              label="Outstanding Issues"
              value={complianceStats.failedRequirements}
              subtitle={complianceStats.failedRequirements > 0 ? 'critical items' : 'no issues'}
              icon={XCircle}
              variant="error"
            />
            <ComplianceStatCard
              label="Standards Met"
              value={`${complianceStats.standardsCompliant}/${complianceStats.totalStandards}`}
              subtitle="fully compliant"
              icon={FileText}
              variant="info"
            />
          </div>

          {/* Alert Sections */}
          {complianceStats.failedRequirements > 0 && (
            <ComplianceAlert
              status="fail"
              title="Compliance Issues Detected"
              message="This design has {count} that must be resolved before certification."
              issueCount={complianceStats.failedRequirements}
              actions={[
                { label: 'View Clause Details', onClick: () => handleViewModeChange('breakdown'), variant: 'primary' },
                { label: 'See Test Plan', onClick: () => handleViewModeChange('tests'), variant: 'secondary' },
              ]}
            />
          )}

          {complianceStats.failedRequirements === 0 && complianceStats.overallPercentage === 100 && (
            <ComplianceAlert
              status="pass"
              title="Full Compliance Achieved"
              message="This design meets all regulatory requirements and is ready for qualification testing."
              actions={[
                { label: 'View Test Plan', onClick: () => handleViewModeChange('tests'), variant: 'primary' },
              ]}
            />
          )}

          {/* Standards Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Standards Applicability
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Regulatory standards applicable to this hydrogen pressure vessel design
              </p>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enhancedStandards.map((standard) => (
                <StandardCard
                  key={standard.standard_id}
                  standardId={standard.standard_id}
                  standardName={standard.standard_name}
                  version={standard.version}
                  applicability={standard.applicability}
                  status={standard.status}
                />
              ))}
            </div>
          </Card>
        </>
      )}

      {viewMode === 'breakdown' && <ClauseBreakdown standards={enhancedStandards} />}
      {viewMode === 'matrix' && <ComplianceMatrix requirements={matrixRequirements} />}
      {viewMode === 'tests' && testPlan && <TestRequirementsPanel testPlan={testPlan} />}
    </div>
  );
}
