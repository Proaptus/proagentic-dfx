'use client';

/**
 * Alert Component - Alert banners for engineering applications
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { cn } from '@/lib/utils';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  type LucideIcon,
} from 'lucide-react';
import { type ReactNode, useState, type HTMLAttributes } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  icon?: LucideIcon | ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: ReactNode;
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  error: 'bg-red-50 border-red-200 text-red-900',
};

const iconStyles: Record<AlertVariant, string> = {
  info: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
};

const defaultIcons: Record<AlertVariant, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  actions,
  className,
  ...props
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const IconComponent = icon
    ? typeof icon === 'function'
      ? icon
      : null
    : defaultIcons[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative rounded-lg border p-4',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {IconComponent && typeof icon === 'function' ? (
            <IconComponent className={cn('w-5 h-5', iconStyles[variant])} />
          ) : IconComponent ? (
            <IconComponent className={cn('w-5 h-5', iconStyles[variant])} />
          ) : (
            icon && typeof icon !== 'function' && <span className={iconStyles[variant]}>{icon}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-sm font-semibold mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>

          {/* Actions */}
          {actions && <div className="mt-3 flex gap-2">{actions}</div>}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={cn(
              'flex-shrink-0 inline-flex rounded-lg p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
              variant === 'info' && 'focus:ring-blue-600',
              variant === 'success' && 'focus:ring-green-600',
              variant === 'warning' && 'focus:ring-yellow-600',
              variant === 'error' && 'focus:ring-red-600'
            )}
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * CalculationAlert - Specialized alert for engineering calculations
 */
interface CalculationAlertProps extends Omit<AlertProps, 'variant' | 'children'> {
  calculation: string;
  result: string | number;
  details?: string;
  variant?: AlertVariant;
}

export function CalculationAlert({
  calculation,
  result,
  details,
  variant = 'info',
  title,
  ...props
}: CalculationAlertProps) {
  return (
    <Alert
      variant={variant}
      title={title || 'Calculation Result'}
      {...props}
    >
      <div className="space-y-2">
        <div className="font-mono text-sm bg-white/50 px-3 py-2 rounded border border-current/10">
          {calculation}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">Result:</span>
          <span className="font-mono text-base font-semibold">{result}</span>
        </div>
        {details && <p className="text-sm opacity-90">{details}</p>}
      </div>
    </Alert>
  );
}

/**
 * ComplianceAlert - Specialized alert for compliance warnings
 */
interface ComplianceAlertProps extends Omit<AlertProps, 'variant' | 'children'> {
  standard: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'warning';
  details?: string;
}

export function ComplianceAlert({
  standard,
  requirement,
  status,
  details,
  title,
  ...props
}: ComplianceAlertProps) {
  const variantMap = {
    compliant: 'success' as AlertVariant,
    'non-compliant': 'error' as AlertVariant,
    warning: 'warning' as AlertVariant,
  };

  return (
    <Alert
      variant={variantMap[status]}
      title={title || `${standard} Compliance`}
      {...props}
    >
      <div className="space-y-2">
        <div>
          <span className="font-medium">Requirement: </span>
          <span>{requirement}</span>
        </div>
        <div>
          <span className="font-medium">Status: </span>
          <span className="capitalize font-semibold">{status.replace('-', ' ')}</span>
        </div>
        {details && <p className="text-sm opacity-90 mt-2">{details}</p>}
      </div>
    </Alert>
  );
}

/**
 * ValidationAlert - Specialized alert for validation errors
 */
interface ValidationAlertProps extends Omit<AlertProps, 'variant' | 'children'> {
  errors: Array<{ field: string; message: string }>;
}

export function ValidationAlert({
  errors,
  title,
  ...props
}: ValidationAlertProps) {
  return (
    <Alert
      variant="error"
      title={title || `${errors.length} Validation Error${errors.length > 1 ? 's' : ''}`}
      {...props}
    >
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-sm">
            <span className="font-medium">{error.field}:</span> {error.message}
          </li>
        ))}
      </ul>
    </Alert>
  );
}
