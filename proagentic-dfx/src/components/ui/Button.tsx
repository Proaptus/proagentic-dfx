'use client';

/**
 * Button Component - Enterprise Grade
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 *
 * Features:
 * - Multiple variants with professional depth and gradients
 * - Size variants (sm, md, lg, icon)
 * - Loading states with spinner
 * - Icon support with proper spacing
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Smooth transitions and hover effects
 */

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  loading,
  icon,
  iconPosition = 'left',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Base classes applied to all buttons
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles with enterprise-grade polish - Professional black/white theme
  const variantClasses = {
    primary: 'bg-gray-900 text-white shadow-sm hover:bg-gray-800 hover:shadow-md active:bg-gray-700 active:shadow-sm focus:ring-gray-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 focus:ring-gray-500',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 focus:ring-gray-500',
    destructive: 'bg-gray-800 text-white shadow-sm hover:bg-gray-700 hover:shadow-md active:bg-gray-600 active:shadow-sm focus:ring-gray-500',
    success: 'bg-gray-900 text-white shadow-sm hover:bg-gray-800 hover:shadow-md active:bg-gray-700 active:shadow-sm focus:ring-gray-500',
    outline: 'border-2 border-gray-900 text-gray-900 bg-transparent hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500',
    link: 'text-gray-900 hover:text-gray-700 hover:underline focus:ring-gray-500 bg-transparent p-0 shadow-none',
  };

  // Size styles with proper spacing and border radius
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-6 py-3 rounded-lg gap-2',
    icon: 'h-9 w-9 p-0 rounded-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      aria-disabled={isDisabled ? 'true' : undefined}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
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
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
}
