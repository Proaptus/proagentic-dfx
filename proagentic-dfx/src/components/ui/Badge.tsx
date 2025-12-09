'use client';

/**
 * Badge Component - Status badges for engineering applications
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import { type ReactNode, type HTMLAttributes } from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pass'
  | 'fail'
  | 'pending'
  | 'primary'
  | 'secondary';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: LucideIcon | ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-blue-100 text-blue-700 border-blue-200',
  secondary: 'bg-purple-100 text-purple-700 border-purple-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  pass: 'bg-green-100 text-green-700 border-green-200',
  fail: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

const iconSizeStyles: Record<BadgeSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const defaultIcons: Partial<Record<BadgeVariant, LucideIcon>> = {
  success: CheckCircle2,
  pass: CheckCircle2,
  error: XCircle,
  fail: XCircle,
  warning: AlertTriangle,
  info: Info,
  pending: Circle,
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  className,
  ...props
}: BadgeProps) {
  const IconComponent = icon
    ? typeof icon === 'function'
      ? icon
      : null
    : defaultIcons[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full',
            size === 'sm' && 'w-1.5 h-1.5',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-2.5 h-2.5',
            variant === 'success' && 'bg-green-600',
            variant === 'pass' && 'bg-green-600',
            variant === 'error' && 'bg-red-600',
            variant === 'fail' && 'bg-red-600',
            variant === 'warning' && 'bg-yellow-600',
            variant === 'info' && 'bg-blue-600',
            variant === 'pending' && 'bg-gray-600',
            variant === 'default' && 'bg-gray-600',
            variant === 'primary' && 'bg-blue-600',
            variant === 'secondary' && 'bg-purple-600'
          )}
        />
      )}
      {IconComponent && typeof icon === 'function' ? (
        <IconComponent className={iconSizeStyles[size]} />
      ) : IconComponent ? (
        <IconComponent className={iconSizeStyles[size]} />
      ) : (
        icon && typeof icon !== 'function' && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </span>
  );
}

/**
 * StatusBadge - Specialized badge for pass/fail/warning status
 */
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'pass' | 'fail' | 'warning' | 'pending';
}

export function StatusBadge({ status, children, ...props }: StatusBadgeProps) {
  const labels = {
    pass: children || 'Pass',
    fail: children || 'Fail',
    warning: children || 'Warning',
    pending: children || 'Pending',
  };

  return (
    <Badge variant={status} {...props}>
      {labels[status]}
    </Badge>
  );
}

/**
 * PriorityBadge - Specialized badge for priority indicators
 */
interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export function PriorityBadge({
  priority,
  children,
  ...props
}: PriorityBadgeProps) {
  const variants: Record<PriorityBadgeProps['priority'], BadgeVariant> = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    critical: 'error',
  };

  const labels = {
    low: children || 'Low',
    medium: children || 'Medium',
    high: children || 'High',
    critical: children || 'Critical',
  };

  return (
    <Badge variant={variants[priority]} {...props}>
      {labels[priority]}
    </Badge>
  );
}

/**
 * ComplianceBadge - Specialized badge for compliance status
 */
interface ComplianceBadgeProps extends Omit<BadgeProps, 'variant'> {
  compliant: boolean;
}

export function ComplianceBadge({
  compliant,
  children,
  ...props
}: ComplianceBadgeProps) {
  return (
    <Badge variant={compliant ? 'pass' : 'fail'} {...props}>
      {children || (compliant ? 'Compliant' : 'Non-Compliant')}
    </Badge>
  );
}
