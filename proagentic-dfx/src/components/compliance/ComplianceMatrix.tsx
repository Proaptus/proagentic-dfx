/**
 * ComplianceMatrix Component
 * REQ-084 to REQ-089: Compliance matrix with filtering and export
 * REQ-272: Component library with consistent styling
 */

'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface MatrixRow {
  requirement_id: string;
  standard: string;
  clause: string;
  description: string;
  design_check: 'complete' | 'incomplete' | 'not_applicable';
  test_required: boolean;
  verified: 'yes' | 'no' | 'pending';
  status: 'pass' | 'fail' | 'warning' | 'pending';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface ComplianceMatrixProps {
  requirements: MatrixRow[];
  onExport?: (format: 'pdf' | 'excel') => void;
}

type FilterStatus = 'all' | 'pass' | 'fail' | 'warning' | 'pending';
type FilterVerification = 'all' | 'verified' | 'unverified' | 'pending';

export function ComplianceMatrix({ requirements, onExport }: ComplianceMatrixProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterVerification, setFilterVerification] = useState<FilterVerification>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      // Status filter
      if (filterStatus !== 'all' && req.status !== filterStatus) {
        return false;
      }

      // Verification filter
      if (filterVerification !== 'all') {
        if (filterVerification === 'verified' && req.verified !== 'yes') {
          return false;
        }
        if (filterVerification === 'unverified' && req.verified !== 'no') {
          return false;
        }
        if (filterVerification === 'pending' && req.verified !== 'pending') {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          req.requirement_id.toLowerCase().includes(query) ||
          req.description.toLowerCase().includes(query) ||
          req.standard.toLowerCase().includes(query) ||
          req.clause.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [requirements, filterStatus, filterVerification, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: requirements.length,
      passed: requirements.filter((r) => r.status === 'pass').length,
      failed: requirements.filter((r) => r.status === 'fail').length,
      warning: requirements.filter((r) => r.status === 'warning').length,
      pending: requirements.filter((r) => r.status === 'pending').length,
      verified: requirements.filter((r) => r.verified === 'yes').length,
      critical: requirements.filter((r) => r.priority === 'critical').length,
    };
  }, [requirements]);

  const handleExportCSV = () => {
    const headers = [
      'Requirement ID',
      'Standard',
      'Clause',
      'Description',
      'Design Check',
      'Test Required',
      'Verified',
      'Status',
      'Priority',
    ];

    const rows = filteredRequirements.map((req) => [
      req.requirement_id,
      req.standard,
      req.clause,
      req.description,
      req.design_check,
      req.test_required ? 'Yes' : 'No',
      req.verified,
      req.status,
      req.priority,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-matrix-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: MatrixRow['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'fail':
        return <XCircle className="text-red-500" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={18} />;
      case 'pending':
        return <Clock className="text-gray-400" size={18} />;
    }
  };

  const getPriorityBadge = (priority: MatrixRow['priority']) => {
    const colors = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-gray-100 text-gray-700',
    };
    return colors[priority];
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-500">Total Requirements</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Passed</div>
          <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
          <div className="text-xs text-gray-500">
            {Math.round((stats.passed / stats.total) * 100)}%
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Verified</div>
          <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
          <div className="text-xs text-gray-500">
            {Math.round((stats.verified / stats.total) * 100)}%
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Critical Issues</div>
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="warning">Warning</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Verification:</span>
              <select
                value={filterVerification}
                onChange={(e) =>
                  setFilterVerification(e.target.value as FilterVerification)
                }
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Search requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm w-64"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              onClick={() => onExport?.('excel')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download size={16} />
              Excel
            </button>
            <button
              onClick={() => onExport?.('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>
      </Card>

      {/* Matrix Table */}
      <Card padding="none">
        <CardHeader className="p-4">
          <CardTitle>Compliance Matrix</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredRequirements.length} of {requirements.length} requirements
          </p>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-t border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Standard / Clause
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Description
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">
                  Design Check
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">
                  Test Required
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">
                  Verified
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No requirements match the current filters
                  </td>
                </tr>
              ) : (
                filteredRequirements.map((req) => (
                  <tr
                    key={req.requirement_id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-mono text-xs">{req.requirement_id}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{req.standard}</div>
                      <div className="text-xs text-gray-500">{req.clause}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700 max-w-md">
                      {req.description}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {req.design_check === 'complete' ? (
                        <CheckCircle className="inline text-green-500" size={18} />
                      ) : req.design_check === 'incomplete' ? (
                        <XCircle className="inline text-red-500" size={18} />
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {req.test_required ? (
                        <CheckCircle className="inline text-blue-500" size={18} />
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {req.verified === 'yes' ? (
                        <CheckCircle className="inline text-green-500" size={18} />
                      ) : req.verified === 'no' ? (
                        <XCircle className="inline text-red-500" size={18} />
                      ) : (
                        <Clock className="inline text-gray-400" size={18} />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusIcon(req.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                          req.priority
                        )}`}
                      >
                        {req.priority}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
