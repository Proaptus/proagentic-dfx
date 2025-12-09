'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EquationDisplay } from './EquationDisplay';
import type { DesignCost } from '@/lib/types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from 'recharts';
import { DollarSign, TrendingDown, Package } from 'lucide-react';

interface CostAnalysisPanelProps {
  data: DesignCost;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export function CostAnalysisPanel({ data }: CostAnalysisPanelProps) {
  // Use volume sensitivity data from API props (fallback to empty array)
  const volumeSensitivity = data.volume_sensitivity || [];

  // Use weight-cost tradeoff data from API props (fallback to empty array)
  const weightCostTradeoff = data.weight_cost_tradeoff || [];

  // Use material comparison data from API props (fallback to empty array)
  const materialComparison = data.material_comparison || [];

  // Use learning curve data from API props (fallback to empty array)
  const learningCurveData = data.learning_curve || [];

  return (
    <div className="space-y-6">
      {/* Top Row: Unit Cost and Breakdown Pie Chart */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={18} />
              Unit Cost Analysis
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Unit Cost (at 5,000 units/year)</div>
              <div className="text-5xl font-bold text-gray-900">
                €{data.unit_cost_eur.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-xs text-gray-600 mb-1">Material Cost</div>
                <div className="text-2xl font-bold text-blue-700">
                  €{(data.breakdown.find(b => b.component === 'Materials')?.cost_eur || 0).toLocaleString()}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {data.breakdown.find(b => b.component === 'Materials')?.percentage}%
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="text-xs text-gray-600 mb-1">Labor Cost</div>
                <div className="text-2xl font-bold text-green-700">
                  €{(data.breakdown.find(b => b.component === 'Labor')?.cost_eur || 0).toLocaleString()}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {data.breakdown.find(b => b.component === 'Labor')?.percentage}%
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per kg:</span>
                <span className="font-mono font-semibold">€{(data.unit_cost_eur / 47).toFixed(0)}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fiber cost share:</span>
                <span className="font-mono font-semibold">
                  {data.breakdown.find(b => b.component.includes('Fiber'))?.percentage || 47}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Production volume:</span>
                <span className="font-medium">5,000 units/year</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              Based on automated filament winding with quality control. Includes materials, direct labor, tooling amortization, and overhead.
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.breakdown}
                  dataKey="cost_eur"
                  nameKey="component"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(props: { name?: string; percent?: number }) => `${props.name ?? ''} (${(props.percent ? (props.percent * 100).toFixed(0) : '0')}%)`}
                  labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
                >
                  {data.breakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `€${value.toLocaleString()}`}
                  contentStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Weight-Cost Trade-off */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={18} />
            Weight-Cost Trade-off Analysis
          </CardTitle>
        </CardHeader>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                dataKey="weight"
                name="Weight"
                unit=" kg"
                domain={[35, 60]}
                label={{ value: 'Tank Weight (kg)', position: 'insideBottom', offset: -10 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="cost"
                name="Cost"
                unit=" €"
                label={{ value: 'Unit Cost (€)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: number, name: string) =>
                  name === 'weight' ? `${value} kg` : `€${value.toLocaleString()}`
                }
                labelFormatter={(label) => weightCostTradeoff.find(d => d.weight === label)?.label || ''}
              />
              <Scatter
                data={weightCostTradeoff}
                fill="#3B82F6"
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded mt-3">
          Pareto frontier shows inverse relationship: lighter tanks require more expensive materials (T800/T1000 fiber) and tighter manufacturing tolerances.
          Current design balances weight reduction with cost-effectiveness.
        </div>
      </Card>

      {/* Production Volume Sensitivity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown size={18} />
            Production Volume Sensitivity
          </CardTitle>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volumeSensitivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                label={{ value: 'Production Volume (units/year)', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: 'Unit Cost (€)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
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
        <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">@ 1,000 units/year</div>
            <div className="font-mono font-semibold">€{(data.unit_cost_eur * 1.2).toLocaleString()}</div>
            <div className="text-xs text-red-600">+20% vs current</div>
          </div>
          <div className="p-3 bg-blue-50 rounded border-2 border-blue-500">
            <div className="text-xs text-gray-600">@ 5,000 units/year</div>
            <div className="font-mono font-semibold text-blue-700">€{data.unit_cost_eur.toLocaleString()}</div>
            <div className="text-xs text-blue-600">Current baseline</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">@ 50,000 units/year</div>
            <div className="font-mono font-semibold">€{(data.unit_cost_eur * 0.68).toLocaleString()}</div>
            <div className="text-xs text-green-600">-32% vs current</div>
          </div>
        </div>
      </Card>

      {/* Material Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Material Cost Comparison</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Material</th>
                <th className="text-right p-3 font-medium">Cost (€/kg)</th>
                <th className="text-center p-3 font-medium">Relative Cost</th>
                <th className="text-center p-3 font-medium">Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {materialComparison.map((mat, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">{mat.material}</td>
                  <td className="p-3 text-right font-mono">€{mat.cost_per_kg}</td>
                  <td className="p-3 text-center font-mono">{mat.relative.toFixed(2)}×</td>
                  <td className="p-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${mat.relative * 30}%` }}
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
      </Card>

      {/* Learning Curve Effect */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Curve Effect (Manufacturing)</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={learningCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="batch"
                  label={{ value: 'Production Batch (#)', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  label={{ value: 'Cost Multiplier', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 11 }}
                  domain={[0.8, 2.6]}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cost_multiplier"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Cost Multiplier"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            Manufacturing costs decrease with experience due to process optimization, reduced defect rates, and improved tooling.
            First batch costs 2.5× baseline; stabilizes after ~50 batches. Learning rate: 85% (15% reduction per doubling of cumulative production).
          </div>
        </div>
      </Card>

      {/* Cost Equations */}
      <EquationDisplay
        title="Unit Cost Model"
        equation="C_unit = C_material + C_labor + C_tooling + C_overhead"
        variables={[
          { symbol: 'C_unit', description: 'Total unit cost', value: `€${data.unit_cost_eur}` },
          { symbol: 'C_material', description: 'Direct material cost', value: `€${data.breakdown.find(b => b.component === 'Materials')?.cost_eur || 0}` },
          { symbol: 'C_labor', description: 'Direct labor cost', value: `€${data.breakdown.find(b => b.component === 'Labor')?.cost_eur || 0}` },
          { symbol: 'C_tooling', description: 'Amortized tooling', value: '€85' },
          { symbol: 'C_overhead', description: 'Factory overhead', value: '€120' },
        ]}
        explanation="Unit cost is sum of direct materials, direct labor, amortized tooling costs, and allocated factory overhead (utilities, supervision, QC)."
      />

      <EquationDisplay
        title="Material Cost Calculation"
        equation="C_material = (m_fiber × p_fiber) + (m_matrix × p_matrix) + (m_liner × p_liner)"
        variables={[
          { symbol: 'm_fiber', description: 'Carbon fiber mass', value: '18.5 kg' },
          { symbol: 'p_fiber', description: 'Fiber unit price', value: '€45/kg' },
          { symbol: 'm_matrix', description: 'Epoxy resin mass', value: '4.2 kg' },
          { symbol: 'p_matrix', description: 'Resin unit price', value: '€12/kg' },
          { symbol: 'm_liner', description: 'HDPE liner mass', value: '3.8 kg' },
          { symbol: 'p_liner', description: 'Liner unit price', value: '€6/kg' },
        ]}
        explanation="Material cost is mass-weighted sum of all constituents. Carbon fiber typically dominates (47-52% of total cost) due to high price per kg."
      />

      <EquationDisplay
        title="Volume Scaling (Economies of Scale)"
        equation="C(V) = C_fixed / V + C_variable"
        variables={[
          { symbol: 'C(V)', description: 'Unit cost at volume V' },
          { symbol: 'C_fixed', description: 'Fixed costs (tooling, setup)', value: '€425k/year' },
          { symbol: 'V', description: 'Annual production volume', value: '5,000 units' },
          { symbol: 'C_variable', description: 'Variable cost per unit', value: `€${(data.unit_cost_eur * 0.75).toFixed(0)}` },
        ]}
        explanation="Fixed costs (tooling, equipment, setup) are amortized over production volume. Higher volumes reduce per-unit fixed cost allocation. Variable costs (materials, labor) remain constant per unit."
        defaultExpanded={false}
      />

      <EquationDisplay
        title="Learning Curve Model"
        equation="C_n = C_1 × n^(log_2(LR))"
        variables={[
          { symbol: 'C_n', description: 'Cost of nth unit' },
          { symbol: 'C_1', description: 'Cost of first unit', value: `€${(data.unit_cost_eur * 2.5).toFixed(0)}` },
          { symbol: 'n', description: 'Cumulative production count' },
          { symbol: 'LR', description: 'Learning rate', value: '0.85 (85%)' },
        ]}
        explanation="Wright's learning curve: cost decreases by (1-LR) each time cumulative production doubles. 85% learning rate means 15% cost reduction per doubling."
        defaultExpanded={false}
      />
    </div>
  );
}
