/**
 * Standards Library Panel
 * Displays the complete standards library with regulatory, industry, internal, and customer requirements
 * REQ-084 to REQ-089: Standards library for compliance verification
 */

'use client';

import { useState, useMemo } from 'react';
import {
  Shield,
  Building2,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import type {
  StandardsLibrary,
  RegulatoryStandard,
  IndustryStandard,
  InternalPolicy,
  CustomerRequirement,
  KeyRequirement,
} from './types';

interface StandardsLibraryPanelProps {
  library: StandardsLibrary;
}

type LibraryCategory = 'all' | 'regulatory' | 'industry' | 'internal' | 'customer';
type StandardStatusFilter = 'all' | 'active' | 'superseded' | 'draft';

const CRITICALITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const STATUS_BADGES = {
  active: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  superseded: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
  draft: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
  archived: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: Clock },
  inactive: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: Clock },
};

function RequirementBadge({ requirement }: { requirement: KeyRequirement }) {
  return (
    <div
      className={`px-2 py-1 rounded text-xs border ${CRITICALITY_COLORS[requirement.criticality]}`}
    >
      <span className="font-medium">{requirement.clause || requirement.id}: </span>
      <span>{requirement.summary}</span>
    </div>
  );
}

function RegulatoryStandardCard({
  standard,
  expanded,
  onToggle,
}: {
  standard: RegulatoryStandard;
  expanded: boolean;
  onToggle: () => void;
}) {
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

function IndustryStandardCard({
  standard,
  expanded,
  onToggle,
}: {
  standard: IndustryStandard;
  expanded: boolean;
  onToggle: () => void;
}) {
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

function InternalPolicyCard({
  policy,
  expanded,
  onToggle,
}: {
  policy: InternalPolicy;
  expanded: boolean;
  onToggle: () => void;
}) {
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

function CustomerRequirementCard({
  requirement,
  expanded,
  onToggle,
}: {
  requirement: CustomerRequirement;
  expanded: boolean;
  onToggle: () => void;
}) {
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

export function StandardsLibraryPanel({ library }: StandardsLibraryPanelProps) {
  const [category, setCategory] = useState<LibraryCategory>('all');
  const [statusFilter, setStatusFilter] = useState<StandardStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter and search logic
  const filteredLibrary = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const filterBySearch = <T extends { code?: string; title?: string; description?: string }>(
      items: T[]
    ) => {
      if (!query) return items;
      return items.filter(
        (item) =>
          item.code?.toLowerCase().includes(query) ||
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    };

    const filterByStatus = <T extends { status: string }>(items: T[]) => {
      if (statusFilter === 'all') return items;
      return items.filter((item) => item.status === statusFilter);
    };

    return {
      regulatory:
        category === 'all' || category === 'regulatory'
          ? filterByStatus(filterBySearch(library.regulatory_standards))
          : [],
      industry:
        category === 'all' || category === 'industry'
          ? filterByStatus(filterBySearch(library.industry_standards))
          : [],
      internal:
        category === 'all' || category === 'internal'
          ? filterBySearch(library.internal_policies).filter(
              (p) => statusFilter === 'all' || p.status === statusFilter
            )
          : [],
      customer:
        category === 'all' || category === 'customer'
          ? filterBySearch(library.customer_requirements)
          : [],
    };
  }, [library, category, statusFilter, searchQuery]);

  const totalFiltered =
    filteredLibrary.regulatory.length +
    filteredLibrary.industry.length +
    filteredLibrary.internal.length +
    filteredLibrary.customer.length;

  return (
    <div className="space-y-6">
      {/* Library Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Standards Library</h2>
            <p className="text-gray-600 text-sm mt-1">
              Browse and search all applicable standards, policies, and requirements
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>Last Updated: {library.summary.last_updated}</div>
            <div className="font-medium text-indigo-700">
              {library.summary.total_regulatory +
                library.summary.total_industry +
                library.summary.total_internal_policies +
                library.summary.total_customer_requirements}{' '}
              Total Items
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setCategory(category === 'regulatory' ? 'all' : 'regulatory')}
          className={`p-4 rounded-lg border transition-all ${
            category === 'regulatory'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
        >
          <Shield className="w-6 h-6 text-blue-600 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {library.summary.total_regulatory}
          </div>
          <div className="text-sm text-gray-600">Regulatory Standards</div>
        </button>

        <button
          onClick={() => setCategory(category === 'industry' ? 'all' : 'industry')}
          className={`p-4 rounded-lg border transition-all ${
            category === 'industry'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
              : 'bg-white border-gray-200 hover:border-indigo-300'
          }`}
        >
          <Building2 className="w-6 h-6 text-indigo-600 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {library.summary.total_industry}
          </div>
          <div className="text-sm text-gray-600">Industry Standards</div>
        </button>

        <button
          onClick={() => setCategory(category === 'internal' ? 'all' : 'internal')}
          className={`p-4 rounded-lg border transition-all ${
            category === 'internal'
              ? 'bg-green-50 border-green-300 ring-2 ring-green-200'
              : 'bg-white border-gray-200 hover:border-green-300'
          }`}
        >
          <FileText className="w-6 h-6 text-green-600 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {library.summary.total_internal_policies}
          </div>
          <div className="text-sm text-gray-600">Internal Policies</div>
        </button>

        <button
          onClick={() => setCategory(category === 'customer' ? 'all' : 'customer')}
          className={`p-4 rounded-lg border transition-all ${
            category === 'customer'
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-200'
              : 'bg-white border-gray-200 hover:border-orange-300'
          }`}
        >
          <Users className="w-6 h-6 text-orange-600 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {library.summary.total_customer_requirements}
          </div>
          <div className="text-sm text-gray-600">Customer/OEM Requirements</div>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search standards, codes, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StandardStatusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="superseded">Superseded</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">{totalFiltered} items shown</div>
      </div>

      {/* Regulatory Standards */}
      {filteredLibrary.regulatory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Shield className="w-5 h-5" />
              Regulatory Standards ({filteredLibrary.regulatory.length})
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {filteredLibrary.regulatory.map((standard) => (
              <RegulatoryStandardCard
                key={standard.id}
                standard={standard}
                expanded={expandedItems.has(standard.id)}
                onToggle={() => toggleExpand(standard.id)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Industry Standards */}
      {filteredLibrary.industry.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Building2 className="w-5 h-5" />
              Industry Standards ({filteredLibrary.industry.length})
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {filteredLibrary.industry.map((standard) => (
              <IndustryStandardCard
                key={standard.id}
                standard={standard}
                expanded={expandedItems.has(standard.id)}
                onToggle={() => toggleExpand(standard.id)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Internal Policies */}
      {filteredLibrary.internal.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <FileText className="w-5 h-5" />
              Internal Policies ({filteredLibrary.internal.length})
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {filteredLibrary.internal.map((policy) => (
              <InternalPolicyCard
                key={policy.id}
                policy={policy}
                expanded={expandedItems.has(policy.id)}
                onToggle={() => toggleExpand(policy.id)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Customer Requirements */}
      {filteredLibrary.customer.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Users className="w-5 h-5" />
              Customer/OEM Requirements ({filteredLibrary.customer.length})
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {filteredLibrary.customer.map((req) => (
              <CustomerRequirementCard
                key={req.id}
                requirement={req}
                expanded={expandedItems.has(req.id)}
                onToggle={() => toggleExpand(req.id)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {totalFiltered === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No standards found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
