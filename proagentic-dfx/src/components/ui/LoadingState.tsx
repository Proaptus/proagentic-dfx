'use client';

/**
 * Loading State Component
 * REQ-275: Loading states and error handling patterns
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'progress';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  progress?: number;
  className?: string;
}

export function LoadingState({
  variant = 'spinner',
  size = 'md',
  text,
  progress = 0,
  className
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (variant === 'spinner') {
    return (
      <div
        className={cn('flex flex-col items-center justify-center gap-3', className)}
        role="status"
        aria-label={text || 'Loading'}
        aria-live="polite"
      >
        <Loader2 className={cn('animate-spin text-primary-500', sizeClasses[size])} aria-hidden="true" />
        {text && <span className="text-sm text-gray-600">{text}</span>}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div
        className={cn('animate-pulse bg-gray-200 rounded-md', className)}
        role="status"
        aria-label="Loading content"
        aria-live="polite"
      />
    );
  }

  if (variant === 'progress') {
    return (
      <div
        className={cn('w-full', className)}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={text || 'Loading progress'}
      >
        {text && (
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{text}</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
        )}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return null;
}
