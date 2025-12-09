/**
 * ComplianceAlert Component
 * Alert messages for compliance status (pass/fail/warning)
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

'use client';

import { AlertTriangle, CheckCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComplianceAlertProps {
  status: 'pass' | 'fail' | 'warning';
  title: string;
  message: string;
  issueCount?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  className?: string;
}

const statusConfig: Record<
  'pass' | 'fail' | 'warning',
  {
    icon: LucideIcon;
    bgColor: string;
    borderColor: string;
    iconBgColor: string;
    iconColor: string;
    titleColor: string;
    messageColor: string;
    primaryButtonColor: string;
    secondaryButtonColor: string;
  }
> = {
  pass: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    messageColor: 'text-green-800',
    primaryButtonColor:
      'bg-green-600 text-white hover:bg-green-700 border-2 border-green-600',
    secondaryButtonColor:
      'bg-white text-green-700 border-2 border-green-300 hover:bg-green-50',
  },
  fail: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    iconBgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    messageColor: 'text-red-800',
    primaryButtonColor:
      'bg-red-600 text-white hover:bg-red-700 border-2 border-red-600',
    secondaryButtonColor:
      'bg-white text-red-700 border-2 border-red-300 hover:bg-red-50',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    iconBgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-900',
    messageColor: 'text-yellow-800',
    primaryButtonColor:
      'bg-yellow-600 text-white hover:bg-yellow-700 border-2 border-yellow-600',
    secondaryButtonColor:
      'bg-white text-yellow-700 border-2 border-yellow-300 hover:bg-yellow-50',
  },
};

export function ComplianceAlert({
  status,
  title,
  message,
  issueCount,
  actions,
  className,
}: ComplianceAlertProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  // Format message with issue count if provided
  const formattedMessage =
    issueCount !== undefined
      ? message.replace(
          '{count}',
          `${issueCount} critical compliance issue${issueCount !== 1 ? 's' : ''}`
        )
      : message;

  return (
    <div
      className={cn(
        'border-l-4 rounded-xl p-6 shadow-sm',
        config.bgColor,
        config.borderColor,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className={cn('p-3 rounded-full', config.iconBgColor)}>
          <Icon className={config.iconColor} size={28} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className={cn('text-xl font-bold mb-2', config.titleColor)}>
            {title}
          </h3>
          <p className={cn('mb-4', config.messageColor)}>
            {formattedMessage}
          </p>
          {actions && actions.length > 0 && (
            <div className="flex gap-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={cn(
                    'px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm',
                    action.variant === 'secondary'
                      ? config.secondaryButtonColor
                      : config.primaryButtonColor
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
