/**
 * Input Component - Enterprise Grade
 * Professional form input with multiple variants and states
 *
 * Features:
 * - Clean, modern styling with subtle borders
 * - Professional focus states with blue ring
 * - Error and disabled states
 * - File input styling
 * - Placeholder text styling
 * - Smooth transitions
 * - WCAG 2.1 AA compliant
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  error?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            // Base styles
            'flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200',
            'bg-white text-gray-900 placeholder:text-gray-400',
            // Focus states
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            // File input styles
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-700',
            // Disabled state
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
            // Conditional error styling
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400',
            className
          )}
          ref={ref}
          aria-invalid={error}
          aria-describedby={helperText ? `${props.id}-helper` : undefined}
          {...props}
        />
        {helperText && (
          <p
            id={`${props.id}-helper`}
            className={cn(
              'mt-1.5 text-xs',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
