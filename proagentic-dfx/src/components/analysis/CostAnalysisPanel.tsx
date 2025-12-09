'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EquationDisplay } from './EquationDisplay';
import type { DesignCost } from '@/lib/types';
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COST_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#10B981', '#6366F1', '#F59E0B', '#14B8A6'];
import { DollarSign, TrendingDown, Package, Factory } from 'lucide-react';

interface CostAnalysisPanelProps {
  data: DesignCost;
  designId?: string;
  onCostDataChange?: (data: DesignCost) => void;
}

type ProductionVolume = '1k' | '5k' | '10k' | '50k';

const PRODUCTION_VOLUMES: Record<ProductionVolume, string> = {
  '1k': '1,000 units/year',
  '5k': '5,000 units/year (Baseline)',
  '10k': '10,000 units/year',
  '50k': '50,000 units/year',
};

export function CostAnalysisPanel({ data: initialData, designId = 'C', onCostDataChange }: CostAnalysisPanelProps) {
  const [costData, setCostData] = useState<DesignCost>(initialData);
  const [productionVolume, setProductionVolume] = useState<ProductionVolume>('5k');
  const [isLoading, setIsLoading] = useState(false);
  const [showEquations, setShowEquations] = useState(false);

  useEffect(() => {
    const fetchCostData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/designs/${designId}/cost?volume=${productionVolume}`);
        if (response.ok) {
          const newData = await response.json();
          setCostData(newData);
          onCostDataChange?.(newData);
        }
      } catch (error) {
        console.error('Failed to fetch cost data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCostData();
  }, [productionVolume, designId, onCostDataChange]);

  const volumeSensitivity = costData.volume_sensitivity || [];
  const weightCostTradeoff = costData.weight_cost_tradeoff || [];
  const materialComparison = costData.material_comparison || [];
  const learningCurveData = costData.learning_curve || [];

  // Calculate key metrics
  const materialsCost = costData.breakdown.find(b => b.component === 'Materials')?.cost_eur || 0;
  const laborCost = costData.breakdown.find(b => b.component === 'Labor')?.cost_eur || 0;
  const manufacturingCost = laborCost + (costData.breakdown.find(b => b.component === 'Overhead')?.cost_eur || 0);

  // Cost reduction potential at higher volumes (compared to baseline)
  // At 50k units, cost drops ~32% from baseline
  const volumeReductionPct = productionVolume === '50k' ? -32 :
                              productionVolume === '10k' ? -15 :
                              productionVolume === '1k' ? +20 : 0;
  const costReductionLabel = volumeReductionPct === 0 ? 'Baseline' :
                             volumeReductionPct > 0 ? `+${volumeReductionPct}%` : `${volumeReductionPct}%`;

  // Manufacturing process breakdown
  const manufacturingProcesses = [
    { process: 'Liner Molding', time_min: 12, cost_eur: Math.round(laborCost * 0.15) },
    { process: 'Filament Winding', time_min: 45, cost_eur: Math.round(laborCost * 0.50) },
    { process: 'Curing', time_min: 180, cost_eur: Math.round(laborCost * 0.15) },
    { process: 'Boss Installation', time_min: 20, cost_eur: Math.round(laborCost * 0.10) },
    { process: 'Quality Control', time_min: 30, cost_eur: Math.round(laborCost * 0.10) },
  ];

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Production Volume
          </label>
          <select
            value={productionVolume}
            onChange={(e) => setProductionVolume(e.target.value as ProductionVolume)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={isLoading}
          >
            {Object.entries(PRODUCTION_VOLUMES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowEquations(!showEquations)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showEquations
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          {showEquations ? 'Hide Equations' : 'Show Equations'}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-sm text-gray-500 text-center py-2 animate-pulse">
          Calculating costs for {PRODUCTION_VOLUMES[productionVolume]}...
        </div>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="transition-all hover:shadow-md">
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <DollarSign size={16} />
              Unit Cost
            </div>
            <div className="text-3xl font-bold text-gray-900">
              €{costData.unit_cost_eur.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">per tank</div>
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Package size={16} />
              Material Cost
            </div>
            <div className="text-3xl font-bold text-blue-600">
              €{materialsCost.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((materialsCost / costData.unit_cost_eur) * 100).toFixed(0)}% of total
            </div>
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Factory size={16} />
              Manufacturing Cost
            </div>
            <div className="text-3xl font-bold text-green-600">
              €{manufacturingCost.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((manufacturingCost / costData.unit_cost_eur) * 100).toFixed(0)}% of total
            </div>
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <TrendingDown size={16} />
              Volume Sensitivity
            </div>
            <div className={`text-3xl font-bold ${volumeReductionPct < 0 ? 'text-green-600' : volumeReductionPct > 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {costReductionLabel}
            </div>
            <div className="text-xs text-gray-500 mt-1">vs. 5K baseline</div>
          </div>
        </Card>
      </div>

      {/* Unit Cost Summary - Compact Row */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign size={18} />
            Unit Cost Analysis
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Unit Cost (at {PRODUCTION_VOLUMES[productionVolume]})</div>
              <div className="text-4xl font-bold text-gray-900">
                €{costData.unit_cost_eur.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="text-xs text-gray-600 mb-1">Material Cost</div>
              <div className="text-2xl font-bold text-blue-700">
                €{materialsCost.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {((materialsCost / costData.unit_cost_eur) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="text-xs text-gray-600 mb-1">Labor Cost</div>
              <div className="text-2xl font-bold text-green-700">
                €{laborCost.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {((laborCost / costData.unit_cost_eur) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per kg:</span>
                <span className="font-mono font-semibold">€{(costData.unit_cost_eur / 47).toFixed(0)}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fiber cost share:</span>
                <span className="font-mono font-semibold">
                  {costData.breakdown.find(b => b.component.includes('Fiber') || b.component.includes('Carbon'))?.percentage || 47}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Production volume:</span>
                <span className="font-medium">{PRODUCTION_VOLUMES[productionVolume].split(' ')[0]} units/year</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded mt-4">
            Based on automated filament winding with quality control. Includes materials, direct labor, tooling amortization, and overhead.
          </div>
        </div>
      </Card>

      {/* Cost Breakdown - Simple Clean Pie Chart */}
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
                    data={costData.breakdown.map((b, i) => ({
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
                    {costData.breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COST_COLORS[index % COST_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`€${value.toLocaleString()}`, 'Cost']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend - Right Side */}
            <div className="flex-1 grid grid-cols-2 gap-2 content-start">
              {costData.breakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: COST_COLORS[index % COST_COLORS.length] }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.component}</div>
                    <div className="text-xs text-gray-500">
                      €{item.cost_eur.toLocaleString()} ({item.percentage}%)
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
              €{costData.breakdown.reduce((sum, b) => sum + b.cost_eur, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Production Volume Sensitivity */}
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
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded transition-all hover:bg-gray-100">
              <div className="text-xs text-gray-500">@ 1,000 units/year</div>
              <div className="font-mono font-semibold">€{(costData.unit_cost_eur * 1.2).toLocaleString()}</div>
              <div className="text-xs text-red-600">+20% vs baseline</div>
            </div>
            <div className="p-3 bg-blue-50 rounded border-2 border-blue-500 transition-all">
              <div className="text-xs text-gray-600">@ 5,000 units/year</div>
              <div className="font-mono font-semibold text-blue-700">€{costData.unit_cost_eur.toLocaleString()}</div>
              <div className="text-xs text-blue-600">Current baseline</div>
            </div>
            <div className="p-3 bg-gray-50 rounded transition-all hover:bg-gray-100">
              <div className="text-xs text-gray-500">@ 50,000 units/year</div>
              <div className="font-mono font-semibold">€{(costData.unit_cost_eur * 0.68).toLocaleString()}</div>
              <div className="text-xs text-green-600">-32% vs baseline</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Weight-Cost Trade-off */}
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
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            Pareto frontier shows inverse relationship: lighter tanks require more expensive materials (T800/T1000 fiber) and tighter manufacturing tolerances.
            Current design balances weight reduction with cost-effectiveness.
          </div>
        </div>
      </Card>

      {/* Material Cost Comparison */}
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
                  <th className="text-right p-3 font-medium">Cost (€/kg)</th>
                  <th className="text-center p-3 font-medium">Relative Cost</th>
                  <th className="text-center p-3 font-medium">Visual</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {materialComparison.map((mat, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-gray-700">{mat.material}</td>
                    <td className="p-3 text-right font-mono">€{mat.cost_per_kg}</td>
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

      {/* Manufacturing Process Breakdown */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory size={18} />
            Manufacturing Process Breakdown
          </CardTitle>
        </CardHeader>
        <div className="space-y-4 p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={manufacturingProcesses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="process"
                  tick={{ fontSize: 10 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  yAxisId="left"
                  label={{ value: 'Time (minutes)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Cost (€)', angle: 90, position: 'insideRight' }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="time_min" fill="#10B981" name="Time (min)" />
                <Bar yAxisId="right" dataKey="cost_eur" fill="#3B82F6" name="Cost (€)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            Total manufacturing time: {manufacturingProcesses.reduce((sum, p) => sum + p.time_min, 0)} minutes per tank.
            Filament winding is the most time-intensive and labor-costly process, accounting for 50% of direct labor costs.
          </div>
        </div>
      </Card>

      {/* Learning Curve Effect */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle>Learning Curve Effect (Manufacturing)</CardTitle>
        </CardHeader>
        <div className="space-y-4 p-4">
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

      {/* Collapsible Equations Section */}
      {showEquations && (
        <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
          <h3 className="text-lg font-semibold text-gray-900">Cost Engineering Equations</h3>

          <EquationDisplay
            title="Unit Cost Model"
            equation="C_unit = C_material + C_labor + C_tooling + C_overhead"
            variables={[
              { symbol: 'C_unit', description: 'Total unit cost', value: `€${costData.unit_cost_eur}` },
              { symbol: 'C_material', description: 'Direct material cost', value: `€${materialsCost}` },
              { symbol: 'C_labor', description: 'Direct labor cost', value: `€${laborCost}` },
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
              { symbol: 'C_variable', description: 'Variable cost per unit', value: `€${(costData.unit_cost_eur * 0.75).toFixed(0)}` },
            ]}
            explanation="Fixed costs (tooling, equipment, setup) are amortized over production volume. Higher volumes reduce per-unit fixed cost allocation. Variable costs (materials, labor) remain constant per unit."
            defaultExpanded={false}
          />

          <EquationDisplay
            title="Learning Curve Model"
            equation="C_n = C_1 × n^(log_2(LR))"
            variables={[
              { symbol: 'C_n', description: 'Cost of nth unit' },
              { symbol: 'C_1', description: 'Cost of first unit', value: `€${(costData.unit_cost_eur * 2.5).toFixed(0)}` },
              { symbol: 'n', description: 'Cumulative production count' },
              { symbol: 'LR', description: 'Learning rate', value: '0.85 (85%)' },
            ]}
            explanation="Wright's learning curve: cost decreases by (1-LR) each time cumulative production doubles. 85% learning rate means 15% cost reduction per doubling."
            defaultExpanded={false}
          />
        </div>
      )}
    </div>
  );
}
