'use client';

/**
 * StatCard Component
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 *
 * A reusable card component for displaying key metrics and statistics.
 */

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  /** The icon to display */
  icon: LucideIcon;
  /** The main value to display */
  value: string | number;
  /** The unit of measurement (e.g., "MPa", "°C") */
  unit?: string;
  /** The label describing the metric */
  label: string;
  /** Optional badge content (e.g., safety margin percentage) */
  badge?: ReactNode;
  /** Optional color scheme for the icon background */
  iconColor?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  /** Additional CSS classes */
  className?: string;
}

const iconColorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
};

export function StatCard({
  icon: Icon,
  value,
  unit,
  label,
  badge,
  iconColor = 'blue',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200 p-5',
        className
      )}
      role="article"
      aria-label={`${label}: ${value}${unit ? ` ${unit}` : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            iconColorClasses[iconColor]
          )}
          aria-hidden="true"
        >
          <Icon size={20} />
        </div>
        {badge && <div>{badge}</div>}
      </div>
      <div className="text-3xl font-bold text-gray-900">
        {value}
        {unit && (
          <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        )}
      </div>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  );
}
