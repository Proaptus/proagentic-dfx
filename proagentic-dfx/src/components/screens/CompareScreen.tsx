'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { compareDesigns } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CompareResponse } from '@/lib/types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CheckCircle, ArrowRight } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function CompareScreen() {
  const { selectedDesigns, setCurrentDesign, setScreen, paretoFront } = useAppStore();

  const [comparison, setComparison] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Use selected designs, or default to first 3 from Pareto front if none selected
  const defaultDesigns = paretoFront.slice(0, 3).map(d => d.id);
  const designsToCompare = selectedDesigns.length >= 2 ? selectedDesigns : (defaultDesigns.length >= 2 ? defaultDesigns : ['A', 'B', 'C']);

  useEffect(() => {
    setLoading(true);
    compareDesigns(designsToCompare)
      .then((result) => setComparison(result as CompareResponse))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [designsToCompare.join(',')]);

  const handleSelectDesign = (id: string) => {
    setCurrentDesign(id);
    setScreen('viewer');
  };

  const handleExport = (id: string) => {
    setCurrentDesign(id);
    setScreen('export');
  };

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Design Comparison</h2>
        <p className="text-gray-600 mt-1">
          Compare performance metrics across selected designs.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="h-[450px]">
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={comparison.radar_data}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  value.charAt(0).toUpperCase() + value.slice(1)
                }
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              {comparison.designs.map((design, i) => (
                <Radar
                  key={design.id}
                  name={`Design ${design.id}`}
                  dataKey={design.id}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.2}
                />
              ))}
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Metrics</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-700">Metric</th>
                  {comparison.designs.map((d) => (
                    <th key={d.id} className="text-center py-2 px-4 font-medium text-gray-700">
                      Design {d.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.metrics.map((metric) => (
                  <tr key={metric.metric} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-600">{metric.metric}</td>
                    {comparison.designs.map((d) => {
                      const value = metric.values[d.id];
                      const isBest = metric.better === d.id;
                      return (
                        <td
                          key={d.id}
                          className={`text-center py-2 px-4 ${
                            isBest ? 'bg-green-50 text-green-700 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {isBest && <CheckCircle size={14} className="text-green-500" />}
                            {typeof value === 'number' ? value.toLocaleString() : value}
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

      {/* Design Cards */}
      <div className="grid grid-cols-3 gap-4">
        {comparison.designs.map((design, i) => (
          <Card key={design.id}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Design {design.id}</h3>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
            </div>

            <dl className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Weight:</dt>
                <dd className="font-medium">{design.weight_kg} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Cost:</dt>
                <dd className="font-medium">€{design.cost_eur.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Burst:</dt>
                <dd className="font-medium">{design.burst_pressure_bar} bar</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">P(Failure):</dt>
                <dd className="font-medium">{design.p_failure.toExponential(0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fatigue Life:</dt>
                <dd className="font-medium">{design.fatigue_life_cycles.toLocaleString()} cycles</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Stress Margin:</dt>
                <dd className="font-medium text-green-600">+{design.stress_margin_percent}%</dd>
              </div>
            </dl>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleSelectDesign(design.id)}
              >
                View 3D
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleExport(design.id)}
              >
                Export <ArrowRight className="ml-1" size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
