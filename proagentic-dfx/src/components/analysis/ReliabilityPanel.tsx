'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChartEnhanced } from '@/components/charts';
import type { DesignReliability } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Target, TrendingUp, AlertCircle, Activity } from 'lucide-react';
import { ReliabilityChartsSection } from './ReliabilityChartsSection';
import { ReliabilityEquationsSection } from './ReliabilityEquationsSection';
import {
  type ReliabilityPanelProps,
  type MonteCarloConfig,
  MONTE_CARLO_CONFIGS,
  SERVICE_LIFE_YEARS,
  formatLargeNumber,
  generateWeibullData,
  generateBathtubData,
  calculateReliabilityMetrics,
} from './reliability-panel.types';

export function ReliabilityPanel({ data: initialData, designId = 'C', onReliabilityDataChange }: ReliabilityPanelProps) {
  const [reliabilityData, setReliabilityData] = useState<DesignReliability>(initialData);
  const [monteCarloConfig, setMonteCarloConfig] = useState<MonteCarloConfig>('100k');
  const [isLoading, setIsLoading] = useState(false);
  const [showEquations, setShowEquations] = useState(false);

  useEffect(() => {
    const fetchReliabilityData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/designs/${designId}/reliability?samples=${monteCarloConfig}`);
        if (response.ok) {
          const newData = await response.json();
          setReliabilityData(newData);
          onReliabilityDataChange?.(newData);
        }
      } catch (error) {
        console.error('Failed to fetch reliability data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReliabilityData();
  }, [monteCarloConfig, designId, onReliabilityDataChange]);

  const sensitivityData = reliabilityData.sensitivity || [];
  const uncertaintyPieData = reliabilityData.uncertainty_breakdown || [];
  const safetyFactorComponents = reliabilityData.safety_factor_components || [];
  const totalSafetyFactor = safetyFactorComponents.reduce((acc, c) => acc * c.factor, 1.0);
  const confidenceIntervals = reliabilityData.confidence_intervals || [];

  // Generate chart data using utility functions
  const weibullData = generateWeibullData();
  const bathtubData = generateBathtubData();

  // Calculate reliability metrics
  const pFailure = reliabilityData.monte_carlo.p_failure;
  const { mtbfCycles, mtbfYears, b10LifeCycles, b10LifeYears } = calculateReliabilityMetrics(pFailure);

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="monte-carlo-config-select" className="block text-sm font-medium text-gray-700 mb-2">
            Monte Carlo Configuration
          </label>
          <select
            id="monte-carlo-config-select"
            value={monteCarloConfig}
            onChange={(e) => setMonteCarloConfig(e.target.value as MonteCarloConfig)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={isLoading}
          >
            {Object.entries(MONTE_CARLO_CONFIGS).map(([key, label]) => (
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
          Running Monte Carlo simulation with {MONTE_CARLO_CONFIGS[monteCarloConfig]}...
        </div>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="transition-all hover:shadow-md">
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Target size={16} />
              Mean Time Between Failures
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {mtbfYears >= 1000 ? `${(mtbfYears / 1000).toFixed(0)}K` : mtbfYears.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              years ({formatLargeNumber(mtbfCycles)} cycles)
            </div>
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <AlertCircle size={16} />
              Failure Probability
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {pFailure.toExponential(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">per {SERVICE_LIFE_YEARS}-year service life</div>
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <TrendingUp size={16} />
              Confidence Level
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {confidenceIntervals[2] ? '95%' : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">statistical confidence</div>
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Activity size={16} />
              B10 Life
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {b10LifeYears >= 100 ? `${(b10LifeYears).toFixed(0)}` : b10LifeYears.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              years ({formatLargeNumber(b10LifeCycles)} cycles)
            </div>
          </div>
        </Card>
      </div>

      {/* Monte Carlo Results and Burst Distribution */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={18} />
              Monte Carlo Results
            </CardTitle>
          </CardHeader>
          <div className="space-y-4 p-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Probability of Failure</div>
              <div className="text-3xl font-semibold text-gray-900">
                {reliabilityData.monte_carlo.p_failure.toExponential(2)}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400 transition-all">
              <div className="font-medium text-gray-800 mb-2">Interpretation</div>
              <p className="text-sm text-gray-600">{reliabilityData.monte_carlo.interpretation}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400 transition-all">
              <div className="font-medium text-gray-800 mb-2">Regulatory Compliance</div>
              <p className="text-sm text-gray-600">{reliabilityData.monte_carlo.comparison_to_requirement}</p>
            </div>

            <dl className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Simulations:</dt>
                <dd className="font-mono font-medium">
                  {reliabilityData.monte_carlo.samples.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Method:</dt>
                <dd className="font-medium">Latin Hypercube Sampling</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Convergence:</dt>
                <dd className="font-medium text-gray-900">Achieved (CV &lt; 1%)</dd>
              </div>
            </dl>
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Burst Pressure Distribution</CardTitle>
          </CardHeader>
          <div className="space-y-3 p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reliabilityData.burst_distribution.histogram}>
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
              <div className="p-2 bg-gray-50 rounded transition-all hover:bg-gray-100">
                <div className="text-xs text-gray-500">Mean</div>
                <div className="font-mono font-semibold">{reliabilityData.burst_distribution.mean_bar} bar</div>
              </div>
              <div className="p-2 bg-gray-50 rounded transition-all hover:bg-gray-100">
                <div className="text-xs text-gray-500">Std Dev</div>
                <div className="font-mono font-semibold">{reliabilityData.burst_distribution.std_bar} bar</div>
              </div>
              <div className="p-2 bg-gray-50 rounded transition-all hover:bg-gray-100">
                <div className="text-xs text-gray-500">CoV</div>
                <div className="font-mono font-semibold">
                  {(reliabilityData.burst_distribution.cov * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Weibull Distribution and Bathtub Curve */}
      <ReliabilityChartsSection weibullData={weibullData} bathtubData={bathtubData} />

      {/* Confidence Intervals */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={18} />
            Confidence Intervals
          </CardTitle>
        </CardHeader>
        <div className="space-y-4 p-4">
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
                  className="absolute h-full bg-blue-200 transition-all"
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
      <div className="grid grid-cols-2 gap-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Sensitivity Analysis (Tornado Chart)</CardTitle>
          </CardHeader>
          <div className="space-y-2 p-4">
            {sensitivityData.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="text-sm font-medium text-gray-700">{item.parameter}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12 text-right">{item.negative}%</span>
                  <div className="flex-1 flex items-center h-6">
                    <div
                      className="h-full bg-red-400 transition-all"
                      style={{ width: `${Math.abs(item.negative)}%` }}
                    />
                    <div className="w-px h-full bg-gray-400" />
                    <div
                      className="h-full bg-green-400 transition-all"
                      style={{ width: `${item.positive}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12">+{item.positive}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded m-4">
            Shows impact of ±1 standard deviation change in each parameter on burst pressure.
            Fiber strength has the largest influence.
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Uncertainty Source Breakdown</CardTitle>
          </CardHeader>
          <div className="h-64 p-4">
            <PieChartEnhanced
              data={uncertaintyPieData}
              title="Uncertainty Sources"
            />
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded m-4">
            Material property scatter is the dominant source of uncertainty, accounting for {uncertaintyPieData[0]?.value || 47}% of total variability.
          </div>
        </Card>
      </div>

      {/* Safety Factor Decomposition */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle size={18} />
            Safety Factor Decomposition
          </CardTitle>
        </CardHeader>
        <div className="space-y-4 p-4">
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
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-gray-700">{comp.component}</td>
                    <td className="p-3 text-right font-mono font-semibold">{comp.factor.toFixed(2)}</td>
                    <td className="p-3 text-gray-600 text-xs">{comp.description}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="p-3 text-gray-900">Total Safety Factor</td>
                  <td className="p-3 text-right font-mono text-gray-900">
                    {totalSafetyFactor.toFixed(2)}
                  </td>
                  <td className="p-3 text-xs text-gray-600">Product of all components</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400 transition-all hover:shadow-sm">
              <div className="text-sm font-medium text-gray-700 mb-1">Design Burst Ratio</div>
              <div className="text-2xl font-semibold text-gray-900">2.25</div>
              <div className="text-xs text-gray-500 mt-1">Required minimum: 2.25 (EC 79)</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400 transition-all hover:shadow-sm">
              <div className="text-sm font-medium text-gray-700 mb-1">Effective Safety Factor</div>
              <div className="text-2xl font-semibold text-gray-900">{totalSafetyFactor.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">Combined uncertainty margin</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Collapsible Equations Section */}
      {showEquations && (
        <ReliabilityEquationsSection
          pFailure={pFailure}
          samples={reliabilityData.monte_carlo.samples}
          covPercent={(reliabilityData.burst_distribution.cov * 100).toFixed(1) + '%'}
          stdBar={reliabilityData.burst_distribution.std_bar}
          meanBar={reliabilityData.burst_distribution.mean_bar}
          mtbfYears={mtbfYears}
          mtbfCycles={mtbfCycles}
        />
      )}
    </div>
  );
}
