/**
 * Label Component - Enterprise Grade
 * Professional form label with proper typography and states
 *
 * Features:
 * - Clean typography with proper spacing
 * - Required indicator support
 * - Disabled state styling
 * - Optional helper text
 * - WCAG 2.1 AA compliant
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.ComponentProps<'label'> {
  required?: boolean;
  helperText?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, helperText, children, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label
          ref={ref}
          className={cn(
            'text-sm font-medium text-gray-700 leading-none',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            className
          )}
          {...props}
        >
          {children}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
        {helperText && (
          <p className="text-xs text-gray-500 leading-normal">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Label.displayName = 'Label';

export { Label };
