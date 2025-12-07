'use client';

/**
 * Error State Component
 * REQ-275: Loading states and error handling patterns
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { AlertCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  type?: 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorState({
  type = 'error',
  title,
  message,
  action,
  className
}: ErrorStateProps) {
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: AlertCircle,
  };

  const colors = {
    error: 'text-red-500 bg-red-50 border-red-200',
    warning: 'text-amber-500 bg-amber-50 border-amber-200',
    info: 'text-blue-500 bg-blue-50 border-blue-200',
  };

  const Icon = icons[type];

  return (
    <div
      className={cn('flex items-start gap-4 p-4 rounded-lg border', colors[type], className)}
      role="alert"
      aria-live="polite"
    >
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        {message && <p className="mt-1 text-sm opacity-80">{message}</p>}
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
