'use client';

/**
 * Standards Card Components
 * Individual card components for displaying different types of standards
 */

import {
  Shield,
  Building2,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type {
  RegulatoryStandard,
  IndustryStandard,
  InternalPolicy,
  CustomerRequirement,
  KeyRequirement,
} from './types';
import { CRITICALITY_COLORS, STATUS_BADGES } from './standards-library.types';

// ============================================================================
// Requirement Badge Component
// ============================================================================

export function RequirementBadge({ requirement }: { requirement: KeyRequirement }) {
  return (
    <div
      className={`px-2 py-1 rounded text-xs border ${CRITICALITY_COLORS[requirement.criticality]}`}
    >
      <span className="font-medium">{requirement.clause || requirement.id}: </span>
      <span>{requirement.summary}</span>
    </div>
  );
}

// ============================================================================
// Regulatory Standard Card
// ============================================================================

interface RegulatoryStandardCardProps {
  standard: RegulatoryStandard;
  expanded: boolean;
  onToggle: () => void;
}

export function RegulatoryStandardCard({
  standard,
  expanded,
  onToggle,
}: RegulatoryStandardCardProps) {
  const StatusIcon = STATUS_BADGES[standard.status].icon;

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 text-left">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{standard.code}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_BADGES[standard.status].color}`}
              >
                <StatusIcon className="w-3 h-3 inline mr-1" />
                {standard.status}
              </span>
              {standard.is_mandatory && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">
                  Mandatory
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{standard.title}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Full Title:</span>
              <p className="text-gray-900 text-xs mt-1">{standard.full_title}</p>
            </div>
            <div>
              <span className="text-gray-500">Version:</span>
              <p className="text-gray-900 font-medium">{standard.version}</p>
            </div>
            <div>
              <span className="text-gray-500">Scope:</span>
              <p className="text-gray-900 text-xs mt-1">{standard.scope}</p>
            </div>
            <div>
              <span className="text-gray-500">Clauses:</span>
              <p className="text-gray-900 font-medium">{standard.clauses_count}</p>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-gray-500">Applicability:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {standard.applicability.tank_types?.map((type) => (
                <span
                  key={type}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                >
                  {type}
                </span>
              ))}
              {standard.applicability.regions?.map((region) => (
                <span
                  key={region}
                  className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs"
                >
                  {region}
                </span>
              ))}
              {standard.applicability.pressure_range && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                  {standard.applicability.pressure_range.min}-
                  {standard.applicability.pressure_range.max} bar
                </span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-gray-500">Key Requirements:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {standard.key_requirements.map((req, idx) => (
                <RequirementBadge key={idx} requirement={req} />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-gray-500">Certification Bodies:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {standard.certification_bodies.map((body) => (
                <span
                  key={body}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {body}
                </span>
              ))}
            </div>
          </div>

          {standard.superseded_by && (
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <AlertCircle className="w-4 h-4 inline text-yellow-600 mr-1" />
              <span className="text-yellow-800">
                Superseded by: {standard.superseded_by}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Industry Standard Card
// ============================================================================

interface IndustryStandardCardProps {
  standard: IndustryStandard;
  expanded: boolean;
  onToggle: () => void;
}

export function IndustryStandardCard({
  standard,
  expanded,
  onToggle,
}: IndustryStandardCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 text-left">
          <Building2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{standard.code}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_BADGES[standard.status].color}`}
              >
                {standard.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{standard.title}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Version:</span>
              <p className="text-gray-900 font-medium">{standard.version}</p>
            </div>
            <div>
              <span className="text-gray-500">Clauses:</span>
              <p className="text-gray-900 font-medium">{standard.clauses_count}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Scope:</span>
              <p className="text-gray-900 text-xs mt-1">{standard.scope}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Description:</span>
              <p className="text-gray-900 text-xs mt-1">{standard.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Internal Policy Card
// ============================================================================

interface InternalPolicyCardProps {
  policy: InternalPolicy;
  expanded: boolean;
  onToggle: () => void;
}

export function InternalPolicyCard({
  policy,
  expanded,
  onToggle,
}: InternalPolicyCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 text-left">
          <FileText className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{policy.code}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_BADGES[policy.status].color}`}
              >
                {policy.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{policy.title}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Owner:</span>
              <p className="text-gray-900 font-medium">{policy.owner}</p>
            </div>
            <div>
              <span className="text-gray-500">Version:</span>
              <p className="text-gray-900 font-medium">{policy.version}</p>
            </div>
            <div>
              <span className="text-gray-500">Effective Date:</span>
              <p className="text-gray-900 font-medium">{policy.effective_date}</p>
            </div>
            <div>
              <span className="text-gray-500">Review Date:</span>
              <p className="text-gray-900 font-medium">{policy.review_date}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Description:</span>
              <p className="text-gray-900 text-xs mt-1">{policy.description}</p>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-gray-500">Policy Requirements:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {policy.requirements.map((req, idx) => (
                <RequirementBadge key={idx} requirement={req} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Customer Requirement Card
// ============================================================================

interface CustomerRequirementCardProps {
  requirement: CustomerRequirement;
  expanded: boolean;
  onToggle: () => void;
}

export function CustomerRequirementCard({
  requirement,
  expanded,
  onToggle,
}: CustomerRequirementCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 text-left">
          <Users className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{requirement.code}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-orange-50 text-orange-700 border border-orange-200">
                {requirement.customer}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{requirement.title}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Customer:</span>
              <p className="text-gray-900 font-medium">{requirement.customer}</p>
            </div>
            <div>
              <span className="text-gray-500">Version:</span>
              <p className="text-gray-900 font-medium">{requirement.version}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Scope:</span>
              <p className="text-gray-900 text-xs mt-1">{requirement.scope}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Description:</span>
              <p className="text-gray-900 text-xs mt-1">{requirement.description}</p>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-gray-500">OEM Requirements:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {requirement.requirements.map((req, idx) => (
                <RequirementBadge key={idx} requirement={req} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
