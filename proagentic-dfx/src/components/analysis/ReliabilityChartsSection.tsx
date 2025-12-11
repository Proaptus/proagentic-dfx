'use client';

/**
 * Reliability Charts Section Component
 * Contains Weibull distribution and bathtub curve charts
 */

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface ReliabilityChartsSectionProps {
  weibullData: Array<{ time: number; reliability: number }>;
  bathtubData: Array<{ time: number; failureRate: number }>;
}

export function ReliabilityChartsSection({
  weibullData,
  bathtubData
}: ReliabilityChartsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle>Weibull Reliability Function</CardTitle>
        </CardHeader>
        <div className="space-y-3 p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weibullData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Service Time (hours)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Reliability (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Line
                  type="monotone"
                  dataKey="reliability"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            Weibull distribution models time-to-failure with shape β=2.5 (wear-out phase) and scale η=50,000 hours.
          </div>
        </div>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle>Failure Rate Bathtub Curve</CardTitle>
        </CardHeader>
        <div className="space-y-3 p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bathtubData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Service Time (hours)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Failure Rate (FPM)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} FPM`} />
                <Line
                  type="monotone"
                  dataKey="failureRate"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            Classic bathtub curve: high infant mortality, constant random failures, then wear-out phase. FPM = failures per million hours.
          </div>
        </div>
      </Card>
    </div>
  );
}
