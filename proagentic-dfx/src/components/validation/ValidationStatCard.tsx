'use client';

import { Card } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * ValidationStatCard - Reusable card component for validation statistics
 * Extracted from ValidationScreen for reusability and maintainability
 */

interface ValidationStatCardProps {
  label: string;
  value: string | number;
  sublabel?: ReactNode;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  valueColor?: string;
}

export function ValidationStatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconBgColor,
  iconColor,
  valueColor = 'text-gray-900',
}: ValidationStatCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
            {sublabel && (
              <div className="text-xs text-gray-500 mt-1">{sublabel}</div>
            )}
          </div>
          <div className={`${iconBgColor} p-3 rounded-lg`}>
            <Icon className={iconColor} size={24} />
          </div>
        </div>
      </div>
    </Card>
  );
}
