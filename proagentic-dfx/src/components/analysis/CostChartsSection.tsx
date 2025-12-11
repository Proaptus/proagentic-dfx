'use client';

/**
 * Cost Charts Section Components
 * Manufacturing process breakdown and learning curve charts
 */

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrencyLabel, type CurrencyCode } from '@/lib/utils/currency';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Factory } from 'lucide-react';
import type { ManufacturingProcess } from './cost-analysis.types';

interface ManufacturingChartProps {
  processes: ManufacturingProcess[];
  currency: CurrencyCode;
}

export function ManufacturingProcessChart({ processes, currency }: ManufacturingChartProps) {
  const totalTime = processes.reduce((sum, p) => sum + p.time_min, 0);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory size={18} />
          Manufacturing Process Breakdown
        </CardTitle>
      </CardHeader>
      <div className="space-y-4 p-4">
        <div className="h-64" data-testid="manufacturing-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="process" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={80} />
              <YAxis yAxisId="left" label={{ value: 'Time (minutes)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: formatCurrencyLabel('Cost', currency), angle: 90, position: 'insideRight' }} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="time_min" fill="#10B981" name="Time (min)" />
              <Bar yAxisId="right" dataKey="cost_eur" fill="#3B82F6" name={formatCurrencyLabel('Cost', currency)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          Total manufacturing time: {totalTime} minutes per tank.
          Filament winding is the most time-intensive and labor-costly process, accounting for 50% of direct labor costs.
        </div>
      </div>
    </Card>
  );
}

interface LearningCurveChartProps {
  data: Array<{ batch: number; cost_multiplier: number }>;
}

export function LearningCurveChart({ data }: LearningCurveChartProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Learning Curve Effect (Manufacturing)</CardTitle>
      </CardHeader>
      <div className="space-y-4 p-4">
        <div className="h-56" data-testid="learning-curve">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="batch" label={{ value: 'Production Batch (#)', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 11 }} />
              <YAxis label={{ value: 'Cost Multiplier', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} domain={[0.8, 2.6]} />
              <Tooltip />
              <Line type="monotone" dataKey="cost_multiplier" stroke="#10B981" strokeWidth={2} name="Cost Multiplier" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          Manufacturing costs decrease with experience due to process optimization, reduced defect rates, and improved tooling.
          First batch costs 2.5× baseline; stabilizes after ~50 batches. Learning rate: 85% (15% reduction per doubling of cumulative production).
        </div>
      </div>
    </Card>
  );
}
