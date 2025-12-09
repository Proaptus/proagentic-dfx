/**
 * StandardCard Component
 * Display card for individual compliance standards
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

'use client';

import { CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StandardCardProps {
  standardId: string;
  standardName: string;
  version: string;
  applicability: 'required' | 'recommended' | 'optional';
  status: 'pass' | 'in_progress' | 'pending';
  className?: string;
}

const applicabilityConfig = {
  required: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
  recommended: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
  },
  optional: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
};

const statusConfig = {
  pass: {
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800',
    badgeBorder: 'border-green-200',
    label: 'COMPLIANT',
  },
  in_progress: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
    badgeBorder: 'border-yellow-200',
    label: 'IN PROGRESS',
  },
  pending: {
    icon: AlertTriangle,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-800',
    badgeBorder: 'border-gray-200',
    label: 'PENDING',
  },
};

export function StandardCard({
  standardId,
  standardName,
  version,
  applicability,
  status,
  className,
}: StandardCardProps) {
  const applicabilityStyle = applicabilityConfig[applicability];
  const statusStyle = statusConfig[status];
  const StatusIcon = statusStyle.icon;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg">{standardId}</h4>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {standardName}
          </p>
        </div>
        <div
          className={cn('ml-3 p-2 rounded-full', statusStyle.iconBg)}
          role="img"
          aria-label={`Status: ${statusStyle.label}`}
        >
          <StatusIcon className={statusStyle.iconColor} size={24} />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <span className="text-xs text-gray-600 font-medium">
          Version: <span className="text-gray-900">{version}</span>
        </span>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold border',
            applicabilityStyle.bgColor,
            applicabilityStyle.textColor,
            applicabilityStyle.borderColor
          )}
        >
          {applicability.toUpperCase()}
        </span>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold ml-auto border',
            statusStyle.badgeBg,
            statusStyle.badgeText,
            statusStyle.badgeBorder
          )}
        >
          {statusStyle.label}
        </span>
      </div>
    </div>
  );
}
