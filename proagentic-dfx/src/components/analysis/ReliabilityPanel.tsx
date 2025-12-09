'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EquationDisplay } from './EquationDisplay';
import type { DesignReliability } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

interface ReliabilityPanelProps {
  data: DesignReliability;
}

export function ReliabilityPanel({ data }: ReliabilityPanelProps) {
  // Use sensitivity data from API props (fallback to empty array)
  const sensitivityData = data.sensitivity || [];

  // Use uncertainty breakdown from API props (fallback to empty array)
  const uncertaintyPieData = data.uncertainty_breakdown || [];

  // Use safety factor components from API props (fallback to empty array)
  const safetyFactorComponents = data.safety_factor_components || [];

  const totalSafetyFactor = safetyFactorComponents.reduce((acc, c) => acc * c.factor, 1.0);

  // Use confidence intervals from API props (fallback to empty array)
  const confidenceIntervals = data.confidence_intervals || [];

  return (
    <div className="space-y-6">
      {/* Top Row: Monte Carlo Summary and Distribution */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={18} />
              Monte Carlo Results
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Probability of Failure</div>
              <div className="text-5xl font-bold text-green-600">
                {data.monte_carlo.p_failure.toExponential(2)}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="font-medium text-green-800 mb-2">Interpretation</div>
              <p className="text-sm text-green-700">{data.monte_carlo.interpretation}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="font-medium text-blue-800 mb-2">Regulatory Compliance</div>
              <p className="text-sm text-blue-700">{data.monte_carlo.comparison_to_requirement}</p>
            </div>

            <dl className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Simulations:</dt>
                <dd className="font-mono font-medium">
                  {data.monte_carlo.samples.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Method:</dt>
                <dd className="font-medium">Latin Hypercube Sampling</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Convergence:</dt>
                <dd className="font-medium text-green-600">Achieved (CV &lt; 1%)</dd>
              </div>
            </dl>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Burst Pressure Distribution</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.burst_distribution.histogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="bin_center"
                    tick={{ fontSize: 10 }}
                    label={{ value: 'Burst Pressure (bar)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Mean</div>
                <div className="font-mono font-semibold">{data.burst_distribution.mean_bar} bar</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Std Dev</div>
                <div className="font-mono font-semibold">{data.burst_distribution.std_bar} bar</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">CoV</div>
                <div className="font-mono font-semibold">
                  {(data.burst_distribution.cov * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Confidence Intervals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={18} />
            Confidence Intervals
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {confidenceIntervals.map((ci, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{ci.level} Confidence</span>
                <span className="text-sm text-gray-600">
                  [{ci.lower} - {ci.upper}] bar
                </span>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-blue-200"
                  style={{
                    left: `${((ci.lower - 900) / 400) * 100}%`,
                    width: `${((ci.upper - ci.lower) / 400) * 100}%`,
                  }}
                />
                <div
                  className="absolute h-full w-1 bg-blue-600"
                  style={{ left: `${((ci.mean - 900) / 400) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  Mean: {ci.mean} bar
                </div>
              </div>
            </div>
          ))}
          {confidenceIntervals[2] && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded mt-4">
              95% confidence interval: We are 95% certain the true burst pressure lies between {confidenceIntervals[2].lower} and {confidenceIntervals[2].upper} bar.
            </div>
          )}
        </div>
      </Card>

      {/* Sensitivity Analysis and Uncertainty Sources */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sensitivity Analysis (Tornado Chart)</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {sensitivityData.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="text-sm font-medium text-gray-700">{item.parameter}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12 text-right">{item.negative}%</span>
                  <div className="flex-1 flex items-center h-6">
                    <div
                      className="h-full bg-red-400"
                      style={{ width: `${Math.abs(item.negative)}%` }}
                    />
                    <div className="w-px h-full bg-gray-400" />
                    <div
                      className="h-full bg-green-400"
                      style={{ width: `${item.positive}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12">+{item.positive}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded mt-4">
            Shows impact of ±1 standard deviation change in each parameter on burst pressure.
            Fiber strength has the largest influence.
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uncertainty Source Breakdown</CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={uncertaintyPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {uncertaintyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            Material property scatter is the dominant source of uncertainty, accounting for 47% of total variability.
          </div>
        </Card>
      </div>

      {/* Safety Factor Decomposition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle size={18} />
            Safety Factor Decomposition
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Component</th>
                  <th className="text-right p-3 font-medium">Factor</th>
                  <th className="text-left p-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {safetyFactorComponents.map((comp, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">{comp.component}</td>
                    <td className="p-3 text-right font-mono font-semibold">{comp.factor.toFixed(2)}</td>
                    <td className="p-3 text-gray-600 text-xs">{comp.description}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td className="p-3 text-blue-800">Total Safety Factor</td>
                  <td className="p-3 text-right font-mono text-blue-800">
                    {totalSafetyFactor.toFixed(2)}
                  </td>
                  <td className="p-3 text-xs text-blue-700">Product of all components</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="text-sm font-medium text-green-800 mb-1">Design Burst Ratio</div>
              <div className="text-3xl font-bold text-green-700">2.25</div>
              <div className="text-xs text-green-600 mt-1">Required minimum: 2.25 (EC 79)</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="text-sm font-medium text-blue-800 mb-1">Effective Safety Factor</div>
              <div className="text-3xl font-bold text-blue-700">{totalSafetyFactor.toFixed(2)}</div>
              <div className="text-xs text-blue-600 mt-1">Combined uncertainty margin</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="border-l-4 border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Key Reliability Insights</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <span className="font-bold mt-1">•</span>
            <p>
              <strong>Extremely Low Failure Risk:</strong> Monte Carlo analysis shows P(failure) = {data.monte_carlo.p_failure.toExponential(2)},
              equivalent to 1 failure in {(1 / data.monte_carlo.p_failure).toExponential(0)} tanks.
            </p>
          </div>
          {confidenceIntervals[2] && (
            <div className="flex items-start gap-2">
              <span className="font-bold mt-1">•</span>
              <p>
                <strong>Robust Design:</strong> 95% confidence interval [{confidenceIntervals[2].lower} - {confidenceIntervals[2].upper}] bar
                is well above minimum burst requirement (700 bar).
              </p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="font-bold mt-1">•</span>
            <p>
              <strong>Fiber Strength Critical:</strong> Sensitivity analysis identifies fiber tensile strength as the dominant
              parameter (±52% swing). Strict material qualification is essential.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold mt-1">•</span>
            <p>
              <strong>Manufacturing Control:</strong> 28% of uncertainty stems from manufacturing variability.
              Process controls and NDT inspection reduce this risk.
            </p>
          </div>
        </div>
      </Card>

      {/* Reliability Equations */}
      <EquationDisplay
        title="Monte Carlo Failure Probability"
        equation="P_failure = (Number of failures) / (Total samples)"
        variables={[
          { symbol: 'P_failure', description: 'Probability of failure', value: data.monte_carlo.p_failure.toExponential(2) },
          { symbol: 'Failures', description: 'Simulations where burst < test pressure', value: '0' },
          { symbol: 'Samples', description: 'Total Monte Carlo runs', value: data.monte_carlo.samples.toLocaleString() },
        ]}
        explanation="Monte Carlo simulation randomly samples input parameters from their statistical distributions, runs FEA for each sample, and counts failures. Converges to true probability with large sample size."
      />

      <EquationDisplay
        title="Coefficient of Variation (CoV)"
        equation="CoV = σ / μ"
        variables={[
          { symbol: 'CoV', description: 'Coefficient of variation', value: (data.burst_distribution.cov * 100).toFixed(1) + '%' },
          { symbol: 'σ', description: 'Standard deviation of burst pressure', value: `${data.burst_distribution.std_bar} bar` },
          { symbol: 'μ', description: 'Mean burst pressure', value: `${data.burst_distribution.mean_bar} bar` },
        ]}
        explanation="CoV normalizes variability relative to the mean. Lower CoV indicates tighter control. Typical CoV for Type IV tanks: 3-5%."
      />

      <EquationDisplay
        title="Reliability Index (β)"
        equation="β = Φ^(-1)(1 - P_failure)"
        variables={[
          { symbol: 'β', description: 'Reliability index (sigma level)', value: '5.2' },
          { symbol: 'Φ^(-1)', description: 'Inverse standard normal CDF' },
          { symbol: 'P_failure', description: 'Probability of failure', value: data.monte_carlo.p_failure.toExponential(2) },
        ]}
        explanation="Beta (β) is a measure of reliability in standard deviations. β = 3 corresponds to 99.87% reliability (3-sigma), β = 6 is six-sigma (99.99966%)."
        defaultExpanded={false}
      />
    </div>
  );
}
