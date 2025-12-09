/**
 * ClauseBreakdown Component
 * REQ-084 to REQ-089: Detailed clause-by-clause compliance breakdown
 * REQ-272: Component library with consistent styling
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface Clause {
  clause: string;
  description: string;
  requirement_text: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  actual_value?: string;
  required_value?: string;
  evidence?: string;
  justification?: string;
  test_reference?: string;
  design_check_completed?: boolean;
  test_required?: boolean;
  verified?: boolean;
}

interface Standard {
  standard_id: string;
  standard_name: string;
  version: string;
  applicability: 'required' | 'recommended' | 'optional';
  status: 'pass' | 'fail' | 'in_progress' | 'pending';
  clauses: Clause[];
}

interface ClauseBreakdownProps {
  standards: Standard[];
  onUpdateClause?: (
    standardId: string,
    clauseId: string,
    updates: Partial<Clause>
  ) => void;
}

export function ClauseBreakdown({ standards, onUpdateClause }: ClauseBreakdownProps) {
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(
    new Set([standards[0]?.standard_id])
  );
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());

  const toggleStandard = (standardId: string) => {
    setExpandedStandards((prev) => {
      const next = new Set(prev);
      if (next.has(standardId)) {
        next.delete(standardId);
      } else {
        next.add(standardId);
      }
      return next;
    });
  };

  const toggleClause = (clauseId: string) => {
    setExpandedClauses((prev) => {
      const next = new Set(prev);
      if (next.has(clauseId)) {
        next.delete(clauseId);
      } else {
        next.add(clauseId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: Clause['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'fail':
        return <XCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'pending':
        return <AlertTriangle className="text-gray-400" size={20} />;
    }
  };

  const getStatusBadge = (status: Standard['status']) => {
    const colors = {
      pass: 'bg-green-100 text-green-700',
      fail: 'bg-red-100 text-red-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-gray-100 text-gray-700',
    };
    return colors[status];
  };

  const getApplicabilityBadge = (applicability: Standard['applicability']) => {
    const colors = {
      required: 'bg-red-100 text-red-700',
      recommended: 'bg-yellow-100 text-yellow-700',
      optional: 'bg-gray-100 text-gray-700',
    };
    return colors[applicability];
  };

  return (
    <div className="space-y-4">
      {standards.map((standard) => {
        const isExpanded = expandedStandards.has(standard.standard_id);
        const passedClauses = standard.clauses.filter((c) => c.status === 'pass').length;
        const totalClauses = standard.clauses.length;
        const compliancePercentage = Math.round((passedClauses / totalClauses) * 100);

        return (
          <Card key={standard.standard_id} padding="none">
            {/* Standard Header */}
            <button
              onClick={() => toggleStandard(standard.standard_id)}
              className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {isExpanded ? (
                      <ChevronDown className="text-gray-400" size={20} />
                    ) : (
                      <ChevronRight className="text-gray-400" size={20} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {standard.standard_id}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicabilityBadge(
                          standard.applicability
                        )}`}
                      >
                        {standard.applicability}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          standard.status
                        )}`}
                      >
                        {standard.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{standard.standard_name}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">Version: {standard.version}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {passedClauses}/{totalClauses} clauses passed
                      </span>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              compliancePercentage >= 80
                                ? 'bg-green-500'
                                : compliancePercentage >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${compliancePercentage}%` }}
                          />
                        </div>
                        <span className="font-medium">{compliancePercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Clauses */}
            {isExpanded && (
              <div className="border-t border-gray-200">
                {standard.clauses.map((clause) => {
                  const clauseKey = `${standard.standard_id}-${clause.clause}`;
                  const isClauseExpanded = expandedClauses.has(clauseKey);

                  return (
                    <div
                      key={clauseKey}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      {/* Clause Header */}
                      <button
                        onClick={() => toggleClause(clauseKey)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {isClauseExpanded ? (
                              <ChevronDown className="text-gray-400" size={16} />
                            ) : (
                              <ChevronRight className="text-gray-400" size={16} />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-mono text-sm font-medium text-gray-700">
                                    {clause.clause}
                                  </span>
                                  {getStatusIcon(clause.status)}
                                </div>
                                <p className="text-sm text-gray-900">{clause.description}</p>
                              </div>

                              {clause.actual_value && clause.required_value && (
                                <div className="text-right text-sm">
                                  <div className="text-gray-500">Required: {clause.required_value}</div>
                                  <div
                                    className={`font-medium ${
                                      clause.status === 'pass'
                                        ? 'text-green-600'
                                        : clause.status === 'fail'
                                          ? 'text-red-600'
                                          : 'text-yellow-600'
                                    }`}
                                  >
                                    Actual: {clause.actual_value}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Clause Details */}
                      {isClauseExpanded && (
                        <div className="p-4 pl-12 bg-gray-50 space-y-4">
                          {/* Requirement Text */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Requirement
                            </h4>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                              {clause.requirement_text}
                            </p>
                          </div>

                          {/* Evidence */}
                          {clause.evidence && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Evidence
                              </h4>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                                {clause.evidence}
                              </p>
                            </div>
                          )}

                          {/* Justification */}
                          {clause.justification && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Justification
                              </h4>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                                {clause.justification}
                              </p>
                            </div>
                          )}

                          {/* Verification Status */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={clause.design_check_completed || false}
                                onChange={() =>
                                  onUpdateClause?.(standard.standard_id, clause.clause, {
                                    design_check_completed: !clause.design_check_completed,
                                  })
                                }
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-700">Design Check</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={clause.test_required || false}
                                onChange={() =>
                                  onUpdateClause?.(standard.standard_id, clause.clause, {
                                    test_required: !clause.test_required,
                                  })
                                }
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-700">Test Required</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={clause.verified || false}
                                onChange={() =>
                                  onUpdateClause?.(standard.standard_id, clause.clause, {
                                    verified: !clause.verified,
                                  })
                                }
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-700">Verified</span>
                            </div>
                          </div>

                          {/* Test Reference */}
                          {clause.test_reference && (
                            <a
                              href={`#test-${clause.test_reference}`}
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <FileText size={16} />
                              View Test: {clause.test_reference}
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
