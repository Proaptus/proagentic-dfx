'use client';

/**
 * Progress Component - Progress indicators for engineering applications
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { type HTMLAttributes } from 'react';

/**
 * LinearProgress - Standard progress bar
 */
interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export function LinearProgress({
  value,
  max = 100,
  showLabel = false,
  label,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: LinearProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantStyles = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out',
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * CircularProgress - Circular progress indicator
 */
interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  variant = 'default',
  className,
  ...props
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: '#2563eb', // blue-600
    success: '#16a34a', // green-600
    warning: '#ca8a04', // yellow-600
    error: '#dc2626', // red-600
  };

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * StepProgress - Step-by-step progress indicator
 */
export interface Step {
  id: string;
  label: string;
  description?: string;
  status?: 'pending' | 'current' | 'completed' | 'error';
}

interface StepProgressProps extends HTMLAttributes<HTMLDivElement> {
  steps: Step[];
  currentStep?: number;
  variant?: 'horizontal' | 'vertical';
}

export function StepProgress({
  steps,
  currentStep = 0,
  variant = 'horizontal',
  className,
  ...props
}: StepProgressProps) {
  const getStepStatus = (index: number, step: Step): Step['status'] => {
    if (step.status) return step.status;
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  if (variant === 'vertical') {
    return (
      <div className={cn('space-y-0', className)} {...props}>
        {steps.map((step, index) => {
          const status = getStepStatus(index, step);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative flex gap-4">
              {/* Icon */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                    status === 'completed' &&
                      'bg-green-600 border-green-600 text-white',
                    status === 'current' &&
                      'bg-blue-600 border-blue-600 text-white',
                    status === 'error' && 'bg-red-600 border-red-600 text-white',
                    status === 'pending' && 'bg-white border-gray-300 text-gray-500'
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 h-full min-h-[40px] transition-colors',
                      status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="pt-1.5">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      status === 'current' && 'text-blue-600',
                      status === 'completed' && 'text-gray-900',
                      status === 'error' && 'text-red-600',
                      status === 'pending' && 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal variant
  return (
    <nav aria-label="Progress" className={className} {...props}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index, step);
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                    status === 'completed' &&
                      'bg-green-600 border-green-600 text-white',
                    status === 'current' &&
                      'bg-blue-600 border-blue-600 text-white',
                    status === 'error' && 'bg-red-600 border-red-600 text-white',
                    status === 'pending' && 'bg-white border-gray-300 text-gray-500'
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-semibold whitespace-nowrap',
                      status === 'current' && 'text-blue-600',
                      status === 'completed' && 'text-gray-900',
                      status === 'error' && 'text-red-600',
                      status === 'pending' && 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-gray-500 max-w-[120px]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-colors',
                    status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
