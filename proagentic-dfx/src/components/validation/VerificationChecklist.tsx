'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle2, Circle, AlertCircle, User, CheckSquare } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'automated' | 'manual';
  item: string;
  status: 'pass' | 'fail' | 'pending' | 'n/a';
  details?: string;
  responsible?: string;
  date_completed?: string;
}

interface ApprovalSignoff {
  role: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  date?: string;
  comments?: string;
}

interface VerificationChecklistProps {
  verificationItems?: ChecklistItem[];
  approvals?: ApprovalSignoff[];
}

export function VerificationChecklist({ verificationItems = [], approvals = [] }: VerificationChecklistProps) {
  const [_expandedCategory, _setExpandedCategory] = useState<'automated' | 'manual' | null>(
    'automated'
  );

  const automatedItems = verificationItems.filter((item) => item.category === 'automated');
  const manualItems = verificationItems.filter((item) => item.category === 'manual');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'approved':
        return <CheckCircle2 size={18} className="text-green-600" />;
      case 'fail':
      case 'rejected':
        return <AlertCircle size={18} className="text-red-600" />;
      case 'pending':
        return <Circle size={18} className="text-yellow-600" />;
      case 'n/a':
        return <Circle size={18} className="text-gray-400" />;
      default:
        return <Circle size={18} className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pass: 'bg-green-100 text-green-700',
      approved: 'bg-green-100 text-green-700',
      fail: 'bg-red-100 text-red-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      'n/a': 'bg-gray-100 text-gray-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const automatedPass = automatedItems.filter((i) => i.status === 'pass').length;
  const manualPass = manualItems.filter((i) => i.status === 'pass').length;
  const approvalsComplete = approvals.filter((a) => a.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <div className="p-4">
            <div className="text-sm text-green-600 font-medium mb-1">Automated Checks</div>
            <div className="text-2xl font-bold text-green-900">
              {automatedPass}/{automatedItems.length}
            </div>
            <div className="text-xs text-green-700 mt-1">Passed</div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <div className="p-4">
            <div className="text-sm text-yellow-600 font-medium mb-1">Manual Verification</div>
            <div className="text-2xl font-bold text-yellow-900">
              {manualPass}/{manualItems.length}
            </div>
            <div className="text-xs text-yellow-700 mt-1">Complete</div>
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">Approvals</div>
            <div className="text-2xl font-bold text-blue-900">
              {approvalsComplete}/{approvals.length}
            </div>
            <div className="text-xs text-blue-700 mt-1">Signed Off</div>
          </div>
        </Card>
      </div>

      {/* Automated Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare size={20} className="text-green-600" />
            Automated Design Checks
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="space-y-2">
            {automatedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.item}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  {item.details && (
                    <div className="text-sm text-gray-600 mt-1">{item.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Manual Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            Manual Verification Items
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="space-y-2">
            {manualItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.item}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    {item.responsible && <span>Responsible: {item.responsible}</span>}
                    {item.date_completed && <span>Completed: {item.date_completed}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Approval Sign-offs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-purple-600" />
            Design Approval Sign-offs
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="space-y-3">
            {approvals.map((approval, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  approval.status === 'approved'
                    ? 'bg-green-50 border-green-200'
                    : approval.status === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(approval.status)}
                    <div>
                      <div className="font-medium text-gray-900">{approval.role}</div>
                      <div className="text-sm text-gray-600">{approval.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusBadge(approval.status)}`}>
                      {approval.status.toUpperCase()}
                    </span>
                    {approval.date && (
                      <div className="text-xs text-gray-500 mt-1">{approval.date}</div>
                    )}
                  </div>
                </div>
                {approval.comments && (
                  <div className="mt-2 text-sm text-gray-700 italic pl-9">
                    &ldquo;{approval.comments}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-900 mb-2">
              <AlertCircle size={18} />
              <span className="font-medium">Pending Approvals</span>
            </div>
            <p className="text-sm text-orange-700">
              Design cannot proceed to manufacturing until all sign-offs are complete. Priority
              items: Manufacturing validation and Safety risk assessment.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
