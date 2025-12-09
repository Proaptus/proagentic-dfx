/**
 * Checkbox Component - Enterprise Grade
 * Professional checkbox with smooth animations and states
 *
 * Features:
 * - Clean, modern styling with blue accent
 * - Smooth check animation
 * - Professional focus states with ring
 * - Disabled and hover states
 * - WCAG 2.1 AA compliant
 * - Proper ARIA attributes
 */

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ id, checked = false, onCheckedChange, disabled = false, className, label }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const checkboxElement = (
      <button
        id={id}
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          // Base styles
          'peer h-5 w-5 shrink-0 rounded border-2 transition-all duration-200',
          // Focus states
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          // Checked state
          checked
            ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'
            : 'bg-white border-gray-300 hover:border-gray-400',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        {checked && (
          <Check
            className="h-3.5 w-3.5 stroke-[3]"
            strokeWidth={3}
          />
        )}
      </button>
    );

    if (label) {
      return (
        <div className="flex items-center gap-2">
          {checkboxElement}
          <label
            htmlFor={id}
            className="text-sm font-medium text-gray-700 cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          >
            {label}
          </label>
        </div>
      );
    }

    return checkboxElement;
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
