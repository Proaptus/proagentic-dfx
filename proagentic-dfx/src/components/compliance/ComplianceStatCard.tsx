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

const variantStyles = {
  default: {
    gradient: 'from-blue-50 to-white',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-600',
    progressColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
  },
  success: {
    gradient: 'from-green-50 to-white',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    valueColor: 'text-green-600',
    progressColor: 'bg-gradient-to-r from-green-500 to-green-600',
  },
  warning: {
    gradient: 'from-yellow-50 to-white',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    valueColor: 'text-yellow-600',
    progressColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
  },
  error: {
    gradient: 'from-red-50 to-white',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    valueColor: 'text-red-600',
    progressColor: 'bg-gradient-to-r from-red-500 to-red-600',
  },
  info: {
    gradient: 'from-purple-50 to-white',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    valueColor: 'text-purple-600',
    progressColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
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
        'bg-gradient-to-br hover:shadow-md transition-shadow',
        styles.gradient,
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
          <div className={cn('text-4xl font-bold', styles.valueColor)}>
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', styles.iconBg)}>
          <Icon className={styles.iconColor} size={32} aria-hidden="true" />
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
