'use client';

/**
 * ComparisonCard Component
 * Individual design card for side-by-side comparison
 */

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight } from 'lucide-react';
import { DifferenceIndicator } from './DifferenceIndicator';
import { calculateDifferenceIndicator } from '@/lib/utils/comparison';
import type { ReactElement } from 'react';

interface DesignMetric {
  label: string;
  value: number;
  unit: string;
  metricKey: string;
}

interface ComparisonCardProps {
  designId: string;
  color: string;
  index: number;
  metrics: DesignMetric[];
  allDesignsMetrics: Record<string, number[]>;
  onViewDesign: (id: string) => void;
  onExport: (id: string) => void;
}

export function ComparisonCard({
  designId,
  color,
  index,
  metrics,
  allDesignsMetrics,
  onViewDesign,
  onExport,
}: ComparisonCardProps): ReactElement {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Design {designId}</h3>
            <Badge
              variant="secondary"
              className="mt-2"
              style={{
                backgroundColor: `${color}20`,
                color: color,
                borderColor: color,
              }}
            >
              Candidate {index + 1}
            </Badge>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: color }}
            aria-label={`Design ${designId} indicator`}
          >
            {designId}
          </div>
        </div>

        {/* Metrics Grid */}
        <dl className="space-y-3 mb-6">
          {metrics.map((metric) => {
            const allValues = allDesignsMetrics[metric.metricKey] || [];
            const indicator = calculateDifferenceIndicator(
              metric.metricKey,
              metric.value,
              allValues
            );

            return (
              <div
                key={metric.metricKey}
                className="flex justify-between items-center py-2 border-b border-gray-100"
              >
                <dt className="text-sm text-gray-600 font-medium">{metric.label}</dt>
                <dd className="flex items-center gap-2">
                  <DifferenceIndicator {...indicator} />
                  <span className="font-semibold text-gray-900">
                    {metric.unit === '€' ? '€' : ''}
                    {metric.value.toLocaleString()}
                    {metric.unit !== '€' ? ` ${metric.unit}` : ''}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-gray-50"
            onClick={() => onViewDesign(designId)}
          >
            View 3D
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onExport(designId)}
          >
            Export <ArrowRight className="ml-1" size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
