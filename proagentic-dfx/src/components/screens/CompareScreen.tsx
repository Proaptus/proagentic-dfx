'use client';

/**
 * CompareScreen Component
 * REQ-142 to REQ-149: Side-by-side design comparison with metrics, radar charts, and visual indicators
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getDesign, getDesignStress } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ComparisonCard } from '@/components/compare';
import type { CompareResponse } from '@/lib/types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] as const;

export function CompareScreen() {
  const { selectedDesigns, setCurrentDesign, setScreen, paretoFront } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<CompareResponse | null>(null);

  // Use selected designs, or default to first 3 from Pareto front
  const designsToCompare = useMemo(() => {
    const defaultDesigns = paretoFront.slice(0, 3).map((d) => d.id);
    return selectedDesigns.length >= 2
      ? selectedDesigns
      : defaultDesigns.length >= 2
      ? defaultDesigns
      : ['A', 'B', 'C'];
  }, [selectedDesigns, paretoFront]);

  // Load comparison data
  useEffect(() => {
    if (designsToCompare.length === 0) return;

    setLoading(true);
    const promises = designsToCompare.map((id) =>
      Promise.all([getDesign(id), getDesignStress(id)])
    );

    Promise.all(promises)
      .then((results) => {
        // Build comparison from results
        interface DesignResult {
          id?: string;
          weight_kg?: number;
          cost_eur?: number;
          burst_pressure_bar?: number;
          p_failure?: number;
          fatigue_life_cycles?: number;
          permeation_rate?: number;
          max_stress_mpa?: number;
          stress_margin_percent?: number;
        }

        const designs = results.map(([design]) => {
          const d = design as DesignResult;
          return {
            id: d?.id ?? '',
            weight_kg: d?.weight_kg ?? 0,
            burst_pressure_bar: d?.burst_pressure_bar ?? 0,
            cost_eur: d?.cost_eur ?? 0,
            p_failure: d?.p_failure ?? 0,
            fatigue_life_cycles: d?.fatigue_life_cycles ?? 0,
            permeation_rate: d?.permeation_rate ?? 0,
            max_stress_mpa: d?.max_stress_mpa ?? 0,
            stress_margin_percent: d?.stress_margin_percent ?? 0,
          };
        });

        // Build radar data
        const radarMetrics: Array<keyof DesignResult> = [
          'weight_kg',
          'cost_eur',
          'burst_pressure_bar',
          'stress_margin_percent',
        ];
        const radar_data = radarMetrics.map((metric) => {
          const point: Record<string, number | string> = { metric };
          designs.forEach((d) => {
            const value = d[metric as keyof typeof d];
            point[d.id] = typeof value === 'number' ? value : 0;
          });
          return point;
        });

        // Build metrics table
        interface MetricConfig {
          key: keyof DesignResult;
          label: string;
          higherIsBetter: boolean;
        }

        const metricConfigs: MetricConfig[] = [
          { key: 'weight_kg', label: 'Weight (kg)', higherIsBetter: false },
          { key: 'cost_eur', label: 'Cost (€)', higherIsBetter: false },
          { key: 'burst_pressure_bar', label: 'Burst Pressure (bar)', higherIsBetter: true },
          { key: 'stress_margin_percent', label: 'Stress Margin (%)', higherIsBetter: true },
        ];

        const metrics = metricConfigs.map(({ key, label, higherIsBetter }) => {
          const values: Record<string, number | string> = {};
          let bestValue = higherIsBetter ? -Infinity : Infinity;
          let better = '';

          designs.forEach((d) => {
            const val = d[key];
            const numVal = typeof val === 'number' ? val : 0;
            values[d.id] = numVal;

            if (higherIsBetter ? numVal > bestValue : numVal < bestValue) {
              bestValue = numVal;
              better = d.id;
            }
          });

          return { metric: label, values, better };
        });

        setComparison({ designs, radar_data, metrics });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [designsToCompare]);

  const handleSelectDesign = useCallback(
    (id: string) => {
      setCurrentDesign(id);
      setScreen('viewer');
    },
    [setCurrentDesign, setScreen]
  );

  const handleExport = useCallback(
    (id: string) => {
      setCurrentDesign(id);
      setScreen('export');
    },
    [setCurrentDesign, setScreen]
  );

  // Prepare metrics for ComparisonCard components
  const allDesignsMetrics = useMemo(() => {
    if (!comparison) return {};

    const metricsMap: Record<string, number[]> = {};

    comparison.designs.forEach((design) => {
      metricsMap.weight_kg = metricsMap.weight_kg || [];
      metricsMap.weight_kg.push(design.weight_kg);

      metricsMap.cost_eur = metricsMap.cost_eur || [];
      metricsMap.cost_eur.push(design.cost_eur);

      metricsMap.burst_pressure_bar = metricsMap.burst_pressure_bar || [];
      metricsMap.burst_pressure_bar.push(design.burst_pressure_bar);

      metricsMap.p_failure = metricsMap.p_failure || [];
      metricsMap.p_failure.push(design.p_failure);

      metricsMap.fatigue_life_cycles = metricsMap.fatigue_life_cycles || [];
      metricsMap.fatigue_life_cycles.push(design.fatigue_life_cycles);

      metricsMap.stress_margin_percent = metricsMap.stress_margin_percent || [];
      metricsMap.stress_margin_percent.push(design.stress_margin_percent);
    });

    return metricsMap;
  }, [comparison]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Loading comparison data...
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No comparison data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Comparison</h1>
        <p className="text-gray-700 text-lg">
          Side-by-side analysis of design performance, metrics, and trade-offs to identify the optimal solution for your requirements.
        </p>
        <div className="flex gap-2 mt-4">
          <Badge variant="secondary" className="bg-white">
            {comparison.designs.length} Designs
          </Badge>
          <Badge variant="secondary" className="bg-white">
            {comparison.metrics.length} Metrics
          </Badge>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Performance Radar</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Multi-dimensional performance comparison</p>
          </CardHeader>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={comparison.radar_data}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) =>
                    value.charAt(0).toUpperCase() + value.slice(1)
                  }
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                {comparison.designs.map((design, i) => (
                  <Radar
                    key={design.id}
                    name={`Design ${design.id}`}
                    dataKey={design.id}
                    stroke={COLORS[i % COLORS.length]}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Metrics Table */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Detailed Metrics</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Quantitative performance indicators</p>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Metric</th>
                  {comparison.designs.map((d, i) => (
                    <th key={d.id} className="text-center py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        Design {d.id}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparison.metrics.map((metric) => (
                  <tr key={metric.metric} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-900 font-medium">{metric.metric}</td>
                    {comparison.designs.map((d) => {
                      const value = metric.values[d.id];
                      const isBest = metric.better === d.id;
                      return (
                        <td
                          key={d.id}
                          className={`text-center py-3 px-4 ${
                            isBest ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isBest && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
                            <span>{typeof value === 'number' ? value.toLocaleString() : value}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Design Comparison Cards */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Design Details</h2>
        <div className="grid grid-cols-3 gap-6">
          {comparison.designs.map((design, i) => (
            <ComparisonCard
              key={design.id}
              designId={design.id}
              color={COLORS[i % COLORS.length]}
              index={i}
              metrics={[
                {
                  label: 'Weight',
                  value: design.weight_kg,
                  unit: 'kg',
                  metricKey: 'weight_kg',
                },
                {
                  label: 'Cost',
                  value: design.cost_eur,
                  unit: '€',
                  metricKey: 'cost_eur',
                },
                {
                  label: 'Burst Pressure',
                  value: design.burst_pressure_bar,
                  unit: 'bar',
                  metricKey: 'burst_pressure_bar',
                },
                {
                  label: 'P(Failure)',
                  value: design.p_failure,
                  unit: '',
                  metricKey: 'p_failure',
                },
                {
                  label: 'Fatigue Life',
                  value: design.fatigue_life_cycles,
                  unit: 'cycles',
                  metricKey: 'fatigue_life_cycles',
                },
                {
                  label: 'Stress Margin',
                  value: design.stress_margin_percent,
                  unit: '%',
                  metricKey: 'stress_margin_percent',
                },
              ]}
              allDesignsMetrics={allDesignsMetrics}
              onViewDesign={handleSelectDesign}
              onExport={handleExport}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
