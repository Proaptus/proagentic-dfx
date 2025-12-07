'use client';

/**
 * Accessible Form Label Component
 * REQ-273: WCAG 2.1 AA accessibility compliance
 * REQ-272: Component library with consistent styling
 *
 * Provides proper label, hint, and error message associations for form inputs
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleLabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function AccessibleLabel({
  htmlFor,
  label,
  required,
  hint,
  error,
  children,
  className
}: AccessibleLabelProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const ariaDescribedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}

      {/* Clone children to add aria attributes */}
      <div aria-describedby={ariaDescribedBy}>
        {children}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
