'use client';

/**
 * Button Component
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          // Variants with design tokens
          'bg-[rgb(var(--color-primary-600))] text-white hover:bg-[rgb(var(--color-primary-700))] focus:ring-[rgb(var(--color-primary-500))] rounded-[var(--radius-lg)]':
            variant === 'primary',
          'bg-[rgb(var(--color-gray-200))] text-[rgb(var(--color-gray-900))] hover:bg-[rgb(var(--color-gray-300))] focus:ring-[rgb(var(--color-gray-500))] rounded-[var(--radius-lg)]':
            variant === 'secondary',
          'border border-[rgb(var(--color-gray-300))] bg-transparent hover:bg-[rgb(var(--color-gray-50))] focus:ring-[rgb(var(--color-gray-500))] rounded-[var(--radius-lg)]':
            variant === 'outline',
          'bg-transparent hover:bg-[rgb(var(--color-gray-100))] focus:ring-[rgb(var(--color-gray-500))] rounded-[var(--radius-lg)]':
            variant === 'ghost',
          'bg-[rgb(var(--color-error))] text-white hover:bg-[rgb(var(--color-error-dark))] focus:ring-[rgb(var(--color-error))] rounded-[var(--radius-lg)]':
            variant === 'danger',
          // Sizes
          'text-sm px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
          'text-base px-6 py-3': size === 'lg',
          // States
          'opacity-50 cursor-not-allowed': isDisabled,
        },
        className
      )}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      aria-disabled={isDisabled ? 'true' : undefined}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
