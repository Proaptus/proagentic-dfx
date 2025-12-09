/**
 * ComplianceStatCard Component
 * Reusable card for displaying compliance statistics
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

'use client';

import { Card } from '@/components/ui/Card';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComplianceStatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  progress?: {
    value: number;
    max?: number;
    showBar?: boolean;
  };
  className?: string;
}

// Professional neutral styling - consistent with StatCard
const variantStyles = {
  default: {
    gradient: '',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    valueColor: 'text-gray-900',
    progressColor: 'bg-gray-500',
  },
  success: {
    gradient: '',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    valueColor: 'text-gray-900',
    progressColor: 'bg-gray-500',
  },
  warning: {
    gradient: '',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    valueColor: 'text-gray-900',
    progressColor: 'bg-gray-500',
  },
  error: {
    gradient: '',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    valueColor: 'text-gray-900',
    progressColor: 'bg-gray-500',
  },
  info: {
    gradient: '',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    valueColor: 'text-gray-900',
    progressColor: 'bg-gray-500',
  },
};

export function ComplianceStatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  progress,
  className,
}: ComplianceStatCardProps) {
  const styles = variantStyles[variant];
  const percentage = progress
    ? Math.min(Math.max((progress.value / (progress.max ?? 100)) * 100, 0), 100)
    : 0;

  return (
    <Card
      className={cn(
        'bg-white border border-gray-200 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
          <div className={cn('text-2xl font-semibold', styles.valueColor)}>
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', styles.iconBg)}>
          <Icon className={styles.iconColor} size={20} aria-hidden="true" />
        </div>
      </div>

      {progress?.showBar && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span className="font-medium">{Math.round(percentage)}%</span>
          </div>
          <div
            className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner"
            role="progressbar"
            aria-valuenow={progress.value}
            aria-valuemin={0}
            aria-valuemax={progress.max ?? 100}
            aria-label={`${label} progress`}
          >
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                styles.progressColor
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
