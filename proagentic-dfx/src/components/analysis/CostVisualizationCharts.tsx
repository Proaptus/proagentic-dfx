'use client';

/**
 * Cost Visualization Charts
 * Pie charts, line charts, scatter plots, and tables for cost analysis
 */

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatCurrencyLabel, type CurrencyCode } from '@/lib/utils/currency';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingDown, Package } from 'lucide-react';
import { COST_COLORS, type ProductionVolume } from './cost-analysis.types';
import type { DesignCost } from '@/lib/types';

// ============================================================================
// Cost Breakdown Pie Chart
// ============================================================================

interface CostBreakdownChartProps {
  breakdown: DesignCost['breakdown'];
  currency: CurrencyCode;
}

export function CostBreakdownChart({ breakdown, currency }: CostBreakdownChartProps) {
  const totalCost = breakdown.reduce((sum, b) => sum + b.cost_eur, 0);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
      </CardHeader>
      <div className="p-4">
        <div className="flex gap-8">
          {/* Pie Chart */}
          <div className="w-64 h-64 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown.map((b) => ({
                    name: b.component,
                    value: b.cost_eur,
                    percentage: b.percentage
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {breakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COST_COLORS[index % COST_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value, currency), 'Cost']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend - Right Side */}
          <div className="flex-1 grid grid-cols-2 gap-2 content-start">
            {breakdown.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: COST_COLORS[index % COST_COLORS.length] }}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{item.component}</div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(item.cost_eur, currency)} ({item.percentage}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Total Cost</span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(totalCost, currency)}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Production Volume Sensitivity Chart
// ============================================================================

interface VolumeSensitivityChartProps {
  data: Array<{ label: string; unit_cost: number; volume: number }>;
  currentVolume: ProductionVolume;
  baselineCost: number;
  currency: CurrencyCode;
}

export function VolumeSensitivityChart({
  data,
  currentVolume: _currentVolume,
  baselineCost,
  currency
}: VolumeSensitivityChartProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown size={18} />
          Production Volume Sensitivity
        </CardTitle>
      </CardHeader>
      <div className="space-y-4 p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                label={{ value: 'Production Volume (units/year)', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: formatCurrencyLabel('Unit Cost', currency), angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="unit_cost"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Unit Cost"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-gray-50 rounded transition-all hover:bg-gray-100">
            <div className="text-xs text-gray-500">@ 1,000 units/year</div>
            <div className="font-mono font-semibold">{formatCurrency(baselineCost * 1.2, currency)}</div>
            <div className="text-xs text-red-600">+20% vs baseline</div>
          </div>
          <div className="p-3 bg-blue-50 rounded border-2 border-blue-500 transition-all">
            <div className="text-xs text-gray-600">@ 5,000 units/year</div>
            <div className="font-mono font-semibold text-blue-700">{formatCurrency(baselineCost, currency)}</div>
            <div className="text-xs text-blue-600">Current baseline</div>
          </div>
          <div className="p-3 bg-gray-50 rounded transition-all hover:bg-gray-100">
            <div className="text-xs text-gray-500">@ 50,000 units/year</div>
            <div className="font-mono font-semibold">{formatCurrency(baselineCost * 0.68, currency)}</div>
            <div className="text-xs text-green-600">-32% vs baseline</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Weight-Cost Trade-off Chart
// ============================================================================

interface WeightCostTradeoffChartProps {
  data: Array<{ label: string; weight: number; cost: number }>;
  currency: CurrencyCode;
}

export function WeightCostTradeoffChart({ data, currency }: WeightCostTradeoffChartProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package size={18} />
          Weight-Cost Trade-off Analysis
        </CardTitle>
      </CardHeader>
      <div className="space-y-3 p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                dataKey="weight"
                name="Weight"
                unit=" kg"
                domain={[70, 90]}
                label={{ value: 'Tank Weight (kg)', position: 'insideBottom', offset: -10 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="cost"
                name="Cost"
                unit={` ${currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£'}`}
                label={{ value: formatCurrencyLabel('Unit Cost', currency), angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: number, name: string) =>
                  name === 'weight' ? `${value} kg` : formatCurrency(value, currency)
                }
                labelFormatter={(label) => data.find(d => d.weight === label)?.label || ''}
              />
              <Scatter
                data={data}
                fill="#3B82F6"
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          Pareto frontier shows inverse relationship: lighter tanks require more expensive materials (T800/T1000 fiber) and tighter manufacturing tolerances.
          Current design balances weight reduction with cost-effectiveness.
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Material Cost Comparison Table
// ============================================================================

interface MaterialComparisonTableProps {
  data: Array<{ material: string; cost_per_kg: number; relative: number }>;
  currency: CurrencyCode;
}

export function MaterialComparisonTable({ data, currency }: MaterialComparisonTableProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Material Cost Comparison</CardTitle>
      </CardHeader>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Material</th>
                <th className="text-right p-3 font-medium">{formatCurrencyLabel('Cost', currency)} (/kg)</th>
                <th className="text-center p-3 font-medium">Relative Cost</th>
                <th className="text-center p-3 font-medium">Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((mat, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-700">{mat.material}</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(mat.cost_per_kg, currency)}</td>
                  <td className="p-3 text-center font-mono">{mat.relative.toFixed(2)}×</td>
                  <td className="p-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(mat.relative * 30, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded mt-3">
          Current design uses T700 carbon fiber (industry standard). T800/T1000 offer higher strength but at 1.7-3.2× cost premium.
          Glass fiber is much cheaper but requires 50% more material to achieve same strength.
        </div>
      </div>
    </Card>
  );
}
