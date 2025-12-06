'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getOptimizationResults } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ParetoDesign } from '@/lib/types';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis,
} from 'recharts';
import { CheckCircle, ArrowRight } from 'lucide-react';

type XMetric = 'weight_kg' | 'cost_eur' | 'p_failure';
type YMetric = 'weight_kg' | 'cost_eur' | 'p_failure' | 'burst_pressure_bar';

const metricLabels: Record<string, string> = {
  weight_kg: 'Weight (kg)',
  cost_eur: 'Cost (€)',
  p_failure: 'P(Failure)',
  burst_pressure_bar: 'Burst Pressure (bar)',
};

export function ParetoScreen() {
  const {
    paretoFront,
    setParetoFront,
    selectedDesigns,
    toggleDesign,
    setCurrentDesign,
    setScreen,
  } = useAppStore();

  const [xMetric, setXMetric] = useState<XMetric>('weight_kg');
  const [yMetric, setYMetric] = useState<YMetric>('cost_eur');
  const [loading, setLoading] = useState(false);

  // Load Pareto data if not already loaded
  useEffect(() => {
    if (paretoFront.length === 0) {
      setLoading(true);
      getOptimizationResults('demo')
        .then((results) => {
          const data = results as { pareto_front: ParetoDesign[] };
          setParetoFront(data.pareto_front);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [paretoFront.length, setParetoFront]);

  const getColor = (design: ParetoDesign) => {
    if (selectedDesigns.includes(design.id)) return '#3B82F6';
    switch (design.trade_off_category) {
      case 'lightest':
        return '#10B981';
      case 'cheapest':
        return '#F59E0B';
      case 'recommended':
        return '#8B5CF6';
      case 'most_reliable':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const handleDotClick = (data: ParetoDesign) => {
    toggleDesign(data.id);
  };

  const handleViewDesign = (id: string) => {
    setCurrentDesign(id);
    setScreen('viewer');
  };

  const handleCompare = () => {
    if (selectedDesigns.length >= 2) {
      setScreen('compare');
    }
  };

  // Prepare chart data
  const chartData = paretoFront.map((d) => ({
    ...d,
    x: d[xMetric],
    y: d[yMetric as keyof ParetoDesign],
    z: selectedDesigns.includes(d.id) ? 200 : 100,
    fill: getColor(d),
  }));

  // Highlighted designs (categories)
  const highlights = paretoFront.filter((d) => d.trade_off_category);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pareto Explorer</h2>
          <p className="text-gray-600 mt-1">
            Explore trade-offs between weight, cost, and reliability. Click points to select.
          </p>
        </div>
        <Button onClick={handleCompare} disabled={selectedDesigns.length < 2}>
          Compare ({selectedDesigns.length}) <ArrowRight className="ml-2" size={16} />
        </Button>
      </div>

      {/* Axis Controls */}
      <Card padding="sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">X-Axis:</label>
            <select
              value={xMetric}
              onChange={(e) => setXMetric(e.target.value as XMetric)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="weight_kg">Weight (kg)</option>
              <option value="cost_eur">Cost (€)</option>
              <option value="p_failure">P(Failure)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Y-Axis:</label>
            <select
              value={yMetric}
              onChange={(e) => setYMetric(e.target.value as YMetric)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="cost_eur">Cost (€)</option>
              <option value="weight_kg">Weight (kg)</option>
              <option value="burst_pressure_bar">Burst Pressure (bar)</option>
              <option value="p_failure">P(Failure)</option>
            </select>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" /> Lightest
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" /> Cheapest
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-purple-500" /> Recommended
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" /> Most Reliable
            </span>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card padding="none" className="h-[500px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Loading Pareto data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                dataKey="x"
                name={metricLabels[xMetric]}
                tick={{ fontSize: 12 }}
                label={{
                  value: metricLabels[xMetric],
                  position: 'bottom',
                  offset: 40,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={metricLabels[yMetric]}
                tick={{ fontSize: 12 }}
                label={{
                  value: metricLabels[yMetric],
                  angle: -90,
                  position: 'left',
                  offset: 40,
                }}
              />
              <ZAxis type="number" dataKey="z" range={[60, 200]} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload as ParetoDesign;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm">
                      <div className="font-bold mb-2">Design {d.id}</div>
                      <div>Weight: {d.weight_kg} kg</div>
                      <div>Cost: €{d.cost_eur.toLocaleString()}</div>
                      <div>Burst: {d.burst_pressure_bar} bar</div>
                      <div>P(fail): {d.p_failure.toExponential(1)}</div>
                      {d.trade_off_category && (
                        <div className="mt-2 text-blue-600 font-medium capitalize">
                          {d.trade_off_category.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Legend />
              <Scatter
                name="Pareto Designs"
                data={chartData}
                fill="#6B7280"
                onClick={(data) => handleDotClick(data as unknown as ParetoDesign)}
                cursor="pointer"
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Highlighted Designs */}
      <div className="grid grid-cols-4 gap-4">
        {highlights.map((design) => (
          <Card
            key={design.id}
            className={`cursor-pointer transition-all ${
              selectedDesigns.includes(design.id)
                ? 'ring-2 ring-blue-500'
                : 'hover:shadow-md'
            }`}
            onClick={() => toggleDesign(design.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-full capitalize"
                style={{
                  backgroundColor:
                    design.trade_off_category === 'lightest'
                      ? '#D1FAE5'
                      : design.trade_off_category === 'cheapest'
                      ? '#FEF3C7'
                      : design.trade_off_category === 'recommended'
                      ? '#EDE9FE'
                      : '#FEE2E2',
                  color:
                    design.trade_off_category === 'lightest'
                      ? '#065F46'
                      : design.trade_off_category === 'cheapest'
                      ? '#92400E'
                      : design.trade_off_category === 'recommended'
                      ? '#5B21B6'
                      : '#991B1B',
                }}
              >
                {design.trade_off_category?.replace('_', ' ')}
              </span>
              {selectedDesigns.includes(design.id) && (
                <CheckCircle className="text-blue-500" size={18} />
              )}
            </div>
            <div className="text-lg font-bold mb-2">Design {design.id}</div>
            <dl className="text-sm space-y-1">
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
            </dl>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDesign(design.id);
              }}
            >
              View in 3D
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
